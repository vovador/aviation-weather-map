import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Hook that displays an error toast notification when an API query fails.
 *
 * This hook monitors API query errors and automatically displays a user-friendly
 * error message via toast notifications. It extracts error messages from the error
 * object structure and falls back to a generic message if no specific error is found.
 *
 * The hook also logs the error to the console for debugging purposes.
 *
 * @param {any} error - The error object from the API query (typically from RTK Query)
 * @param {string} label - Display label for the data source (e.g., "SIGMET", "AIRSIGMET")
 *                         Used in both the toast message and console log
 *
 * @example
 * ```tsx
 * const { data, error } = useGetSigmetQuery(queryParams);
 *
 * useErrorToast(error, "SIGMET");
 * ```
 *
 * @remarks
 * The hook handles different error object structures:
 * - If error has an `error.data.error` property, it uses that message
 * - Otherwise, it falls back to a generic "Failed to load {label}" message
 */
export function useErrorToast(error: any, label: string) {
  useEffect(() => {
    if (!error) return;

    const msg =
      "error" in error
        ? error.error?.data?.error || `Failed to load ${label}`
        : `Failed to load ${label}`;

    toast.error(msg);
    console.error(`${label} error:`, error);
  }, [error, label]);
}
