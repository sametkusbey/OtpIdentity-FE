import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

const AUTH_TOKEN_STORAGE_KEY = 'otpidentity_token';

export const setAuthToken = (token?: string) => {
  if (token && token.trim() !== '') {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } catch {
      // ignore
    }
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};

// On load: pick up persisted token if any
try {
  const t = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? undefined;
  if (t) setAuthToken(t);
} catch {
  // ignore
}

// Optional: bypass auth in production by auto-login with env creds
const BYPASS_AUTH = (import.meta as any).env?.VITE_BYPASS_AUTH === 'true';
const AUTH_USERNAME = (import.meta as any).env?.VITE_AUTH_USERNAME as string | undefined;
const AUTH_PASSWORD = (import.meta as any).env?.VITE_AUTH_PASSWORD as string | undefined;

let authPromise: Promise<string | undefined> | null = null;

const autoLoginWithEnv = async (): Promise<string | undefined> => {
  if (!BYPASS_AUTH) return undefined;
  if (!AUTH_USERNAME || !AUTH_PASSWORD) return undefined;
  try {
    const res = await apiClient.post(
      '/auth/login/jwt',
      { username: AUTH_USERNAME, password: AUTH_PASSWORD },
      { headers: { 'x-skip-auth': '1' } }, // prevent interceptor loop
    );
    const data = (res as any).data as { data?: { token?: string } } | { token?: string };
    const token = (data as any)?.token ?? (data as any)?.data?.token;
    if (typeof token === 'string' && token.trim() !== '') {
      setAuthToken(token);
      return token;
    }
  } catch {
    // ignore
  }
  return undefined;
};

const ensureAuth = async (): Promise<string | undefined> => {
  const header = (apiClient.defaults.headers as any)?.common?.Authorization as string | undefined;
  if (header && header.startsWith('Bearer ')) return header.substring('Bearer '.length);
  if (!authPromise) authPromise = autoLoginWithEnv().finally(() => { authPromise = null; });
  return authPromise;
};

// Attach token on requests; if missing and bypass enabled, try auto-login
apiClient.interceptors.request.use(
  async (config) => {
    if ((config.headers as any)?.['x-skip-auth'] === '1') return config;
    const hasAuth = !!(config.headers && (config.headers as any).Authorization);
    if (!hasAuth) {
      const token = await ensureAuth();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const resolveErrorMessage = (payload: unknown): string | undefined => {
  if (!payload) return undefined;

  if (typeof payload === 'string') {
    const s = payload.trim();
    return s.length > 0 ? s : undefined;
  }

  if (typeof payload !== 'object') return undefined;

  const obj = payload as Record<string, unknown>;

  const candidates = [
    obj.message,
    obj.Message,
    obj.detail,
    obj.error,
    obj.title,
    obj.error_description,
  ];

  const direct = candidates.find(
    (c) => typeof c === 'string' && (c as string).trim() !== '',
  ) as string | undefined;
  if (direct) return direct;

  // errors can be array or dictionary { field: [messages] }
  const errors = obj.errors as unknown;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      const nested = resolveErrorMessage(first);
      if (nested) return nested;
    }
  } else if (errors && typeof errors === 'object') {
    const dict = errors as Record<string, unknown>;
    for (const key of Object.keys(dict)) {
      const value = dict[key];
      if (typeof value === 'string' && value.trim() !== '') return value;
      if (Array.isArray(value) && value.length > 0) {
        const firstVal = value[0];
        if (typeof firstVal === 'string' && firstVal.trim() !== '') return firstVal;
      }
    }
  }

  // Nested data wrappers (Result<T> or ApiResponse)
  const nestedData = (obj.data ?? (obj as Record<string, unknown>).Data) as unknown;
  if (nestedData && typeof nestedData === 'object') {
    const nested = resolveErrorMessage(nestedData);
    if (nested) return nested;
  }

  return undefined;
};

const resolveSuccessMessage = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const objectPayload = payload as Record<string, unknown>;
  const candidates = [
    objectPayload.message,
    objectPayload.Message,
    objectPayload.detail,
    objectPayload.info,
  ];

  const directMessage = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim() !== '',
  ) as string | undefined;

  if (directMessage) {
    return directMessage;
  }

  if (objectPayload.data && typeof objectPayload.data === 'object') {
    return resolveSuccessMessage(objectPayload.data);
  }

  return undefined;
};

apiClient.interceptors.response.use(
  (response) => {
    const message = resolveSuccessMessage(response.data);
    return {
      ...response,
      data: response.data,
      metaMessage: message,
    };
  },
  async (error) => {
    const status = error.response?.status as number | undefined;
    const originalConfig = error.config ?? {};
    const alreadyRetried = (originalConfig as any)._retried === true;

    // On 401/403 try a single auto-login (if enabled) then retry once
    if ((status === 401 || status === 403) && !alreadyRetried) {
      const token = await ensureAuth();
      if (token) {
        (originalConfig as any)._retried = true;
        originalConfig.headers = originalConfig.headers ?? {};
        (originalConfig.headers as any).Authorization = `Bearer ${token}`;
        return apiClient(originalConfig);
      }
    }

    const payload = error.response?.data;
    const contentType = (error.response?.headers?.['content-type'] as string | undefined)?.toLowerCase() ?? '';
    const isHtml = contentType.includes('text/html') || (typeof payload === 'string' && /^\s*<!doctype\s*html/i.test(payload));
    const message = isHtml
      ? `Sunucu hatasi (${status ?? ''} ${error.response?.statusText ?? ''}).`
      : (resolveErrorMessage(payload) ?? 'Beklenmeyen bir hata olustu.');
    return Promise.reject({
      ...error,
      message,
      status,
      validationErrors: payload?.errors,
    });
  },
);

export type ApiError = {
  message: string;
  status?: number;
  validationErrors?: Record<string, string[]>;
};

export type ApiResponse<TData> = {
  data: TData;
  metaMessage?: string;
};
