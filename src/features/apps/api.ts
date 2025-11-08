import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { AppDto } from '@/types/entities';

// Apps API - Dokümantasyona göre /api/apps endpoint'leri

export interface CreateAppRequest {
  appCode: string;
  appName: string;
}

export interface UpdateAppRequest {
  appCode?: string;
  appName?: string;
}

export async function listApps(): Promise<AppDto[]> {
  const res = await apiClient.get<Result<AppDto[]>>('/apps');
  const payload = res.data as unknown as Result<AppDto[]> | AppDto[];
  
  if (Array.isArray(payload)) return payload as AppDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Uygulamalar alınamadı');
    return result.data as AppDto[];
  }
  
  return [];
}

export async function getApp(id: string): Promise<AppDto> {
  const res = await apiClient.get<Result<AppDto>>(`/apps/${id}`);
  const payload = res.data as unknown as Result<AppDto> | AppDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Uygulama alınamadı');
    return result.data as AppDto;
  }
  
  return payload as AppDto;
}

export async function createApp(request: CreateAppRequest): Promise<AppDto> {
  const res = await apiClient.post<Result<AppDto>>('/apps', request);
  const payload = res.data as unknown as Result<AppDto> | AppDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Uygulama oluşturulamadı');
    return result.data as AppDto;
  }
  
  return payload as AppDto;
}

export async function updateApp(id: string, request: UpdateAppRequest): Promise<AppDto> {
  const res = await apiClient.put<Result<AppDto>>(`/apps/${id}`, request);
  const payload = res.data as unknown as Result<AppDto> | AppDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Uygulama güncellenemedi');
    return result.data as AppDto;
  }
  
  return payload as AppDto;
}

export async function deleteApp(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/apps/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Uygulama silinemedi');
  }
}
