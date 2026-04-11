// Development-only logging utility
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
    log: (...args: unknown[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    error: (...args: unknown[]) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },
    warn: (...args: unknown[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    info: (...args: unknown[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args: unknown[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    }
};

// For production monitoring (send to service like Sentry)
export const logProduction = {
    error: (error: Error, context?: Record<string, unknown>) => {
        // TODO: Send to Sentry or other error tracking service
        if (!isDevelopment) {
            // Example: Sentry.captureException(error, { extra: context });
        }
    },
    event: (eventName: string, data?: Record<string, unknown>) => {
        // TODO: Send to analytics service
        if (!isDevelopment) {
            // Example: analytics.track(eventName, data);
        }
    }
};
