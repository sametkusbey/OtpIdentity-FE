import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { ConnectionDto } from '@/types/entities';

// Connections API - Dokümantasyona göre /api/connections endpoint'leri

export interface CreateConnectionRequest {
  programId: string;
  programVersionId: string;
  appId: string;
  dealerId: string;
  connectionType: string;
  parameter1?: string;
  parameter2?: string;
  parameter3?: string;
  parameter4?: string;
  parameter5?: string;
}

export interface UpdateConnectionRequest {
  programId?: string;
  programVersionId?: string;
  appId?: string;
  dealerId?: string;
  connectionType?: string;
  parameter1?: string;
  parameter2?: string;
  parameter3?: string;
  parameter4?: string;
  parameter5?: string;
}

export async function listConnections(): Promise<ConnectionDto[]> {
  const res = await apiClient.get<Result<ConnectionDto[]>>('/connections');
  const payload = res.data as unknown as Result<ConnectionDto[]> | ConnectionDto[];
  
  if (Array.isArray(payload)) return payload as ConnectionDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantılar alınamadı');
    return result.data as ConnectionDto[];
  }
  
  return [];
}

export async function getConnection(id: string): Promise<ConnectionDto> {
  const res = await apiClient.get<Result<ConnectionDto>>(`/connections/${id}`);
  const payload = res.data as unknown as Result<ConnectionDto> | ConnectionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı alınamadı');
    return result.data as ConnectionDto;
  }
  
  return payload as ConnectionDto;
}

export async function createConnection(request: CreateConnectionRequest): Promise<ConnectionDto> {
  const res = await apiClient.post<Result<ConnectionDto>>('/connections', request);
  const payload = res.data as unknown as Result<ConnectionDto> | ConnectionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı oluşturulamadı');
    return result.data as ConnectionDto;
  }
  
  return payload as ConnectionDto;
}

export async function updateConnection(id: string, request: UpdateConnectionRequest): Promise<ConnectionDto> {
  const res = await apiClient.put<Result<ConnectionDto>>(`/connections/${id}`, request);
  const payload = res.data as unknown as Result<ConnectionDto> | ConnectionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı güncellenemedi');
    return result.data as ConnectionDto;
  }
  
  return payload as ConnectionDto;
}

export async function deleteConnection(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/connections/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bağlantı silinemedi');
  }
}
