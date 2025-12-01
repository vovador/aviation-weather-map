/**
 * Format date to ISO string for API
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

/**
 * Get date range based on time offset hours
 * @param offsetHours Hours offset from now (negative for past, positive for future)
 * @returns Object with from and to dates (matching backend API parameter names)
 */
export const getDateRange = (offsetHours: number) => {
  const now = new Date();
  const from = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
  const to = new Date(from.getTime() + 6 * 60 * 60 * 1000); // 6 hours window

  return {
    from: formatDateForAPI(from),
    to: formatDateForAPI(to),
  };
};

/**
 * Format time offset for display
 */
export const formatTimeOffset = (hours: number): string => {
  if (hours === 0) return "Now";
  if (hours > 0) return `+${hours}h`;
  return `${hours}h`;
};
