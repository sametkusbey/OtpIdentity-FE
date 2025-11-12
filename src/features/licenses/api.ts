import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { LicenseDto } from '@/types/entities';

// Licenses API - Dokümantasyona göre /api/licenses endpoint'leri

export interface CreateLicenseRequest {
  dealerId: string;
  appId: string;
  licenseCardId: string;
  initialExtraUserCount: number;
}

export interface UpdateLicenseRequest {
  dealerId: string;
  appId: string;
  licenseCardId: string;
  isLocked: boolean;
}

export async function listLicenses(): Promise<LicenseDto[]> {
  const res = await apiClient.get<Result<LicenseDto[]>>('/licenses');
  const payload = res.data as unknown as Result<LicenseDto[]> | LicenseDto[];
  
  if (Array.isArray(payload)) return payload as LicenseDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisanslar alınamadı');
    return result.data as LicenseDto[];
  }
  
  return [];
}

export async function getLicense(id: string): Promise<LicenseDto> {
  const res = await apiClient.get<Result<LicenseDto>>(`/licenses/${id}`);
  const payload = res.data as unknown as Result<LicenseDto> | LicenseDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans alınamadı');
    return result.data as LicenseDto;
  }
  
  return payload as LicenseDto;
}

export async function createLicense(request: CreateLicenseRequest): Promise<LicenseDto> {
  const res = await apiClient.post<Result<LicenseDto>>('/licenses', request);
  const payload = res.data as unknown as Result<LicenseDto> | LicenseDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans oluşturulamadı');
    return result.data as LicenseDto;
  }
  
  return payload as LicenseDto;
}

export async function updateLicense(id: string, request: UpdateLicenseRequest): Promise<LicenseDto> {
  const res = await apiClient.put<Result<LicenseDto>>(`/licenses/${id}`, request);
  const payload = res.data as unknown as Result<LicenseDto> | LicenseDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans güncellenemedi');
    return result.data as LicenseDto;
  }
  
  return payload as LicenseDto;
}

export async function deleteLicense(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/licenses/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans silinemedi');
  }
}
