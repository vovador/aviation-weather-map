import { AWCService } from "../../src/services/awc.service";
import { ApiClient, ApiClientError } from "../../src/core/ApiClient";
import { AWCServiceError } from "../../src/errors/AWCServiceError";

describe("AWC Service", () => {
  let service: AWCService;
  let mockApiClient: {
    get: jest.Mock;
  };

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
    };
    service = new AWCService(mockApiClient as unknown as ApiClient);
    jest.clearAllMocks();
  });

  describe("fetchSigmet", () => {
    it("should call apiClient.get with correct endpoint and params", async () => {
      const mockData = {
        sigmets: [
          {
            bulletinId: "TEST001",
            rawText: "Test SIGMET",
            hazard: { type: "TURBULENCE" },
          },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockData);

      const params = { region: "US", type: "SIGMET" };
      const result = await service.fetchSigmet(params);

      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledWith("/data/isigmet", params);
    });

    it("should map TIMEOUT ApiClientError to AWCServiceError with status 504", async () => {
      const timeoutError = new ApiClientError("TIMEOUT", "Request timed out");
      mockApiClient.get.mockRejectedValue(timeoutError);

      await expect(service.fetchSigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchSigmet({})).rejects.toMatchObject({
        statusCode: 504,
        message: "Request to AWC API timed out",
      });
    });

    it("should map NETWORK ApiClientError to AWCServiceError with status 503", async () => {
      const networkError = new ApiClientError(
        "NETWORK",
        "Failed to connect to remote API"
      );
      mockApiClient.get.mockRejectedValue(networkError);

      await expect(service.fetchSigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchSigmet({})).rejects.toMatchObject({
        statusCode: 503,
        message: "Failed to connect to AWC API",
      });
    });

    it("should map NON_200 ApiClientError to AWCServiceError with error status", async () => {
      const non200Error = new ApiClientError(
        "NON_200",
        "Remote API responded with 404",
        404
      );
      mockApiClient.get.mockRejectedValue(non200Error);

      await expect(service.fetchSigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchSigmet({})).rejects.toMatchObject({
        statusCode: 404,
        message: "AWC API returned status 404",
      });
    });

    it("should map NON_200 ApiClientError to AWCServiceError with default status 502 when status is undefined", async () => {
      const non200Error = new ApiClientError(
        "NON_200",
        "Remote API responded with unknown"
      );
      mockApiClient.get.mockRejectedValue(non200Error);

      await expect(service.fetchSigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchSigmet({})).rejects.toMatchObject({
        statusCode: 502,
        message: "AWC API returned status unknown",
      });
    });

    it("should map INVALID ApiClientError to AWCServiceError with status 502", async () => {
      const invalidError = new ApiClientError(
        "INVALID",
        "Remote API returned an invalid response structure"
      );
      mockApiClient.get.mockRejectedValue(invalidError);

      await expect(service.fetchSigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchSigmet({})).rejects.toMatchObject({
        statusCode: 502,
        message: "Invalid response structure from AWC API",
      });
    });

    it("should map unknown ApiClientError code to AWCServiceError with status 502", async () => {
      // Create an ApiClientError with an unknown code by casting
      const unknownError = new ApiClientError(
        "UNKNOWN" as any,
        "Some error message"
      );
      mockApiClient.get.mockRejectedValue(unknownError);

      await expect(service.fetchSigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchSigmet({})).rejects.toMatchObject({
        statusCode: 502,
        message: "AWC API error: Some error message",
      });
    });

    it("should pass through other Error types unchanged", async () => {
      const genericError = new Error("Generic error");
      mockApiClient.get.mockRejectedValue(genericError);

      await expect(service.fetchSigmet({})).rejects.toThrow("Generic error");
      await expect(service.fetchSigmet({})).rejects.toBe(genericError);
    });

    it("should handle unknown error types", async () => {
      const unknownError = "String error";
      mockApiClient.get.mockRejectedValue(unknownError);

      await expect(service.fetchSigmet({})).rejects.toThrow(
        "AWC API error: Unknown error"
      );
    });
  });

  describe("fetchAirsigmet", () => {
    it("should call apiClient.get with correct endpoint and params", async () => {
      const mockData = {
        airsigmets: [
          {
            bulletinId: "AIR001",
            rawText: "Test AIRSIGMET",
            hazard: { type: "TURBULENCE" },
          },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockData);

      const params = { region: "US" };
      const result = await service.fetchAirsigmet(params);

      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledWith("/data/airsigmet", params);
    });

    it("should map TIMEOUT ApiClientError to AWCServiceError with status 504", async () => {
      const timeoutError = new ApiClientError("TIMEOUT", "Request timed out");
      mockApiClient.get.mockRejectedValue(timeoutError);

      await expect(service.fetchAirsigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchAirsigmet({})).rejects.toMatchObject({
        statusCode: 504,
        message: "Request to AWC API timed out",
      });
    });

    it("should map NETWORK ApiClientError to AWCServiceError with status 503", async () => {
      const networkError = new ApiClientError(
        "NETWORK",
        "Failed to connect to remote API"
      );
      mockApiClient.get.mockRejectedValue(networkError);

      await expect(service.fetchAirsigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchAirsigmet({})).rejects.toMatchObject({
        statusCode: 503,
        message: "Failed to connect to AWC API",
      });
    });

    it("should map NON_200 ApiClientError to AWCServiceError with error status", async () => {
      const non200Error = new ApiClientError(
        "NON_200",
        "Remote API responded with 500",
        500
      );
      mockApiClient.get.mockRejectedValue(non200Error);

      await expect(service.fetchAirsigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchAirsigmet({})).rejects.toMatchObject({
        statusCode: 500,
        message: "AWC API returned status 500",
      });
    });

    it("should map INVALID ApiClientError to AWCServiceError with status 502", async () => {
      const invalidError = new ApiClientError(
        "INVALID",
        "Remote API returned an invalid response structure"
      );
      mockApiClient.get.mockRejectedValue(invalidError);

      await expect(service.fetchAirsigmet({})).rejects.toThrow(AWCServiceError);
      await expect(service.fetchAirsigmet({})).rejects.toMatchObject({
        statusCode: 502,
        message: "Invalid response structure from AWC API",
      });
    });
  });
});
