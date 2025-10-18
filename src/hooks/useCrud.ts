import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, type ApiError, type ApiResponse } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

type MutationOptions<TResult> = {
  onSuccess?: (data: TResult) => void;
  successMessage?: string;
  errorMessage?: string;
};

const extractMessage = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const source = payload as Record<string, unknown>;

  const direct = [
    source.message,
    source.Message,
    source.detail,
    source.info,
  ].find((candidate) => typeof candidate === 'string' && candidate.trim() !== '') as
    | string
    | undefined;

  if (direct) {
    return direct;
  }

  if (source.errors) {
    const errors = source.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first && typeof first === 'object') {
        return extractMessage(first);
      }
    }
  }

  if (source.data && typeof source.data === 'object') {
    return extractMessage(source.data);
  }

  return undefined;
};

export const useCrudList = <TData>(resource: string) => {
  return useQuery<TData[], ApiError>({
    queryKey: [resource],
    queryFn: async () => {
      const response = await apiClient.get<TData[]>(`/${resource}`);
      const payload = response.data as unknown;
      if (Array.isArray(payload)) {
        return payload as TData[];
      }

      const maybeArray =
        (payload as { data?: unknown; items?: unknown })?.data ??
        (payload as { items?: unknown })?.items ??
        payload;

      return Array.isArray(maybeArray) ? (maybeArray as TData[]) : [];
    },
  });
};

const handleSuccessToast = (payload: unknown, fallback?: string) => {
  const message = extractMessage(payload) ?? fallback;
  if (message) {
    showSuccessToast(message);
  }
};

const handleErrorToast = (error: ApiError, fallback?: string) => {
  const message = error.message || fallback || 'Islem tamamlanamadi.';
  const description =
    fallback && fallback !== message ? fallback : undefined;
  showErrorToast(message, description);
};

export const useCreateMutation = <TPayload, TResult = unknown>(
  resource: string,
  options?: MutationOptions<TResult>,
) =>
  useMutation<TResult, ApiError, TPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<TResult>(`/${resource}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: [resource] });
      handleSuccessToast(data, options?.successMessage);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleErrorToast(error, options?.errorMessage);
    },
  });

export const useUpdateMutation = <TPayload, TResult = unknown>(
  resource: string,
  options?: MutationOptions<TResult>,
) =>
  useMutation<TResult, ApiError, { id: string; payload: TPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.put<TResult>(`/${resource}/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: [resource] });
      handleSuccessToast(data, options?.successMessage);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleErrorToast(error, options?.errorMessage);
    },
  });

export const useDeleteMutation = (
  resource: string,
  options?: MutationOptions<unknown>,
) =>
  useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/${resource}/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: [resource] });
      handleSuccessToast(data, options?.successMessage);
    },
    onError: (error) => {
      handleErrorToast(error, options?.errorMessage);
    },
  });

export const fetchEntityById = async <TData>(resource: string, id: string) => {
  const response = await apiClient.get<ApiResponse<TData> | TData>(
    `/${resource}/${id}`,
  );

  const payload = response.data as unknown;
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'data' in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: TData }).data;
  }

  return payload as TData;
};
