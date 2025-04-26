import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { logger, LogLevel } from '@/services/loggers';
import { useAuthStore } from '@/store/auth-store';

export function useLogging() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    // Set the current screen in the logger
    useEffect(() => {
        if (pathname) {
            logger.setScreen(pathname);
        }
    }, [pathname]);

    // Set the user ID in the logger
    useEffect(() => {
        logger.setUserId(user?.id || null);
    }, [user]);

    // Log methods
    const logDebug = (message: string, context?: Record<string, any>) => {
        logger.debug(message, context);
    };

    const logInfo = (message: string, context?: Record<string, any>) => {
        logger.info(message, context);
    };

    const logWarn = (message: string, context?: Record<string, any>) => {
        logger.warn(message, context);
    };

    const logError = (message: string, error?: any, context?: Record<string, any>) => {
        logger.error(message, error, context);
    };

    // Get all logs
    const getLogs = () => {
        return logger.getLogs();
    };

    // Clear all logs
    const clearLogs = async () => {
        await logger.clearLogs();
    };

    // Export logs as a string
    const exportLogs = () => {
        return logger.exportLogs();
    };

    return {
        logDebug,
        logInfo,
        logWarn,
        logError,
        getLogs,
        clearLogs,
        exportLogs,
        LogLevel
    };
}