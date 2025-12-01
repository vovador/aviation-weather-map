import { fetchBaseQuery, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { unauthorized } from "@/redux/slices/authSlice";
import { prepareAuthHeaders } from "./prepareAuthHeaders";
import { logRequest } from "./logRequest";
import { logResponse } from "./logResponse";
import { HTTP_METHODS, HTTP_STATUS } from "@/constants";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  prepareHeaders: prepareAuthHeaders,
});

export const baseQueryWith401Handler: BaseQueryFn = async (
  args,
  api,
  extra
) => {
  const started = performance.now();

  const isString = typeof args === "string";
  const url = isString ? args : (args as any).url;
  const method = isString
    ? HTTP_METHODS.GET
    : (args as any).method ?? HTTP_METHODS.GET;
  const params = !isString ? (args as any).params : undefined;

  logRequest(method, url, params);

  const result = await rawBaseQuery(args, api, extra);
  const duration = Math.round(performance.now() - started);

  // Handle unauthorized
  if (result.error?.status === HTTP_STATUS.UNAUTHORIZED) {
    console.error(
      `[RTK] ✗ ${method} ${url} UNAUTHORIZED (${duration}ms)`,
      result.error
    );
    api.dispatch(unauthorized());
    return result;
  }

  logResponse(method, url, duration, result);
  return result;
};
