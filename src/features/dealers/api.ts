import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { DealerDto } from '@/types/entities';
import { CompanyType } from '@/types/entities';

// Dealers API - Dokümantasyona göre /api/dealers endpoint'leri

export interface CreateDealerRequest {
  taxIdentifierNumber: string;
  title: string;
  companyType: CompanyType;
  city: string;
  district: string;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  isCustomer: boolean; // Bayi için false olmalı
  dealerCode?: string;
  userIds?: string[];
}

export interface UpdateDealerRequest {
  taxIdentifierNumber?: string;
  title?: string;
  companyType?: CompanyType;
  city?: string;
  district?: string;
  companyPhoneNumber?: string;
  companyEmailAddress?: string;
  dealerCode?: string;
  userIds?: string[];
}

export async function listDealers(params?: {
  isCustomer?: boolean;
  mineOnly?: boolean;
}): Promise<DealerDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.isCustomer !== undefined) {
    queryParams.append('isCustomer', params.isCustomer.toString());
  }
  if (params?.mineOnly !== undefined) {
    queryParams.append('mineOnly', params.mineOnly.toString());
  }
  
  const url = `/dealers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await apiClient.get<Result<DealerDto[]>>(url);
  const payload = res.data as unknown as Result<DealerDto[]> | DealerDto[];
  
  if (Array.isArray(payload)) return payload as DealerDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bayiler alınamadı');
    return result.data as DealerDto[];
  }
  
  return [];
}

export async function getDealer(id: string): Promise<DealerDto> {
  const res = await apiClient.get<Result<DealerDto>>(`/dealers/${id}`);
  const payload = res.data as unknown as Result<DealerDto> | DealerDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bayi alınamadı');
    return result.data as DealerDto;
  }
  
  return payload as DealerDto;
}

export async function createDealer(request: CreateDealerRequest): Promise<DealerDto> {
  // Validasyon - IsCustomer=false olmalı (müşteriler için CustomersController kullanılmalı)
  if (request.isCustomer) {
    throw new Error('Müşteri oluşturma işlemi için /api/customers endpoint\'ini kullanın.');
  }
  
  const res = await apiClient.post<Result<DealerDto>>('/dealers', request);
  const payload = res.data as unknown as Result<DealerDto> | DealerDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bayi oluşturulamadı');
    return result.data as DealerDto;
  }
  
  return payload as DealerDto;
}

export async function updateDealer(id: string, request: UpdateDealerRequest): Promise<DealerDto> {
  const res = await apiClient.put<Result<DealerDto>>(`/dealers/${id}`, request);
  const payload = res.data as unknown as Result<DealerDto> | DealerDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bayi güncellenemedi');
    return result.data as DealerDto;
  }
  
  return payload as DealerDto;
}

export async function deleteDealer(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/dealers/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Bayi silinemedi');
  }
}
