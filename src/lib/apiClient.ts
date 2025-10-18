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
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const objectPayload = payload as Record<string, unknown>;

  const candidates = [
    objectPayload.message,
    objectPayload.Message,
    objectPayload.detail,
    objectPayload.error,
  ];

  const directMessage = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim() !== '',
  ) as string | undefined;
  if (directMessage) {
    return directMessage;
  }

  const errorList = objectPayload.errors;
  if (Array.isArray(errorList) && errorList.length > 0) {
    const first = errorList[0];
    if (typeof first === 'string') {
      return first;
    }
    if (first && typeof first === 'object') {
      const nestedMessage = resolveErrorMessage(first);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
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
