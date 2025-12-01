import axios, { AxiosInstance } from "axios";
import { logger } from "../utils/logger";
import {
  API_ERROR_CODES,
  ApiClientErrorCode,
} from "../constants/apiErrorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { AXIOS_ERROR_CODES } from "../constants/axiosErrors";

export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiClientErrorCode,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Lightweight HTTP wrapper that centralizes shared transport logic.
 */
export class ApiClient {
  private readonly client: AxiosInstance;

  constructor(
    baseURL: string,
    defaultParams?: Record<string, unknown>,
    timeoutMs = 7000
  ) {
    this.client = axios.create({
      baseURL,
      timeout: timeoutMs,
      params: defaultParams,
      validateStatus: (status) => status < 500,
    });
  }

  /**
   * Generic GET helper.
   * Services should focus on domain logic — this takes care of
   * HTTP concerns and consistent error mapping.
   */
  async get<T>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T; status: number | string }> {
    try {
      const response = await this.client.get<T>(path, {
        params,
        validateStatus: (status) => status < 500,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new ApiClientError(
          API_ERROR_CODES.NON_200,
          ERROR_MESSAGES.REMOTE_API_RESPONDED_WITH(response.status),
          response.status
        );
      }

      // Handle 204 No Content - return empty object for normalization service
      if (response.status === 204) {
        logger.debug("API returned 204 No Content", {
          path,
          status: response.status,
          params,
        });
        return { data: {} as T, status: response.status };
      }

      if (!response.data || typeof response.data !== "object") {
        logger.error(`Remote API returned an invalid response structure}`, {
          responseStatus: response.status,
          responseData: response.data,
        });
        throw new ApiClientError(
          API_ERROR_CODES.INVALID,
          ERROR_MESSAGES.INVALID_RESPONSE_STRUCTURE
        );
      }

      return { data: response.data, status: response.status };
    } catch (err) {
      throw this.mapAxiosError(err);
    }
  }

  /**
   * Converts raw Axios errors into a consistent ApiClientError shape.
   * This keeps the main "get" flow clean and focused.
   */
  private mapAxiosError(error: unknown): ApiClientError {
    // If it's already an ApiClientError, return it as-is
    if (error instanceof ApiClientError) {
      return error;
    }

    if (!axios.isAxiosError(error)) {
      return new ApiClientError(
        API_ERROR_CODES.UNKNOWN,
        ERROR_MESSAGES.UNEXPECTED_ERROR_OCCURRED
      );
    }

    // Timeout
    if (error.code === AXIOS_ERROR_CODES.CONNECTION_ABORTED) {
      return new ApiClientError(
        API_ERROR_CODES.TIMEOUT,
        ERROR_MESSAGES.REQUEST_TIMED_OUT
      );
    }

    // Network failures (DNS, refused connections, etc.)
    if (
      error.code === AXIOS_ERROR_CODES.NOT_FOUND ||
      error.code === AXIOS_ERROR_CODES.CONNECTION_REFUSED
    ) {
      return new ApiClientError(
        API_ERROR_CODES.NETWORK,
        ERROR_MESSAGES.FAILED_TO_CONNECT_TO_REMOTE_API
      );
    }

    // API returned non-2xx but <500 (allowed by validateStatus)
    if (error.response) {
      return new ApiClientError(
        API_ERROR_CODES.NON_200,
        ERROR_MESSAGES.REMOTE_API_RESPONDED_WITH(error.response.status),
        error.response.status
      );
    }

    // Fallback
    return new ApiClientError(
      API_ERROR_CODES.UNKNOWN,
      error.message ?? ERROR_MESSAGES.UNKNOWN_AXIOS_ERROR
    );
  }
}
