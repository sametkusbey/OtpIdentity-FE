import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { ConnectionTypeDto } from '@/types/entities';

const ENDPOINT = '/connection-types';

export const listConnectionTypes = async (): Promise<ConnectionTypeDto[]> => {
  const res = await apiClient.get<Result<ConnectionTypeDto[]>>(ENDPOINT);
  const payload = res.data as unknown as Result<ConnectionTypeDto[]> | ConnectionTypeDto[];
  
  if (Array.isArray(payload)) return payload as ConnectionTypeDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı tipleri alınamadı');
    return result.data as ConnectionTypeDto[];
  }
  
  return [];
};

export const getConnectionType = async (id: string): Promise<ConnectionTypeDto> => {
  const res = await apiClient.get<Result<ConnectionTypeDto>>(`${ENDPOINT}/${id}`);
  const payload = res.data as unknown as Result<ConnectionTypeDto> | ConnectionTypeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı tipi alınamadı');
    return result.data as ConnectionTypeDto;
  }
  
  return payload as ConnectionTypeDto;
};

export const createConnectionType = async (
  data: Omit<ConnectionTypeDto, 'id'>,
): Promise<ConnectionTypeDto> => {
  const res = await apiClient.post<Result<ConnectionTypeDto>>(ENDPOINT, data);
  const payload = res.data as unknown as Result<ConnectionTypeDto> | ConnectionTypeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı tipi oluşturulamadı');
    return result.data as ConnectionTypeDto;
  }
  
  return payload as ConnectionTypeDto;
};

export const updateConnectionType = async (
  id: string,
  data: Omit<ConnectionTypeDto, 'id'>,
): Promise<ConnectionTypeDto> => {
  const res = await apiClient.put<Result<ConnectionTypeDto>>(`${ENDPOINT}/${id}`, data);
  const payload = res.data as unknown as Result<ConnectionTypeDto> | ConnectionTypeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı tipi güncellenemedi');
    return result.data as ConnectionTypeDto;
  }
  
  return payload as ConnectionTypeDto;
};

export const deleteConnectionType = async (id: string): Promise<void> => {
  const res = await apiClient.delete<Result<unknown>>(`${ENDPOINT}/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı tipi silinemedi');
  }
};

