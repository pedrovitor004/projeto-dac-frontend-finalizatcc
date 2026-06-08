import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { clearStoredUser } from "../lib/session";

export class ApiError extends Error {
  constructor(message, { status, body, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

function isAuthEndpoint(url = "") {
  return (
    url === "/auth/login" ||
    url.startsWith("/auth/login?") ||
    url === "/auth/register" ||
    url.startsWith("/auth/register?")
  );
}

function extractErrorMessage(status, body) {
  if (!body) return `Erro HTTP ${status}`;
  if (typeof body === "string") return body;

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }

  if (Array.isArray(body.errors) && body.errors.length) {
    const first = body.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first.defaultMessage === "string") {
      return first.defaultMessage;
    }
  }

  try {
    const serialized = JSON.stringify(body);
    if (serialized && serialized !== "{}") return serialized;
  } catch {
    // Keep the generic fallback below.
  }

  return `Erro HTTP ${status}`;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if ((status === 401 || status === 403) && !isAuthEndpoint(url)) {
      clearStoredUser();
      window.location.href = "/login";
      return Promise.reject(
        new ApiError("Sessao expirada", {
          status,
          body: error.response?.data,
          url,
        }),
      );
    }

    if (error.response) {
      const body = error.response.data;
      const message = extractErrorMessage(status, body);

      return Promise.reject(
        new ApiError(message, {
          status,
          body,
          url,
        }),
      );
    }

    return Promise.reject(
      new ApiError(error.message || "Erro de conexao com a API", { url }),
    );
  },
);

export async function fetchClient(
  endpoint,
  { body, method = "GET", headers = {}, ...customConfig } = {},
) {
  const response = await apiClient.request({
    url: endpoint,
    method,
    data: body,
    headers,
    ...customConfig,
  });

  return response.data ?? null;
}

export default fetchClient;
