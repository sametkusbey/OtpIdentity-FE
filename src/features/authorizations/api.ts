import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { AuthorizationDto } from '@/types/entities';

// Authorizations API - Dokümantasyona göre /api/authorizations endpoint'leri

export interface CreateAuthorizationRequest {
  userId: string;
  appId: string;
  dealerId: string;
}

export interface UpdateAuthorizationRequest {
  userId?: string;
  appId?: string;
  dealerId?: string;
}

export async function listAuthorizations(): Promise<AuthorizationDto[]> {
  const res = await apiClient.get<Result<AuthorizationDto[]>>('/authorizations');
  const payload = res.data as unknown as Result<AuthorizationDto[]> | AuthorizationDto[];
  
  if (Array.isArray(payload)) return payload as AuthorizationDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Yetkilendirmeler alınamadı');
    return result.data as AuthorizationDto[];
  }
  
  return [];
}

export async function getAuthorization(id: string): Promise<AuthorizationDto> {
  const res = await apiClient.get<Result<AuthorizationDto>>(`/authorizations/${id}`);
  const payload = res.data as unknown as Result<AuthorizationDto> | AuthorizationDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Yetkilendirme alınamadı');
    return result.data as AuthorizationDto;
  }
  
  return payload as AuthorizationDto;
}

export async function createAuthorization(request: CreateAuthorizationRequest): Promise<AuthorizationDto> {
  const res = await apiClient.post<Result<AuthorizationDto>>('/authorizations', request);
  const payload = res.data as unknown as Result<AuthorizationDto> | AuthorizationDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Yetkilendirme oluşturulamadı');
    return result.data as AuthorizationDto;
  }
  
  return payload as AuthorizationDto;
}

export async function updateAuthorization(id: string, request: UpdateAuthorizationRequest): Promise<AuthorizationDto> {
  const res = await apiClient.put<Result<AuthorizationDto>>(`/authorizations/${id}`, request);
  const payload = res.data as unknown as Result<AuthorizationDto> | AuthorizationDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Yetkilendirme güncellenemedi');
    return result.data as AuthorizationDto;
  }
  
  return payload as AuthorizationDto;
}

export async function deleteAuthorization(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/authorizations/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Yetkilendirme silinemedi');
  }
}
