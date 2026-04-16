import axios from "axios";

// Force correct API base URL since environment variables aren't being picked up
const normalizedBaseUrl = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

let csrfReadyAt = 0;
let csrfInflight = null;
const CSRF_TTL_MS = 1000 * 60 * 90;
const CSRF_RETRY_DELAYS_MS = [700, 1400, 2200];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("talentlink.auth");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("talentlink:unauthorized"));
      }
    }
    if (error?.response?.status === 419) {
      csrfReadyAt = 0;
    }

    return Promise.reject(error);
  }
);

export async function ensureCsrfCookie() {
  const now = Date.now();
  if (csrfReadyAt && now - csrfReadyAt < CSRF_TTL_MS) return;

  if (!csrfInflight) {
    csrfInflight = (async () => {
      let lastError;
      const attempts = CSRF_RETRY_DELAYS_MS.length + 1;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          // Initialize session + XSRF cookie on a lightweight web route.
          await api.get("/health");
           csrfReadyAt = Date.now();
          return;
        } catch (error) {
          lastError = error;
          const status = error?.response?.status;
          const retryable = !status || [502, 503, 504].includes(status);
          const hasNextAttempt = attempt < CSRF_RETRY_DELAYS_MS.length;

          if (!retryable || !hasNextAttempt) break;
          await new Promise((resolve) => {
            setTimeout(resolve, CSRF_RETRY_DELAYS_MS[attempt]);
          });
        }
      }

      throw lastError;
    })().finally(() => {
      csrfInflight = null;
    });
  }

  await csrfInflight;
}

export function getApiErrorMessage(error, fallback = "Une erreur est survenue.") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.message === "string") return data.message;
  if (data.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey][0]) {
      return data.errors[firstKey][0];
    }
  }
  return fallback;
}

export function getApiValidationErrors(error) {
  const data = error?.response?.data;
  if (!data || !data.errors || typeof data.errors !== "object") return {};
  return data.errors;
}
