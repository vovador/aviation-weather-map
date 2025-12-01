// Inject token & common headers
export function prepareAuthHeaders(headers: Headers) {
  headers.set("Content-Type", "application/json");
  const token = localStorage.getItem("jwt");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
