import axios, { AxiosInstance } from "axios";

type ApiClientErrorCode =
  | "TIMEOUT"
  | "NETWORK"
  | "NON_200"
  | "INVALID"
  | "UNKNOWN";

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
  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.get<T>(path, {
        params,
        validateStatus: (status) => status < 500,
      });

      if (response.status !== 200) {
        throw new ApiClientError(
          "NON_200",
          `Remote API responded with ${response.status}`,
          response.status
        );
      }

      if (!response.data || typeof response.data !== "object") {
        throw new ApiClientError(
          "INVALID",
          "Remote API returned an invalid response structure"
        );
      }

      return response.data;
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
      return new ApiClientError("UNKNOWN", "Unexpected error occurred");
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      return new ApiClientError("TIMEOUT", "Request timed out");
    }

    // Network failures (DNS, refused connections, etc.)
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return new ApiClientError("NETWORK", "Failed to connect to remote API");
    }

    // API returned non-2xx but <500 (allowed by validateStatus)
    if (error.response) {
      return new ApiClientError(
        "NON_200",
        `Remote API responded with ${error.response.status}`,
        error.response.status
      );
    }

    // Fallback
    return new ApiClientError(
      "UNKNOWN",
      error.message ?? "Unknown axios error"
    );
  }
}
