const API_BASE_URL = "https://casino.zsombor.dev";

export function apiPath(path) {
  return `${API_BASE_URL}${path}`;
}
