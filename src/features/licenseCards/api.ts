import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { LicenseCardDto, RenewalPeriodType } from '@/types/entities';

export interface CreateLicenseCardRequest {
  cardName: string;
  renewalPeriod: number;
  renewalPeriodType: RenewalPeriodType;
}

export interface UpdateLicenseCardRequest {
  cardName: string;
  renewalPeriod: number;
  renewalPeriodType: RenewalPeriodType;
}

export async function listLicenseCards(): Promise<LicenseCardDto[]> {
  const res = await apiClient.get<Result<LicenseCardDto[]>>('/licenseCards');
  const payload = res.data as unknown as Result<LicenseCardDto[]> | LicenseCardDto[];
  
  if (Array.isArray(payload)) return payload as LicenseCardDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans kartları alınamadı');
    return result.data as LicenseCardDto[];
  }
  
  return [];
}

export async function getLicenseCard(id: string): Promise<LicenseCardDto> {
  const res = await apiClient.get<Result<LicenseCardDto>>(`/licenseCards/${id}`);
  const payload = res.data as unknown as Result<LicenseCardDto> | LicenseCardDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans kartı alınamadı');
    return result.data as LicenseCardDto;
  }
  
  return payload as LicenseCardDto;
}

export async function createLicenseCard(request: CreateLicenseCardRequest): Promise<LicenseCardDto> {
  const res = await apiClient.post<Result<LicenseCardDto>>('/licenseCards', request);
  const payload = res.data as unknown as Result<LicenseCardDto> | LicenseCardDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans kartı oluşturulamadı');
    return result.data as LicenseCardDto;
  }
  
  return payload as LicenseCardDto;
}

export async function updateLicenseCard(id: string, request: UpdateLicenseCardRequest): Promise<LicenseCardDto> {
  const res = await apiClient.put<Result<LicenseCardDto>>(`/licenseCards/${id}`, request);
  const payload = res.data as unknown as Result<LicenseCardDto> | LicenseCardDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans kartı güncellenemedi');
    return result.data as LicenseCardDto;
  }
  
  return payload as LicenseCardDto;
}

export async function deleteLicenseCard(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/licenseCards/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans kartı silinemedi');
  }
}

