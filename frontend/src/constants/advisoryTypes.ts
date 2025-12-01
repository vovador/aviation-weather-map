/**
 * Advisory type constants
 */
export const ADVISORY_TYPE = {
  SIGMET: "SIGMET",
  AIRSIGMET: "AIRSIGMET",
} as const;

/**
 * Advisory type labels for display
 */
export const ADVISORY_TYPE_LABEL = {
  SIGMET: "SIGMET",
  AIRSIGMET: "AIRSIGMET",
} as const;

/**
 * Advisory type values as a union type
 */
export type AdvisoryTypeValue =
  (typeof ADVISORY_TYPE)[keyof typeof ADVISORY_TYPE];
