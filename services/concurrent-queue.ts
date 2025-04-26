import { logger } from '@/services/loggers';

// Task priority levels
export enum TaskPriority {
    HIGH = 0,
    NORMAL = 1,
    LOW = 2,
}

// Task status
export enum TaskStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

// Task interface
export interface QueueTask<T = any> {
    id: string;
    execute: () => Promise<T>;
    priority: TaskPriority;
    status: TaskStatus;
    result?: T;
    error?: any;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    retries: number;
    maxRetries: number;
}

// Queue options
export interface QueueOptions {
    concurrency: number;
    maxRetries: number;
    retryDelay: number;
}

// Default queue options
const DEFAULT_OPTIONS: QueueOptions = {
    concurrency: 3,
    maxRetries: 3,
    retryDelay: 1000,
};

/**
 * A concurrent task queue that can execute multiple tasks in parallel
 */
export class ConcurrentQueue {
    private static instance: ConcurrentQueue;
    private tasks: QueueTask[] = [];
    private running: number = 0;
    private options: QueueOptions;
    private paused: boolean = false;
    private listeners: Map<string, (task: QueueTask) => void> = new Map();

    private constructor(options: Partial<QueueOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        logger.info('Concurrent queue initialized', { options: this.options });
    }

    /**
     * Get the queue instance (Singleton pattern)
     */
    public static getInstance(options?: Partial<QueueOptions>): ConcurrentQueue {
        if (!ConcurrentQueue.instance) {
            ConcurrentQueue.instance = new ConcurrentQueue(options);
        }
        return ConcurrentQueue.instance;
    }

    /**
     * Add a task to the queue
     */
    public enqueue<T>(
        execute: () => Promise<T>,
        options: {
            priority?: TaskPriority;
            maxRetries?: number;
        } = {}
    ): string {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const task: QueueTask<T> = {
            id: taskId,
            execute,
            priority: options.priority ?? TaskPriority.NORMAL,
            status: TaskStatus.PENDING,
            createdAt: Date.now(),
            retries: 0,
            maxRetries: options.maxRetries ?? this.options.maxRetries,
        };

        this.tasks.push(task);
        logger.debug('Task added to queue', { taskId, priority: task.priority });

        // Sort tasks by priority
        this.sortTasks();

        // Start processing if not paused
        if (!this.paused) {
            this.processQueue();
        }

        return taskId;
    }

    /**
     * Sort tasks by priority (lower number = higher priority)
     */
    private sortTasks(): void {
        this.tasks.sort((a, b) => {
            // First by priority
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            // Then by creation time (older first)
            return a.createdAt - b.createdAt;
        });
    }

    /**
     * Process the queue
     */
    private processQueue(): void {
        if (this.paused) return;

        // Check if we can run more tasks
        while (this.running < this.options.concurrency && this.tasks.length > 0) {
            // Find the next pending task
            const taskIndex = this.tasks.findIndex(task => task.status === TaskStatus.PENDING);
            if (taskIndex === -1) break;

            const task = this.tasks[taskIndex];
            this.executeTask(task);
        }
    }

    /**
     * Execute a task
     */
    private async executeTask(task: QueueTask): Promise<void> {
        // Update task status
        task.status = TaskStatus.RUNNING;
        task.startedAt = Date.now();
        this.running++;

        logger.debug('Executing task', { taskId: task.id });
        this.notifyListeners(task);

        try {
            // Execute the task
            const result = await task.execute();

            // Task completed successfully
            task.status = TaskStatus.COMPLETED;
            task.result = result;
            task.completedAt = Date.now();
            logger.debug('Task completed', { taskId: task.id });
        } catch (error) {
            // Task failed
            logger.warn('Task failed', { taskId: task.id, error });

            // Check if we should retry
            if (task.retries < task.maxRetries) {
                task.retries++;
                task.status = TaskStatus.PENDING;
                logger.debug('Retrying task', { taskId: task.id, retry: task.retries });

                // Delay before retry
                setTimeout(() => {
                    this.processQueue();
                }, this.options.retryDelay);
            } else {
                // Max retries reached
                task.status = TaskStatus.FAILED;
                task.error = error;
                task.completedAt = Date.now();
                logger.error('Task failed after max retries', error, { taskId: task.id });
            }
        } finally {
            this.running--;
            this.notifyListeners(task);

            // Continue processing the queue
            this.processQueue();
        }
    }

    /**
     * Cancel a task
     */
    public cancelTask(taskId: string): boolean {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;

        const task = this.tasks[taskIndex];

        // Only cancel pending tasks
        if (task.status !== TaskStatus.PENDING) return false;

        task.status = TaskStatus.CANCELLED;
        logger.info('Task cancelled', { taskId });
        this.notifyListeners(task);
        return true;
    }

    /**
     * Get a task by ID
     */
    public getTask(taskId: string): QueueTask | undefined {
        return this.tasks.find(task => task.id === taskId);
    }

    /**
     * Get all tasks
     */
    public getAllTasks(): QueueTask[] {
        return [...this.tasks];
    }

    /**
     * Get tasks by status
     */
    public getTasksByStatus(status: TaskStatus): QueueTask[] {
        return this.tasks.filter(task => task.status === status);
    }

    /**
     * Pause the queue
     */
    public pause(): void {
        if (!this.paused) {
            this.paused = true;
            logger.info('Queue paused');
        }
    }

    /**
     * Resume the queue
     */
    public resume(): void {
        if (this.paused) {
            this.paused = false;
            logger.info('Queue resumed');
            this.processQueue();
        }
    }

    /**
     * Clear completed and failed tasks
     */
    public clearCompletedTasks(): void {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(
            task => task.status !== TaskStatus.COMPLETED &&
                task.status !== TaskStatus.FAILED &&
                task.status !== TaskStatus.CANCELLED
        );
        const removedCount = initialLength - this.tasks.length;
        logger.info('Cleared completed tasks', { removedCount });
    }

    /**
     * Add a listener for task updates
     */
    public addListener(id: string, callback: (task: QueueTask) => void): void {
        this.listeners.set(id, callback);
    }

    /**
     * Remove a listener
     */
    public removeListener(id: string): void {
        this.listeners.delete(id);
    }

    /**
     * Notify all listeners about a task update
     */
    private notifyListeners(task: QueueTask): void {
        this.listeners.forEach(callback => {
            try {
                callback(task);
            } catch (error) {
                logger.error('Error in task listener', error);
            }
        });
    }

    /**
     * Get queue statistics
     */
    public getStats(): {
        pending: number;
        running: number;
        completed: number;
        failed: number;
        cancelled: number;
        total: number;
    } {
        return {
            pending: this.tasks.filter(task => task.status === TaskStatus.PENDING).length,
            running: this.running,
            completed: this.tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
            failed: this.tasks.filter(task => task.status === TaskStatus.FAILED).length,
            cancelled: this.tasks.filter(task => task.status === TaskStatus.CANCELLED).length,
            total: this.tasks.length,
        };
    }
}

// Export a singleton instance
export const concurrentQueue = ConcurrentQueue.getInstance();