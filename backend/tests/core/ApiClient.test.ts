import { ApiClient, ApiClientError } from "../../src/core/ApiClient";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock isAxiosError
(axios.isAxiosError as unknown as jest.Mock) = jest.fn((error: unknown) => {
  return (
    error &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    (error as any).isAxiosError === true
  );
});

describe("ApiClient", () => {
  let mockAxiosInstance: {
    get: jest.Mock;
  };

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
    };
    mockedAxios.create = jest.fn(() => mockAxiosInstance as any);
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create axios instance with correct configuration", () => {
      const baseURL = "https://api.example.com";
      const defaultParams = { key: "value" };
      const timeoutMs = 5000;

      new ApiClient(baseURL, defaultParams, timeoutMs);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL,
        timeout: timeoutMs,
        params: defaultParams,
        validateStatus: expect.any(Function),
      });
    });

    it("should use default timeout if not provided", () => {
      const baseURL = "https://api.example.com";

      new ApiClient(baseURL);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL,
        timeout: 7000,
        params: undefined,
        validateStatus: expect.any(Function),
      });
    });
  });

  describe("get", () => {
    it("should return data on successful request", async () => {
      const client = new ApiClient("https://api.example.com");
      const mockData = { result: "success", data: [1, 2, 3] };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockData,
      });

      const result = await client.get("/endpoint", { param: "value" });

      expect(result).toEqual({ data: mockData, status: 200 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/endpoint", {
        params: { param: "value" },
        validateStatus: expect.any(Function),
      });
    });

    it("should return empty object on 204 No Content response", async () => {
      const client = new ApiClient("https://api.example.com");

      mockAxiosInstance.get.mockResolvedValue({
        status: 204,
        data: "",
      });

      const result = await client.get("/endpoint", { param: "value" });

      expect(result).toEqual({ data: {}, status: 204 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/endpoint", {
        params: { param: "value" },
        validateStatus: expect.any(Function),
      });
    });

    it("should throw ApiClientError with NON_200 code on non-200 status", async () => {
      const client = new ApiClient("https://api.example.com");

      mockAxiosInstance.get.mockResolvedValue({
        status: 404,
        data: { error: "Not found" },
      });

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "NON_200",
        status: 404,
        message: "Remote API responded with 404",
      });
    });

    it("should throw ApiClientError with INVALID code on null response data", async () => {
      const client = new ApiClient("https://api.example.com");

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: null,
      });

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "INVALID",
        message: "Remote API returned an invalid response structure",
      });
    });

    it("should throw ApiClientError with INVALID code on non-object response data", async () => {
      const client = new ApiClient("https://api.example.com");

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: "string response",
      });

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "INVALID",
        message: "Remote API returned an invalid response structure",
      });
    });

    it("should throw ApiClientError with TIMEOUT code on timeout error", async () => {
      const client = new ApiClient("https://api.example.com");
      const timeoutError: any = new Error("timeout");
      timeoutError.code = "ECONNABORTED";
      timeoutError.isAxiosError = true;

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "TIMEOUT",
        message: "Request timed out",
      });
    });

    it("should throw ApiClientError with NETWORK code on ENOTFOUND error", async () => {
      const client = new ApiClient("https://api.example.com");
      const networkError: any = new Error("DNS lookup failed");
      networkError.code = "ENOTFOUND";
      networkError.isAxiosError = true;

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "NETWORK",
        message: "Failed to connect to remote API",
      });
    });

    it("should throw ApiClientError with NETWORK code on ECONNREFUSED error", async () => {
      const client = new ApiClient("https://api.example.com");
      const connectionError: any = new Error("Connection refused");
      connectionError.code = "ECONNREFUSED";
      connectionError.isAxiosError = true;

      mockAxiosInstance.get.mockRejectedValue(connectionError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "NETWORK",
        message: "Failed to connect to remote API",
      });
    });

    it("should throw ApiClientError with NON_200 code when axios error has response", async () => {
      const client = new ApiClient("https://api.example.com");
      const axiosError: any = new Error("Bad request");
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 400,
        data: { error: "Bad request" },
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "NON_200",
        status: 400,
        message: "Remote API responded with 400",
      });
    });

    it("should throw ApiClientError with UNKNOWN code on non-axios errors", async () => {
      const client = new ApiClient("https://api.example.com");
      const genericError = new Error("Generic error");

      mockAxiosInstance.get.mockRejectedValue(genericError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "UNKNOWN",
        message: "Unexpected error occurred",
      });
    });

    it("should throw ApiClientError with UNKNOWN code on axios error without specific code", async () => {
      const client = new ApiClient("https://api.example.com");
      const axiosError: any = new Error("Unknown axios error");
      axiosError.isAxiosError = true;
      axiosError.message = "Some axios error";

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "UNKNOWN",
        message: "Some axios error",
      });
    });

    it("should throw ApiClientError with UNKNOWN code on axios error without message", async () => {
      const client = new ApiClient("https://api.example.com");
      const axiosError: any = new Error();
      axiosError.isAxiosError = true;
      axiosError.message = undefined;

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(client.get("/endpoint")).rejects.toThrow(ApiClientError);
      await expect(client.get("/endpoint")).rejects.toMatchObject({
        code: "UNKNOWN",
        message: "Unknown axios error",
      });
    });

    it("should call axios with validateStatus that allows status < 500", async () => {
      const client = new ApiClient("https://api.example.com");

      mockAxiosInstance.get.mockImplementation((_path, config) => {
        // Simulate validateStatus being called
        if (config?.validateStatus) {
          expect(config.validateStatus(200)).toBe(true);
          expect(config.validateStatus(404)).toBe(true);
          expect(config.validateStatus(499)).toBe(true);
          expect(config.validateStatus(500)).toBe(false);
          expect(config.validateStatus(503)).toBe(false);
        }
        return Promise.resolve({ status: 200, data: {} });
      });

      await client.get("/endpoint");
    });
  });
});
