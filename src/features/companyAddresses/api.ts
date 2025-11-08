import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { CompanyAddressDto } from '@/types/entities';

// Company Addresses API - Dokümantasyona göre /api/companyaddresses endpoint'leri

export interface CreateCompanyAddressRequest {
  dealerId: string;
  addressName: string;
  country: string;
  city: string;
  district: string;
  town?: string;
  street: string;
  zipCode: string;
  apartmentName?: string;
  apartmentNumber?: string;
  doorNumber?: string;
  emailAddress?: string;
  website?: string;
  isEInvoiceTaxpayer?: boolean;
  eInvoiceTransitionDate?: string; // datetime
  eInvoiceAlias?: string;
  isEWaybillTaxpayer?: boolean;
  eWaybillTransitionDate?: string; // datetime
  eWaybillAlias?: string;
}

export interface UpdateCompanyAddressRequest {
  dealerId?: string;
  addressName?: string;
  country?: string;
  city?: string;
  district?: string;
  town?: string;
  street?: string;
  zipCode?: string;
  apartmentName?: string;
  apartmentNumber?: string;
  doorNumber?: string;
  emailAddress?: string;
  website?: string;
  isEInvoiceTaxpayer?: boolean;
  eInvoiceTransitionDate?: string;
  eInvoiceAlias?: string;
  isEWaybillTaxpayer?: boolean;
  eWaybillTransitionDate?: string;
  eWaybillAlias?: string;
}

export async function listCompanyAddresses(): Promise<CompanyAddressDto[]> {
  const res = await apiClient.get<Result<CompanyAddressDto[]>>('/companyaddresses');
  const payload = res.data as unknown as Result<CompanyAddressDto[]> | CompanyAddressDto[];
  
  if (Array.isArray(payload)) return payload as CompanyAddressDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket adresleri alınamadı');
    return result.data as CompanyAddressDto[];
  }
  
  return [];
}

export async function getCompanyAddress(id: string): Promise<CompanyAddressDto> {
  const res = await apiClient.get<Result<CompanyAddressDto>>(`/companyaddresses/${id}`);
  const payload = res.data as unknown as Result<CompanyAddressDto> | CompanyAddressDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket adresi alınamadı');
    return result.data as CompanyAddressDto;
  }
  
  return payload as CompanyAddressDto;
}

export async function createCompanyAddress(request: CreateCompanyAddressRequest): Promise<CompanyAddressDto> {
  const res = await apiClient.post<Result<CompanyAddressDto>>('/companyaddresses', request);
  const payload = res.data as unknown as Result<CompanyAddressDto> | CompanyAddressDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket adresi oluşturulamadı');
    return result.data as CompanyAddressDto;
  }
  
  return payload as CompanyAddressDto;
}

export async function updateCompanyAddress(id: string, request: UpdateCompanyAddressRequest): Promise<CompanyAddressDto> {
  const res = await apiClient.put<Result<CompanyAddressDto>>(`/companyaddresses/${id}`, request);
  const payload = res.data as unknown as Result<CompanyAddressDto> | CompanyAddressDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket adresi güncellenemedi');
    return result.data as CompanyAddressDto;
  }
  
  return payload as CompanyAddressDto;
}

export async function deleteCompanyAddress(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/companyaddresses/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şirket adresi silinemedi');
  }
}
