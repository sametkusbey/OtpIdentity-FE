import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { CompanyTypeDto } from '@/types/entities';

// CompanyTypes API - /api/companytypes endpoint'leri

export interface CreateCompanyTypeRequest {
  code: string;
  name: string;
}

export interface UpdateCompanyTypeRequest {
  code?: string;
  name?: string;
}

export async function listCompanyTypes(): Promise<CompanyTypeDto[]> {
  const res = await apiClient.get<Result<CompanyTypeDto[]>>('/companytypes');
  const payload = res.data as unknown as Result<CompanyTypeDto[]> | CompanyTypeDto[];
  
  if (Array.isArray(payload)) return payload as CompanyTypeDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket tipleri alınamadı');
    return result.data as CompanyTypeDto[];
  }
  
  return [];
}

export async function getCompanyType(id: string): Promise<CompanyTypeDto> {
  const res = await apiClient.get<Result<CompanyTypeDto>>(`/companytypes/${id}`);
  const payload = res.data as unknown as Result<CompanyTypeDto> | CompanyTypeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket tipi alınamadı');
    return result.data as CompanyTypeDto;
  }
  
  return payload as CompanyTypeDto;
}

export async function createCompanyType(request: CreateCompanyTypeRequest): Promise<CompanyTypeDto> {
  const res = await apiClient.post<Result<CompanyTypeDto>>('/companytypes', request);
  const payload = res.data as unknown as Result<CompanyTypeDto> | CompanyTypeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket tipi oluşturulamadı');
    return result.data as CompanyTypeDto;
  }
  
  return payload as CompanyTypeDto;
}

export async function updateCompanyType(id: string, request: UpdateCompanyTypeRequest): Promise<CompanyTypeDto> {
  const res = await apiClient.put<Result<CompanyTypeDto>>(`/companytypes/${id}`, request);
  const payload = res.data as unknown as Result<CompanyTypeDto> | CompanyTypeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket tipi güncellenemedi');
    return result.data as CompanyTypeDto;
  }
  
  return payload as CompanyTypeDto;
}

export async function deleteCompanyType(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/companytypes/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket tipi silinemedi');
  }
}

