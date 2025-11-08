import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { ProgramEditionDto } from '@/types/entities';

// Program Editions API - Dokümantasyona göre /api/programeditions endpoint'leri

export interface CreateProgramEditionRequest {
  programVersionId: string;
  editionCode: string;
  editionName: string;
}

export interface UpdateProgramEditionRequest {
  programVersionId?: string;
  editionCode?: string;
  editionName?: string;
}

export async function listProgramEditions(params?: {
  programVersionId?: string;
}): Promise<ProgramEditionDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.programVersionId) {
    queryParams.append('programVersionId', params.programVersionId);
  }
  
  const url = `/programeditions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await apiClient.get<Result<ProgramEditionDto[]>>(url);
  const payload = res.data as unknown as Result<ProgramEditionDto[]> | ProgramEditionDto[];
  
  if (Array.isArray(payload)) return payload as ProgramEditionDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program sürümleri alınamadı');
    return result.data as ProgramEditionDto[];
  }
  
  return [];
}

export async function getProgramEdition(id: string): Promise<ProgramEditionDto> {
  const res = await apiClient.get<Result<ProgramEditionDto>>(`/programeditions/${id}`);
  const payload = res.data as unknown as Result<ProgramEditionDto> | ProgramEditionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program sürümü alınamadı');
    return result.data as ProgramEditionDto;
  }
  
  return payload as ProgramEditionDto;
}

export async function createProgramEdition(request: CreateProgramEditionRequest): Promise<ProgramEditionDto> {
  const res = await apiClient.post<Result<ProgramEditionDto>>('/programeditions', request);
  const payload = res.data as unknown as Result<ProgramEditionDto> | ProgramEditionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program sürümü oluşturulamadı');
    return result.data as ProgramEditionDto;
  }
  
  return payload as ProgramEditionDto;
}

export async function updateProgramEdition(id: string, request: UpdateProgramEditionRequest): Promise<ProgramEditionDto> {
  const res = await apiClient.put<Result<ProgramEditionDto>>(`/programeditions/${id}`, request);
  const payload = res.data as unknown as Result<ProgramEditionDto> | ProgramEditionDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program sürümü güncellenemedi');
    return result.data as ProgramEditionDto;
  }
  
  return payload as ProgramEditionDto;
}

export async function deleteProgramEdition(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/programeditions/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Program sürümü silinemedi');
  }
}
