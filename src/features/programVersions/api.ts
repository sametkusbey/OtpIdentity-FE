import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { ProgramVersionDto } from '@/types/entities';

// Program Versions API - Dokümantasyona göre /api/versions endpoint'leri

export interface CreateProgramVersionRequest {
  programId: string;
  versionCode: string;
  versionName: string;
}

export interface UpdateProgramVersionRequest {
  programId?: string;
  versionCode?: string;
  versionName?: string;
}

export async function listProgramVersions(): Promise<ProgramVersionDto[]> {
  const res = await apiClient.get<Result<ProgramVersionDto[]>>('/versions');
  const payload = res.data as unknown as Result<ProgramVersionDto[]> | ProgramVersionDto[];
  
  if (Array.isArray(payload)) return payload as ProgramVersionDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program versiyonları alınamadı');
    return result.data as ProgramVersionDto[];
  }
  
  return [];
}

export async function getProgramVersion(id: string): Promise<ProgramVersionDto> {
  const res = await apiClient.get<Result<ProgramVersionDto>>(`/versions/${id}`);
  const payload = res.data as unknown as Result<ProgramVersionDto> | ProgramVersionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program versiyonu alınamadı');
    return result.data as ProgramVersionDto;
  }
  
  return payload as ProgramVersionDto;
}

export async function createProgramVersion(request: CreateProgramVersionRequest): Promise<ProgramVersionDto> {
  const res = await apiClient.post<Result<ProgramVersionDto>>('/versions', request);
  const payload = res.data as unknown as Result<ProgramVersionDto> | ProgramVersionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program versiyonu oluşturulamadı');
    return result.data as ProgramVersionDto;
  }
  
  return payload as ProgramVersionDto;
}

export async function updateProgramVersion(id: string, request: UpdateProgramVersionRequest): Promise<ProgramVersionDto> {
  const res = await apiClient.put<Result<ProgramVersionDto>>(`/versions/${id}`, request);
  const payload = res.data as unknown as Result<ProgramVersionDto> | ProgramVersionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program versiyonu güncellenemedi');
    return result.data as ProgramVersionDto;
  }
  
  return payload as ProgramVersionDto;
}

export async function deleteProgramVersion(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/versions/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program versiyonu silinemedi');
  }
}
