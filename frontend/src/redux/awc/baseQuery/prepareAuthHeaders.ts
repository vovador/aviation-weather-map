// Inject token & common headers
import { STORAGE_KEYS, HTTP_HEADERS, HTTP_HEADER_VALUES } from "@/constants";

export function prepareAuthHeaders(headers: Headers) {
  headers.set(HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADER_VALUES.APPLICATION_JSON);
  const token = localStorage.getItem(STORAGE_KEYS.JWT);
  if (token)
    headers.set(
      HTTP_HEADERS.AUTHORIZATION,
      `${HTTP_HEADER_VALUES.BEARER_PREFIX}${token}`
    );
  return headers;
}
