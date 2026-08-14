export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.details = data.details;
    throw error;
  }

  return data;
}
