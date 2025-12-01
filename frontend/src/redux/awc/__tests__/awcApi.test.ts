import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { awcApi } from "../api/awcApi";
import authReducer from "../../slices/authSlice";
import filtersReducer from "../../slices/filtersSlice";
import {
  API_ENDPOINTS,
  HTTP_METHODS,
  HTTP_HEADERS,
  HTTP_HEADER_VALUES,
  GEOJSON_TYPES,
} from "@/constants";

// Mock fetch API
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;

// Helper to create a mock Response with all required methods
const createMockResponse = (data: unknown): Response => {
  const jsonString = JSON.stringify(data);
  return {
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => jsonString,
    clone: function () {
      return createMockResponse(data);
    },
  } as Response;
};

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      filters: filtersReducer,
      [awcApi.reducerPath]: awcApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(awcApi.middleware),
  });
};

describe("awcApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  describe("loginGuest", () => {
    it("should call POST /auth/guest", async () => {
      const mockResponseData = {
        token: "test-token",
        expiresIn: 900,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponseData));

      const store = createTestStore();
      const result = await store.dispatch(
        awcApi.endpoints.loginGuest.initiate()
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(API_ENDPOINTS.AUTH_GUEST),
          method: HTTP_METHODS.POST,
        })
      );
      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.url).toContain(API_ENDPOINTS.AUTH_GUEST);
      expect(request.method).toBe(HTTP_METHODS.POST);
      expect(request.headers.get(HTTP_HEADERS.CONTENT_TYPE)).toBe(
        HTTP_HEADER_VALUES.APPLICATION_JSON
      );
      expect(result.data).toEqual(mockResponseData);
    });
  });

  describe("getSigmet", () => {
    it("should call GET /sigmet with query params", async () => {
      const mockResponseData = {
        type: GEOJSON_TYPES.FEATURE_COLLECTION,
        features: [],
      };

      const params = {
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T06:00:00Z",
        minAlt: "0",
        maxAlt: "48000",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponseData));

      const store = createTestStore();
      const result = await store.dispatch(
        awcApi.endpoints.getSigmet.initiate(params)
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: HTTP_METHODS.GET,
        })
      );
      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.url).toMatch(
        new RegExp(`${API_ENDPOINTS.SIGMET}\\?.*from=.*to=.*minAlt=.*maxAlt=`)
      );
      expect(request.method).toBe(HTTP_METHODS.GET);
      expect(request.headers.get(HTTP_HEADERS.CONTENT_TYPE)).toBe(
        HTTP_HEADER_VALUES.APPLICATION_JSON
      );
      expect(result.data).toEqual(mockResponseData);
    });
  });

  describe("getAirsigmet", () => {
    it("should call GET /airsigmet with query params", async () => {
      const mockResponseData = {
        type: GEOJSON_TYPES.FEATURE_COLLECTION,
        features: [],
      };

      const params = {
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T06:00:00Z",
        minAlt: "0",
        maxAlt: "48000",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponseData));

      const store = createTestStore();
      const result = await store.dispatch(
        awcApi.endpoints.getAirsigmet.initiate(params)
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: HTTP_METHODS.GET,
        })
      );
      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.url).toMatch(
        new RegExp(
          `${API_ENDPOINTS.AIRSIGMET}\\?.*from=.*to=.*minAlt=.*maxAlt=`
        )
      );
      expect(request.method).toBe(HTTP_METHODS.GET);
      expect(request.headers.get(HTTP_HEADERS.CONTENT_TYPE)).toBe(
        HTTP_HEADER_VALUES.APPLICATION_JSON
      );
      expect(result.data).toEqual(mockResponseData);
    });
  });
});
