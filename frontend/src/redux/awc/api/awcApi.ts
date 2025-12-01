import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWith401Handler } from "../baseQuery/baseQueryWith401Handler";
import type {
  GeoJSONFeatureCollection,
  SigmetQueryParams,
  AirsigmetQueryParams,
  AuthResponse,
} from "@/types";

export const awcApi = createApi({
  reducerPath: "awcApi",
  baseQuery: baseQueryWith401Handler,
  tagTypes: ["Sigmet", "Airsigmet"],

  endpoints: (builder) => ({
    loginGuest: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/auth/guest",
        method: "POST",
      }),
    }),

    getSigmet: builder.query<GeoJSONFeatureCollection, SigmetQueryParams>({
      query: (params) => ({
        url: "/sigmet",
        params,
      }),
      providesTags: ["Sigmet"],
      keepUnusedDataFor: 300,
    }),

    getAirsigmet: builder.query<GeoJSONFeatureCollection, AirsigmetQueryParams>(
      {
        query: (params) => ({
          url: "/airsigmet",
          params,
        }),
        providesTags: ["Airsigmet"],
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
