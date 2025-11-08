import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { DealerDto } from '@/types/entities';
import { CompanyType } from '@/types/entities';

// Customers API - Dokümantasyona göre /api/customers endpoint'leri
// [Authorize] Required - JWT token gerekli

export interface CreateCustomerRequest {
  taxIdentifierNumber: string;
  title: string;
  companyType: CompanyType;
  city: string;
  district: string;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  // Backend için gerekli alanlar:
  isCustomer: boolean; // Her zaman true olmalı
  dealerCode?: string | null; // Backend otomatik atar, null gönderebiliriz
  userIds?: string[]; // Guid array olarak gönderilecek
}

export interface UpdateCustomerRequest {
  taxIdentifierNumber?: string;
  title?: string;
  companyType?: CompanyType;
  city?: string;
  district?: string;
  companyPhoneNumber?: string;
  companyEmailAddress?: string;
  userIds?: string[];
  // dealerCode korunur (değiştirilmez)
}

export async function listCustomers(): Promise<DealerDto[]> {
  // Backend otomatik olarak giriş yapan kullanıcının bayi koduna göre filtreleme yapar
  // Admin kullanıcılar tüm müşterileri görebilir
  // Normal kullanıcılar sadece kendi bayi koduna ait müşterileri görür
  const res = await apiClient.get<Result<DealerDto[]>>('/customers');
  const payload = res.data as unknown as Result<DealerDto[]> | DealerDto[];
  
  if (Array.isArray(payload)) return payload as DealerDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Müşteriler alınamadı');
    return result.data as DealerDto[];
  }
  
  return [];
}

export async function getCustomer(id: string): Promise<DealerDto> {
  // Yetki kontrolü: Admin değilse sadece kendi bayi koduna ait müşterilere erişim
  const res = await apiClient.get<Result<DealerDto>>(`/customers/${id}`);
  const payload = res.data as unknown as Result<DealerDto> | DealerDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Müşteri alınamadı');
    return result.data as DealerDto;
  }
  
  return payload as DealerDto;
}

export async function createCustomer(request: CreateCustomerRequest): Promise<DealerDto> {
  // Backend İş Mantığı:
  // 1. Giriş yapan kullanıcıyı bul
  // 2. Portal hesaptan bayi kodunu al
  // 3. Parent bayiyi bul (bayi kodu ile)
  // 4. Müşteri oluştur:
  //    - IsCustomer = true (otomatik)
  //    - DealerCode = parent bayinin DealerCode'u
  //    - ParentDealerId = parent bayinin Id'si
  //    - OwnerPortalAccountId = giriş yapan kullanıcının Id'si
  
  // Backend'in beklediği format ile request oluştur
  const customerRequest = {
    taxIdentifierNumber: request.taxIdentifierNumber,
    title: request.title,
    companyType: request.companyType,
    city: request.city,
    district: request.district,
    companyPhoneNumber: request.companyPhoneNumber,
    companyEmailAddress: request.companyEmailAddress,
    isCustomer: true, // Her zaman true
    dealerCode: null, // Backend otomatik atar
    userIds: request.userIds || [] // Boş array gönder
  };
  
  const res = await apiClient.post<Result<DealerDto>>('/customers', customerRequest);
  const payload = res.data as unknown as Result<DealerDto> | DealerDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Müşteri oluşturulamadı');
    return result.data as DealerDto;
  }
  
  return payload as DealerDto;
}

export async function updateCustomer(id: string, request: UpdateCustomerRequest): Promise<DealerDto> {
  // İş Mantığı:
  // 1. Müşteri bulma ve yetki kontrolü
  // 2. Bilgileri güncelleme
  // 3. DealerCode korunur (değiştirilmez)
  
  const res = await apiClient.put<Result<DealerDto>>(`/customers/${id}`, request);
  const payload = res.data as unknown as Result<DealerDto> | DealerDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Müşteri güncellenemedi');
    return result.data as DealerDto;
  }
  
  return payload as DealerDto;
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/customers/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Müşteri silinemedi');
  }
}
