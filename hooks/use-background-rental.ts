import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backgroundTaskManager, TaskType, TaskStatus } from '@/components/background-task';
import { logger } from '@/components/loggers';
import { useRentalStore } from '@/components/rental-store';
import { ActiveRental } from '@/components';

// Storage key for the last processed time
const LAST_PROCESSED_TIME_KEY = 'last_rental_processed_time';

export function useBackgroundRental() {
    const {
        activeRental,
        loadActiveRental,
        getCurrentCost,
        getRentalDuration
    } = useRentalStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [lastProcessedTime, setLastProcessedTime] = useState<number | null>(null);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    // Initialize background rental tracking
    useEffect(() => {
        // Load the last processed time
        const loadLastProcessedTime = async () => {
            try {
                const storedTime = await AsyncStorage.getItem(LAST_PROCESSED_TIME_KEY);
                if (storedTime) {
                    setLastProcessedTime(parseInt(storedTime, 10));
                }
            } catch (error) {
                logger.error('Failed to load last processed time', error);
            }
        };

        // Register the rental timer task handler
        backgroundTaskManager.registerTaskHandler(
            TaskType.RENTAL_TIMER,
            async (task) => {
                try {
                    // Get the active rental from the task data
                    const rental = task.data.rental as ActiveRental;
                    if (!rental) {
                        return { success: false, error: 'No active rental in task data' };
                    }

                    // Calculate the current cost and duration
                    const startDate = new Date(rental.startTime);
                    const now = new Date();
                    const durationMs = now.getTime() - startDate.getTime();
                    const durationMinutes = Math.floor(durationMs / (1000 * 60));

                    // Calculate cost (minimum 20, then 20 per hour)
                    const cost = Math.max(20, Math.ceil(durationMinutes / 60) * 20);

                    // Format duration
                    const hours = Math.floor(durationMinutes / 60);
                    const minutes = durationMinutes % 60;
                    const seconds = Math.floor((durationMs / 1000) % 60);
                    const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                    // Send a notification if the cost has increased
                    if (cost > rental.currentCost) {
                        await backgroundTaskManager.sendNotification(
                            'Bike Rental Update',
                            `Your rental has been running for ${durationStr}. Current cost: ₱${cost}`
                        );
                    }

                    // Update the last processed time
                    const now_ms = now.getTime();
                    await AsyncStorage.setItem(LAST_PROCESSED_TIME_KEY, now_ms.toString());
                    setLastProcessedTime(now_ms);

                    return {
                        success: true,
                        data: {
                            cost,
                            duration: durationStr,
                            processedAt: now.toISOString()
                        }
                    };
                } catch (error) {
                    logger.error('Error processing rental timer task', error);
                    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
                }
            }
        );

        // Set up app state change listener
        const subscription = AppState.addEventListener('change', nextAppState => {
            setAppState(nextAppState);

            // If app is coming to foreground and we have an active rental
            if (
                appState.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // Reload the active rental
                loadActiveRental();
            }
        });

        loadLastProcessedTime();

        return () => {
            subscription.remove();
        };
    }, [appState]);

    // Schedule background task when active rental changes
    useEffect(() => {
        if (activeRental) {
            logger.info('Active rental detected, scheduling background task', {
                bikeId: activeRental.bikeId,
                startTime: activeRental.startTime
            });

            // Schedule a background task to track the rental
            const scheduleTask = async () => {
                setIsProcessing(true);
                try {
                    // Check if there's already a running task
                    const runningTasks = backgroundTaskManager.getTasksByType(TaskType.RENTAL_TIMER)
                        .filter(task => task.status === TaskStatus.RUNNING || task.status === TaskStatus.SCHEDULED);

                    if (runningTasks.length === 0) {
                        // Schedule a new task
                        await backgroundTaskManager.scheduleTask(TaskType.RENTAL_TIMER, {
                            rental: activeRental,
                            scheduledAt: new Date().toISOString()
                        });
                        logger.debug('Scheduled rental timer task');
                    } else {
                        logger.debug('Rental timer task already running', { taskCount: runningTasks.length });
                    }
                } catch (error) {
                    logger.error('Failed to schedule rental timer task', error);
                } finally {
                    setIsProcessing(false);
                }
            };

            scheduleTask();

            // Set up an interval to schedule the task periodically
            const intervalId = setInterval(() => {
                if (activeRental) {
                    scheduleTask();
                } else {
                    clearInterval(intervalId);
                }
            }, 60000); // Schedule every minute

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [activeRental]);

    return {
        isProcessing,
        lastProcessedTime,
        appState
    };
}