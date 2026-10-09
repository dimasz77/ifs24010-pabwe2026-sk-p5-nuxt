export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  status?: string;
  message?: string;
  data: T;
}

const TOKEN_KEY = "accessToken";

const apiHelper = (() => {
  function normalizeUrl(url: string): string {
    const queryIndex = url.indexOf("?");
    const path = queryIndex === -1 ? url : url.slice(0, queryIndex);
    const query = queryIndex === -1 ? "" : url.slice(queryIndex);
    const fixedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    return fixedPath + query;
  }

  function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  function putAccessToken(token: string | null): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async function fetchData(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(normalizeUrl(url), {
      ...options,
      mode: "cors",
      headers,
    });
  }

  function extractErrorDetails(data: unknown): string {
    if (data === null || typeof data !== "object") {
      return "";
    }
    return Object.values(data).flat().join(", ");
  }

  async function parseEnvelope<T>(response: Response, fallbackMessage: string): Promise<ApiEnvelope<T>> {
    try {
      return (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  async function fetchJson<T>(
    url: string,
    options: RequestInit = {},
    fallbackMessage = "Terjadi kesalahan pada server"
  ): Promise<ApiEnvelope<T>> {
    const response = await fetchData(url, options);
    const result = await parseEnvelope<T>(response, fallbackMessage);

    if (result.status !== "success" && !result.success) {
      const baseMessage = result.message || fallbackMessage;
      const details = extractErrorDetails(result.data);
      throw new Error(details ? `${baseMessage}: ${details}` : baseMessage);
    }

    return result;
  }

  return {
    fetchData,
    fetchJson,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;
