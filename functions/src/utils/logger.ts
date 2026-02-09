/**
 * Structured Logging Utility
 * 
 * Provides a standardized way to log events in a format that easier to parse
 * and filter in Google Cloud Logging.
 */

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export interface LogEntry {
    severity: LogSeverity;
    message: string;
    context?: Record<string, any>;
    timestamp: string;
}

export class Logger {
    private static formatLog(severity: LogSeverity, message: string, context: Record<string, any> = {}): string {
        const entry: LogEntry = {
            severity,
            message,
            context,
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(entry);
    }

    /**
     * Logs general informational messages.
     * @param message The message to log.
     * @param context Optional additional data to include.
     */
    static info(message: string, context?: Record<string, any>): void {
        console.log(this.formatLog('INFO', message, context));
    }

    /**
     * Logs warning messages for non-critical issues.
     * @param message The warning message.
     * @param context Optional additional data.
     */
    static warn(message: string, context?: Record<string, any>): void {
        console.warn(this.formatLog('WARNING', message, context));
    }

    /**
     * Logs error messages for critical failures.
     * @param message The error message.
     * @param error The error object or string.
     * @param context Optional additional data.
     */
    static error(message: string, error?: any, context: Record<string, any> = {}): void {
        const errorContext = {
            ...context,
            error: error instanceof Error ? { message: error.message, stack: error.stack } : error
        };
        console.error(this.formatLog('ERROR', message, errorContext));
    }

    /**
     * Logs debug messages for development and troubleshooting.
     * @param message The debug message.
     * @param context Optional additional data.
     */
    static debug(message: string, context?: Record<string, any>): void {
        // In a real environment, you might check process.env.LOG_LEVEL here
        console.debug(this.formatLog('DEBUG', message, context));
    }
}
