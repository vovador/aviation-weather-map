/**
 * Centralized logging utility that conditionally logs based on environment.
 *
 * - debug() and log() only output in development mode
 * - warn() and error() always output (useful for production debugging)
 */
const isDevelopment =
  import.meta.env.MODE === "development" || import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) console.debug(...args);
  },
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args); // Always log warnings
  },
  error: (...args: any[]) => {
    console.error(...args); // Always log errors
  },
};
