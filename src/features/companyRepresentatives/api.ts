import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { CompanyRepresentativeDto } from '@/types/entities';

// Company Representatives API - Dokümantasyona göre /api/companyrepresentatives endpoint'leri

export interface CreateCompanyRepresentativeRequest {
  dealerId: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
}

export interface UpdateCompanyRepresentativeRequest {
  dealerId?: string;
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  emailAddress?: string;
}

export async function listCompanyRepresentatives(): Promise<CompanyRepresentativeDto[]> {
  const res = await apiClient.get<Result<CompanyRepresentativeDto[]>>('/companyrepresentatives');
  const payload = res.data as unknown as Result<CompanyRepresentativeDto[]> | CompanyRepresentativeDto[];
  
  if (Array.isArray(payload)) return payload as CompanyRepresentativeDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket temsilcileri alınamadı');
    return result.data as CompanyRepresentativeDto[];
  }
  
  return [];
}

export async function getCompanyRepresentative(id: string): Promise<CompanyRepresentativeDto> {
  const res = await apiClient.get<Result<CompanyRepresentativeDto>>(`/companyrepresentatives/${id}`);
  const payload = res.data as unknown as Result<CompanyRepresentativeDto> | CompanyRepresentativeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket temsilcisi alınamadı');
    return result.data as CompanyRepresentativeDto;
  }
  
  return payload as CompanyRepresentativeDto;
}

export async function createCompanyRepresentative(request: CreateCompanyRepresentativeRequest): Promise<CompanyRepresentativeDto> {
  const res = await apiClient.post<Result<CompanyRepresentativeDto>>('/companyrepresentatives', request);
  const payload = res.data as unknown as Result<CompanyRepresentativeDto> | CompanyRepresentativeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket temsilcisi oluşturulamadı');
    return result.data as CompanyRepresentativeDto;
  }
  
  return payload as CompanyRepresentativeDto;
}

export async function updateCompanyRepresentative(id: string, request: UpdateCompanyRepresentativeRequest): Promise<CompanyRepresentativeDto> {
  const res = await apiClient.put<Result<CompanyRepresentativeDto>>(`/companyrepresentatives/${id}`, request);
  const payload = res.data as unknown as Result<CompanyRepresentativeDto> | CompanyRepresentativeDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket temsilcisi güncellenemedi');
    return result.data as CompanyRepresentativeDto;
  }
  
  return payload as CompanyRepresentativeDto;
}

export async function deleteCompanyRepresentative(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/companyrepresentatives/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket temsilcisi silinemedi');
  }
}
