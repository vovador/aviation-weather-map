import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

/**
 * Configuration options for the useEmptyNotification hook.
 */
interface EmptyNotificationOptions {
  /** The API response data object (expected to have a `features` array) */
  data: any;
  /** Whether the API query completed successfully */
  isSuccess: boolean;
  /** Whether the API query is currently loading */
  loading: boolean;
  /** Whether the API query encountered an error */
  isError: boolean;
  /** Query parameters used to fetch the data (used for deduplication) */
  params: any;
  /** Whether to show notifications for this data source */
  enabled: boolean;
  /** Display label for the data source (e.g., "SIGMET", "AIRSIGMET") */
  label: string;
}

/**
 * Hook that displays a toast notification when API data is successfully loaded but contains no results.
 *
 * This hook monitors API query results and shows an informational toast when:
 * - The query succeeded (isSuccess = true)
 * - The data is not loading and has no errors
 * - The data object has no features (empty results)
 * - The feature is enabled
 *
 * The hook prevents duplicate notifications by tracking the params that triggered
 * the empty state. It only shows a notification once per unique set of query parameters.
 *
 * @param {EmptyNotificationOptions} options - Configuration options for the hook
 * @param {any} options.data - The API response data object (expected to have a `features` array)
 * @param {boolean} options.isSuccess - Whether the API query completed successfully
 * @param {boolean} options.loading - Whether the API query is currently loading
 * @param {boolean} options.isError - Whether the API query encountered an error
 * @param {any} options.params - Query parameters used to fetch the data (used for deduplication)
 * @param {boolean} options.enabled - Whether to show notifications for this data source
 * @param {string} options.label - Display label for the data source (e.g., "SIGMET", "AIRSIGMET")
 *
 * @example
 * ```tsx
 * const { data, isSuccess, isLoading, isError } = useGetSigmetQuery(queryParams);
 *
 * useEmptyNotification({
 *   data,
 *   isSuccess,
 *   loading: isLoading,
 *   isError,
 *   params: queryParams,
 *   enabled: showSigmet,
 *   label: "SIGMET",
 * });
 * ```
 */
export function useEmptyNotification({
  data,
  isSuccess,
  loading,
  isError,
  params,
  enabled,
  label,
}: EmptyNotificationOptions) {
  const notifiedRef = useRef("");

  useEffect(() => {
    if (!enabled || !isSuccess || loading || isError) return;

    const isEmpty = !data?.features?.length;
    const key = JSON.stringify(params);

    if (isEmpty && key !== notifiedRef.current) {
      notifiedRef.current = key;
      toast(`${label} has no matching results`, { icon: "ℹ️" });
    }

    if (!isEmpty) notifiedRef.current = "";
  }, [data, isSuccess, loading, isError, params, enabled, label]);
}
