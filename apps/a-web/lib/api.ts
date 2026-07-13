const LS_KEY = "accessToken";

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
};

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  return base.replace(/\/$/, "");
}

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_KEY) ?? "";
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null) {
    return fallback;
  }

  const errorBody = body as ApiErrorBody;

  if (typeof errorBody.message === "string") {
    return errorBody.message;
  }

  if (typeof errorBody.error === "string") {
    return errorBody.error;
  }

  return fallback;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const baseUrl = getBaseUrl();
  const token = getToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  let json: unknown = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, text || `HTTP ${res.status}`));
  }

  return json;
}

export function getErrorMessageFromUnknown(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}
