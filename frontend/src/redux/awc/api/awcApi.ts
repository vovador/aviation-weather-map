import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWith401Handler } from "../baseQuery/baseQueryWith401Handler";
import type {
  GeoJSONFeatureCollection,
  SigmetQueryParams,
  AirsigmetQueryParams,
  AuthResponse,
} from "@/types";
import { API_ENDPOINTS, HTTP_METHODS, RTK_TAGS } from "@/constants";

export const awcApi = createApi({
  reducerPath: "awcApi",
  baseQuery: baseQueryWith401Handler,
  tagTypes: [RTK_TAGS.SIGMET, RTK_TAGS.AIRSIGMET],

  endpoints: (builder) => ({
    loginGuest: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH_GUEST,
        method: HTTP_METHODS.POST,
      }),
    }),

    getSigmet: builder.query<GeoJSONFeatureCollection, SigmetQueryParams>({
      query: (params) => ({
        url: API_ENDPOINTS.SIGMET,
        params,
      }),
      providesTags: [RTK_TAGS.SIGMET],
      keepUnusedDataFor: 300,
    }),

    getAirsigmet: builder.query<GeoJSONFeatureCollection, AirsigmetQueryParams>(
      {
        query: (params) => ({
          url: API_ENDPOINTS.AIRSIGMET,
          params,
        }),
        providesTags: [RTK_TAGS.AIRSIGMET],
        keepUnusedDataFor: 300,
      }
    ),
  }),
});

export const {
  useLoginGuestMutation,
  useGetSigmetQuery,
  useGetAirsigmetQuery,
} = awcApi;
