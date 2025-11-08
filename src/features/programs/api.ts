import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { ProgramDto } from '@/types/entities';

// Programs API - Dokümantasyona göre /api/programs endpoint'leri

export interface CreateProgramRequest {
  programCode: string;
  programName: string;
}

export interface UpdateProgramRequest {
  programCode?: string;
  programName?: string;
}

export async function listPrograms(): Promise<ProgramDto[]> {
  const res = await apiClient.get<Result<ProgramDto[]>>('/programs');
  const payload = res.data as unknown as Result<ProgramDto[]> | ProgramDto[];
  
  if (Array.isArray(payload)) return payload as ProgramDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Programlar alınamadı');
    return result.data as ProgramDto[];
  }
  
  return [];
}

export async function getProgram(id: string): Promise<ProgramDto> {
  const res = await apiClient.get<Result<ProgramDto>>(`/programs/${id}`);
  const payload = res.data as unknown as Result<ProgramDto> | ProgramDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program alınamadı');
    return result.data as ProgramDto;
  }
  
  return payload as ProgramDto;
}

export async function createProgram(request: CreateProgramRequest): Promise<ProgramDto> {
  const res = await apiClient.post<Result<ProgramDto>>('/programs', request);
  const payload = res.data as unknown as Result<ProgramDto> | ProgramDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program oluşturulamadı');
    return result.data as ProgramDto;
  }
  
  return payload as ProgramDto;
}

export async function updateProgram(id: string, request: UpdateProgramRequest): Promise<ProgramDto> {
  const res = await apiClient.put<Result<ProgramDto>>(`/programs/${id}`, request);
  const payload = res.data as unknown as Result<ProgramDto> | ProgramDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program güncellenemedi');
    return result.data as ProgramDto;
  }
  
  return payload as ProgramDto;
}

export async function deleteProgram(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/programs/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program silinemedi');
  }
}
