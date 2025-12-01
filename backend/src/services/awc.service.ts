import { env } from "../config/env";
import { AWCSigmetResponse, AWCAirsigmetResponse } from "../types/awc";
import { ApiClient, ApiClientError } from "../core/ApiClient";
import { AWCServiceError } from "../errors/AWCServiceError";
import { logger } from "../utils/logger";
import { createApiResponseSummary } from "../utils/apiResponseSummary";
import { AWC_API_PATHS } from "../constants/awcApiPaths";
import { API_ERROR_CODES } from "../constants/apiErrorCodes";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export class AWCService {
  // Accepting the transport layer as a dependency makes the service trivial to mock in tests.
  constructor(
    private readonly apiClient: ApiClient = new ApiClient(env.awcBaseUrl)
  ) {}

  async fetchSigmet(
    params: Record<string, string>
  ): Promise<AWCSigmetResponse> {
    // This method now focuses solely on aviation-domain work, delegating HTTP concerns to ApiClient.
    return this.execute<AWCSigmetResponse>(AWC_API_PATHS.SIGMET, params);
  }

  async fetchAirsigmet(
    params: Record<string, string>
  ): Promise<AWCAirsigmetResponse> {
    return this.execute<AWCAirsigmetResponse>(AWC_API_PATHS.AIRSIGMET, params);
  }

  private async execute<T>(
    url: string,
    params: Record<string, string>
  ): Promise<T> {
    try {
      const { data, status } = await this.apiClient.get<T>(url, params);

      // Log successful data fetch with summary
      const dataSummary = createApiResponseSummary(data);
      logger.debug("Successfully fetched data from API", {
        path: url,
        status: status,
        params,
        dataType: typeof data,
        dataSummary,
      });
      return data;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): Error {
    if (error instanceof ApiClientError) {
      switch (error.code) {
        case API_ERROR_CODES.TIMEOUT:
          return new AWCServiceError(
            HTTP_STATUS.GATEWAY_TIMEOUT,
            ERROR_MESSAGES.AWC_API_TIMED_OUT
          );
        case API_ERROR_CODES.NETWORK:
          return new AWCServiceError(
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            ERROR_MESSAGES.AWC_API_CONNECTION_FAILED
          );
        case API_ERROR_CODES.NON_200:
          return new AWCServiceError(
            error.status ?? HTTP_STATUS.BAD_GATEWAY,
            ERROR_MESSAGES.AWC_API_RETURNED_STATUS(error.status ?? "unknown")
          );
        case API_ERROR_CODES.INVALID:
          return new AWCServiceError(
            HTTP_STATUS.BAD_GATEWAY,
            ERROR_MESSAGES.AWC_API_INVALID_RESPONSE
          );
        default:
          return new AWCServiceError(
            HTTP_STATUS.BAD_GATEWAY,
            ERROR_MESSAGES.AWC_API_ERROR(error.message)
          );
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(ERROR_MESSAGES.AWC_API_UNKNOWN_ERROR);
  }
}
