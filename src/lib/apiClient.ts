import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

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
  (error) => {
    const payload = error.response?.data;
    const message =
      resolveErrorMessage(payload) ?? 'Beklenmeyen bir hata olustu.';
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
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
