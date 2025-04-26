import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Log levels
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

// Log entry interface
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    userId?: string;
    screen?: string;
    sessionId?: string;
}

// Configuration for the logger
interface LoggerConfig {
    maxLogs?: number;
    persistLogs?: boolean;
    remoteLogging?: boolean;
    minLevel?: LogLevel;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
    maxLogs: 1000,
    persistLogs: true,
    remoteLogging: false,
    minLevel: LogLevel.DEBUG,
};

// Storage key for logs
const LOGS_STORAGE_KEY = 'app_logs';
const SESSION_ID_KEY = 'session_id';

class Logger {
    private static instance: Logger;
    private logs: LogEntry[] = [];
    private config: LoggerConfig;
    private sessionId: string;
    private initialized = false;

    private constructor(config: LoggerConfig = DEFAULT_CONFIG) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.sessionId = this.generateSessionId();
    }

    /**
     * Get the logger instance (Singleton pattern)
     */
    public static getInstance(config?: LoggerConfig): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }

    /**
     * Initialize the logger
     */
    public async init(): Promise<void> {
        if (this.initialized) return;

        try {
            // Load session ID or create a new one
            const storedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
            if (storedSessionId) {
                this.sessionId = storedSessionId;
            } else {
                await AsyncStorage.setItem(SESSION_ID_KEY, this.sessionId);
            }

            // Load persisted logs if enabled
            if (this.config.persistLogs) {
                const storedLogs = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
                if (storedLogs) {
                    this.logs = JSON.parse(storedLogs);
                    // Trim logs if they exceed the maximum
                    if (this.logs.length > this.config.maxLogs!) {
                        this.logs = this.logs.slice(-this.config.maxLogs!);
                        await this.persistLogs();
                    }
                }
            }

            this.initialized = true;
            this.info('Logger initialized', { sessionId: this.sessionId });
        } catch (error) {
            console.error('Failed to initialize logger:', error);
        }
    }

    /**
     * Log a debug message
     */
    public debug(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    /**
     * Log an info message
     */
    public info(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.INFO, message, context);
    }

    /**
     * Log a warning message
     */
    public warn(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.WARN, message, context);
    }

    /**
     * Log an error message
     */
    public error(message: string, error?: any, context?: Record<string, any>): void {
        let errorContext = context || {};

        if (error) {
            errorContext = {
                ...errorContext,
                errorMessage: error.message || String(error),
                stack: error.stack,
            };
        }

        this.log(LogLevel.ERROR, message, errorContext);
    }

    /**
     * Log a message with the specified level
     */
    private log(level: LogLevel, message: string, context?: Record<string, any>): void {
        // Check if the log level is high enough to be logged
        if (this.shouldLog(level)) {
            const logEntry: LogEntry = {
                timestamp: new Date().toISOString(),
                level,
                message,
                context,
                sessionId: this.sessionId,
            };

            // Add the log entry to the in-memory logs
            this.logs.push(logEntry);

            // Trim logs if they exceed the maximum
            if (this.logs.length > this.config.maxLogs!) {
                this.logs = this.logs.slice(-this.config.maxLogs!);
            }

            // Log to console for development
            this.logToConsole(logEntry);

            // Persist logs if enabled
            if (this.config.persistLogs) {
                this.persistLogs();
            }

            // Send to remote logging service if enabled
            if (this.config.remoteLogging) {
                this.sendToRemoteLogging(logEntry);
            }
        }
    }

    /**
     * Check if a log level should be logged based on the minimum level
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const minLevelIndex = levels.indexOf(this.config.minLevel!);
        const currentLevelIndex = levels.indexOf(level);
        return currentLevelIndex >= minLevelIndex;
    }

    /**
     * Log to console for development
     */
    private logToConsole(logEntry: LogEntry): void {
        const { level, message, context } = logEntry;
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const contextStr = context ? JSON.stringify(context) : '';

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`[${timestamp}] [DEBUG] ${message}`, context || '');
                break;
            case LogLevel.INFO:
                console.info(`[${timestamp}] [INFO] ${message}`, context || '');
                break;
            case LogLevel.WARN:
                console.warn(`[${timestamp}] [WARN] ${message}`, context || '');
                break;
            case LogLevel.ERROR:
                console.error(`[${timestamp}] [ERROR] ${message}`, context || '');
                break;
        }
    }

    /**
     * Persist logs to AsyncStorage
     */
    private async persistLogs(): Promise<void> {
        try {
            await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs));
        } catch (error) {
            console.error('Failed to persist logs:', error);
        }
    }

    /**
     * Send logs to a remote logging service
     * This is a placeholder for future implementation with Firebase
     */
    private sendToRemoteLogging(logEntry: LogEntry): void {
        // This will be implemented when Firebase is integrated
        // For now, we'll just log that we would send this
        console.debug('Would send to remote logging:', logEntry);
    }

    /**
     * Get all logs
     */
    public getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Clear all logs
     */
    public async clearLogs(): Promise<void> {
        this.logs = [];
        if (this.config.persistLogs) {
            await AsyncStorage.removeItem(LOGS_STORAGE_KEY);
        }
        this.info('Logs cleared');
    }

    /**
     * Set the user ID for context in logs
     */
    public setUserId(userId: string | null): void {
        if (userId) {
            this.info('User ID set', { userId });
        } else {
            this.info('User ID cleared');
        }
    }

    /**
     * Set the current screen for context in logs
     */
    public setScreen(screen: string): void {
        this.debug('Screen changed', { screen });
    }

    /**
     * Generate a unique session ID
     */
    private generateSessionId(): string {
        return 'session_' +
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 9);
    }

    /**
     * Export logs as a string for sharing
     */
    public exportLogs(): string {
        return this.logs
            .map(log => {
                const date = new Date(log.timestamp).toLocaleString();
                const contextStr = log.context ? JSON.stringify(log.context) : '';
                return `[${date}] [${log.level}] ${log.message} ${contextStr}`;
            })
            .join('\n');
    }
}

// Export a singleton instance
export const logger = Logger.getInstance();

// Initialize logger when imported
logger.init().catch(error => {
    console.error('Failed to initialize logger:', error);
});

// Create a hook for using the logger in components
export function useLogger() {
    return logger;
}