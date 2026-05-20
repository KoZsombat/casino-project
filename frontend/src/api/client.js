const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export function apiPath(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}
