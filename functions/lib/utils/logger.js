"use strict";
/**
 * Structured Logging Utility
 *
 * Provides a standardized way to log events in a format that easier to parse
 * and filter in Google Cloud Logging.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static formatLog(severity, message, context = {}) {
        const entry = {
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
    static info(message, context) {
        console.log(this.formatLog('INFO', message, context));
    }
    /**
     * Logs warning messages for non-critical issues.
     * @param message The warning message.
     * @param context Optional additional data.
     */
    static warn(message, context) {
        console.warn(this.formatLog('WARNING', message, context));
    }
    /**
     * Logs error messages for critical failures.
     * @param message The error message.
     * @param error The error object or string.
     * @param context Optional additional data.
     */
    static error(message, error, context = {}) {
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
    static debug(message, context) {
        console.debug(this.formatLog('DEBUG', message, context));
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map