import { useState, useCallback, useEffect } from 'react';
import { concurrentQueue, TaskPriority, TaskStatus, QueueTask } from '@/services/concurrent-queue';
import { logger } from '@/services/logger';

interface UseConcurrentOperationsProps {
    onTaskComplete?: (taskId: string, result: any) => void;
    onTaskFail?: (taskId: string, error: any) => void;
}

export function useConcurrentOperations({
                                            onTaskComplete,
                                            onTaskFail
                                        }: UseConcurrentOperationsProps = {}) {
    const [tasks, setTasks] = useState<QueueTask[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState(concurrentQueue.getStats());

    // Update tasks and stats when they change
    const updateTasksAndStats = useCallback(() => {
        setTasks(concurrentQueue.getAllTasks());
        setStats(concurrentQueue.getStats());
        setIsProcessing(stats.running > 0);
    }, []);

    // Set up listener for task updates
    useEffect(() => {
        const listenerId = 'concurrent-operations-hook';

        concurrentQueue.addListener(listenerId, (task) => {
            // Update tasks and stats
            updateTasksAndStats();

            // Call callbacks for completed or failed tasks
            if (task.status === TaskStatus.COMPLETED && onTaskComplete) {
                onTaskComplete(task.id, task.result);
            } else if (task.status === TaskStatus.FAILED && onTaskFail) {
                onTaskFail(task.id, task.error);
            }
        });

        // Initial update
        updateTasksAndStats();

        return () => {
            concurrentQueue.removeListener(listenerId);
        };
    }, [onTaskComplete, onTaskFail, updateTasksAndStats]);

    // Execute a function concurrently
    const executeConcurrently = useCallback(<T>(
        fn: () => Promise<T>,
        options: {
            priority?: TaskPriority;
            maxRetries?: number;
            description?: string;
        } = {}
    ): string => {
        const { description, ...queueOptions } = options;

        if (description) {
            logger.debug('Enqueueing concurrent operation', { description });
        }

        return concurrentQueue.enqueue(fn, queueOptions);
    }, []);

    // Cancel a task
    const cancelTask = useCallback((taskId: string): boolean => {
        const result = concurrentQueue.cancelTask(taskId);
        if (result) {
            updateTasksAndStats();
        }
        return result;
    }, [updateTasksAndStats]);

    // Clear completed tasks
    const clearCompletedTasks = useCallback(() => {
        concurrentQueue.clearCompletedTasks();
        updateTasksAndStats();
    }, [updateTasksAndStats]);

    // Pause the queue
    const pauseQueue = useCallback(() => {
        concurrentQueue.pause();
        updateTasksAndStats();
    }, [updateTasksAndStats]);

    // Resume the queue
    const resumeQueue = useCallback(() => {
        concurrentQueue.resume();
        updateTasksAndStats();
    }, [updateTasksAndStats]);

    return {
        executeConcurrently,
        cancelTask,
        clearCompletedTasks,
        pauseQueue,
        resumeQueue,
        tasks,
        isProcessing,
        stats
    };
}