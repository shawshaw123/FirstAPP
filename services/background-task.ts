import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { logger } from '@/services/loggers';

// Storage keys
const BACKGROUND_TASKS_KEY = 'background_tasks';
const LAST_FOREGROUND_TIME_KEY = 'last_foreground_time';

// Task types
export enum TaskType {
    RENTAL_TIMER = 'RENTAL_TIMER',
    LOCATION_TRACKING = 'LOCATION_TRACKING',
    DATA_SYNC = 'DATA_SYNC',
}

// Task status
export enum TaskStatus {
    SCHEDULED = 'SCHEDULED',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

// Task interface
export interface BackgroundTask {
    id: string;
    type: TaskType;
    status: TaskStatus;
    data: any;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    error?: string;
}

// Task result interface
export interface TaskResult {
    success: boolean;
    data?: any;
    error?: string;
}

// Task handler type
type TaskHandler = (task: BackgroundTask) => Promise<TaskResult>;

class BackgroundTaskManager {
    private static instance: BackgroundTaskManager;
    private tasks: Record<string, BackgroundTask> = {};
    private handlers: Record<TaskType, TaskHandler> = {} as Record<TaskType, TaskHandler>;
    private appState: AppStateStatus = 'active';
    private initialized = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private lastForegroundTime: number = Date.now();

    private constructor() {
        // Initialize app state listener
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    /**
     * Get the background task manager instance (Singleton pattern)
     */
    public static getInstance(): BackgroundTaskManager {
        if (!BackgroundTaskManager.instance) {
            BackgroundTaskManager.instance = new BackgroundTaskManager();
        }
        return BackgroundTaskManager.instance;
    }

    /**
     * Initialize the background task manager
     */
    public async init(): Promise<void> {
        if (this.initialized) return;

        try {
            logger.info('Initializing background task manager');

            // Load tasks from storage
            const storedTasks = await AsyncStorage.getItem(BACKGROUND_TASKS_KEY);
            if (storedTasks) {
                this.tasks = JSON.parse(storedTasks);
                logger.debug('Loaded background tasks', { count: Object.keys(this.tasks).length });
            }

            // Load last foreground time
            const storedLastForegroundTime = await AsyncStorage.getItem(LAST_FOREGROUND_TIME_KEY);
            if (storedLastForegroundTime) {
                this.lastForegroundTime = parseInt(storedLastForegroundTime, 10);
            }

            // Configure notifications for background tasks
            await this.configureNotifications();

            // Start processing interval
            this.startProcessingInterval();

            this.initialized = true;
            logger.info('Background task manager initialized');
        } catch (error) {
            logger.error('Failed to initialize background task manager', error);
        }
    }

    /**
     * Configure notifications for background tasks
     */
    private async configureNotifications(): Promise<void> {
        if (Platform.OS !== 'web') {
            await Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                }),
            });
        }
    }

    /**
     * Handle app state changes
     */
    private handleAppStateChange = (nextAppState: AppStateStatus): void => {
        logger.debug('App state changed', { from: this.appState, to: nextAppState });

        // If app is coming to foreground
        if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
            const now = Date.now();
            const timeInBackground = now - this.lastForegroundTime;
            logger.info('App came to foreground', { timeInBackground: `${timeInBackground / 1000}s` });

            // Process tasks that might have been scheduled while in background
            this.processBackgroundTasks();
        }
        // If app is going to background
        else if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
            this.lastForegroundTime = Date.now();
            AsyncStorage.setItem(LAST_FOREGROUND_TIME_KEY, this.lastForegroundTime.toString());
            logger.info('App went to background');
        }

        this.appState = nextAppState;
    };

    /**
     * Start the processing interval
     */
    private startProcessingInterval(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }

        // Process tasks every 15 seconds
        this.processingInterval = setInterval(() => {
            this.processBackgroundTasks();
        }, 15000);
    }

    /**
     * Process background tasks
     */
    private async processBackgroundTasks(): Promise<void> {
        try {
            const runningTasks = Object.values(this.tasks).filter(
                task => task.status === TaskStatus.RUNNING || task.status === TaskStatus.SCHEDULED
            );

            if (runningTasks.length === 0) return;

            logger.debug('Processing background tasks', { count: runningTasks.length });

            for (const task of runningTasks) {
                if (task.status === TaskStatus.SCHEDULED) {
                    // Update task status to running
                    this.updateTaskStatus(task.id, TaskStatus.RUNNING);
                }

                // Check if we have a handler for this task type
                const handler = this.handlers[task.type];
                if (!handler) {
                    logger.warn('No handler for task type', { type: task.type, taskId: task.id });
                    continue;
                }

                try {
                    // Execute the task handler
                    const result = await handler(task);

                    if (result.success) {
                        // If task completed successfully
                        this.completeTask(task.id, result.data);
                    } else {
                        // If task failed
                        this.failTask(task.id, result.error || 'Unknown error');
                    }
                } catch (error) {
                    // If task execution threw an error
                    logger.error('Error executing background task', error, { taskId: task.id });
                    this.failTask(task.id, error instanceof Error ? error.message : 'Unknown error');
                }
            }

            // Save tasks to storage
            await this.persistTasks();
        } catch (error) {
            logger.error('Error processing background tasks', error);
        }
    }

    /**
     * Register a task handler
     */
    public registerTaskHandler(type: TaskType, handler: TaskHandler): void {
        this.handlers[type] = handler;
        logger.debug('Registered task handler', { type });
    }

    /**
     * Schedule a new background task
     */
    public async scheduleTask(type: TaskType, data: any): Promise<string> {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const task: BackgroundTask = {
            id: taskId,
            type,
            status: TaskStatus.SCHEDULED,
            data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.tasks[taskId] = task;
        await this.persistTasks();

        logger.info('Scheduled background task', { taskId, type });

        // Process immediately if we have a handler
        if (this.handlers[type]) {
            this.processBackgroundTasks();
        }

        return taskId;
    }

    /**
     * Update a task's status
     */
    private updateTaskStatus(taskId: string, status: TaskStatus): void {
        const task = this.tasks[taskId];
        if (task) {
            task.status = status;
            task.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Mark a task as completed
     */
    private completeTask(taskId: string, data?: any): void {
        const task = this.tasks[taskId];
        if (task) {
            task.status = TaskStatus.COMPLETED;
            task.completedAt = new Date().toISOString();
            task.updatedAt = new Date().toISOString();
            if (data) {
                task.data = { ...task.data, result: data };
            }
            logger.debug('Task completed', { taskId });
        }
    }

    /**
     * Mark a task as failed
     */
    private failTask(taskId: string, error: string): void {
        const task = this.tasks[taskId];
        if (task) {
            task.status = TaskStatus.FAILED;
            task.error = error;
            task.updatedAt = new Date().toISOString();
            logger.warn('Task failed', { taskId, error });
        }
    }

    /**
     * Cancel a task
     */
    public async cancelTask(taskId: string): Promise<boolean> {
        const task = this.tasks[taskId];
        if (task && (task.status === TaskStatus.SCHEDULED || task.status === TaskStatus.RUNNING)) {
            task.status = TaskStatus.CANCELLED;
            task.updatedAt = new Date().toISOString();
            await this.persistTasks();
            logger.info('Task cancelled', { taskId });
            return true;
        }
        return false;
    }

    /**
     * Get a task by ID
     */
    public getTask(taskId: string): BackgroundTask | null {
        return this.tasks[taskId] || null;
    }

    /**
     * Get all tasks
     */
    public getAllTasks(): BackgroundTask[] {
        return Object.values(this.tasks);
    }

    /**
     * Get tasks by type
     */
    public getTasksByType(type: TaskType): BackgroundTask[] {
        return Object.values(this.tasks).filter(task => task.type === type);
    }

    /**
     * Get tasks by status
     */
    public getTasksByStatus(status: TaskStatus): BackgroundTask[] {
        return Object.values(this.tasks).filter(task => task.status === status);
    }

    /**
     * Persist tasks to storage
     */
    private async persistTasks(): Promise<void> {
        try {
            await AsyncStorage.setItem(BACKGROUND_TASKS_KEY, JSON.stringify(this.tasks));
        } catch (error) {
            logger.error('Failed to persist tasks', error);
        }
    }

    /**
     * Clean up completed and failed tasks
     */
    public async cleanupTasks(olderThan: number = 24 * 60 * 60 * 1000): Promise<void> {
        const now = Date.now();
        const tasksToKeep: Record<string, BackgroundTask> = {};

        Object.values(this.tasks).forEach(task => {
            // Keep tasks that are still running or scheduled
            if (task.status === TaskStatus.RUNNING || task.status === TaskStatus.SCHEDULED) {
                tasksToKeep[task.id] = task;
                return;
            }

            // For completed, failed, or cancelled tasks, check age
            const updatedAt = new Date(task.updatedAt).getTime();
            if (now - updatedAt < olderThan) {
                tasksToKeep[task.id] = task;
            }
        });

        const removedCount = Object.keys(this.tasks).length - Object.keys(tasksToKeep).length;
        if (removedCount > 0) {
            this.tasks = tasksToKeep;
            await this.persistTasks();
            logger.info('Cleaned up tasks', { removedCount });
        }
    }

    /**
     * Send a notification for a task
     */
    public async sendNotification(title: string, body: string, data?: any): Promise<void> {
        if (Platform.OS === 'web') {
            logger.debug('Notifications not supported on web', { title, body });
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                },
                trigger: null, // Send immediately
            });
            logger.debug('Sent notification', { title });
        } catch (error) {
            logger.error('Failed to send notification', error, { title });
        }
    }
}

// Export a singleton instance
export const backgroundTaskManager = BackgroundTaskManager.getInstance();

// Initialize when imported
backgroundTaskManager.init().catch(error => {
    console.error('Failed to initialize background task manager:', error);
});