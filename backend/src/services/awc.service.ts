import { env } from "../config/env";
import { AWCSigmetResponse, AWCAirsigmetResponse } from "../types/awc";
import { ApiClient, ApiClientError } from "../core/ApiClient";
import { AWCServiceError } from "../errors/AWCServiceError";
import { logger } from "../utils/logger";
import { createApiResponseSummary } from "../utils/apiResponseSummary";

export class AWCService {
  // Accepting the transport layer as a dependency makes the service trivial to mock in tests.
  constructor(
    private readonly apiClient: ApiClient = new ApiClient(env.awcBaseUrl)
  ) {}

  async fetchSigmet(
    params: Record<string, string>
  ): Promise<AWCSigmetResponse> {
    // This method now focuses solely on aviation-domain work, delegating HTTP concerns to ApiClient.
    return this.execute<AWCSigmetResponse>("/data/isigmet", params);
  }

  async fetchAirsigmet(
    params: Record<string, string>
  ): Promise<AWCAirsigmetResponse> {
    return this.execute<AWCAirsigmetResponse>("/data/airsigmet", params);
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
        case "TIMEOUT":
          return new AWCServiceError(504, "Request to AWC API timed out");
        case "NETWORK":
          return new AWCServiceError(503, "Failed to connect to AWC API");
        case "NON_200":
          return new AWCServiceError(
            error.status ?? 502,
            `AWC API returned status ${error.status ?? "unknown"}`
          );
        case "INVALID":
          return new AWCServiceError(
            502,
            "Invalid response structure from AWC API"
          );
        default:
          return new AWCServiceError(502, `AWC API error: ${error.message}`);
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("AWC API error: Unknown error");
  }
}
