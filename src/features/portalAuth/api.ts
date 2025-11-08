import { apiClient } from '@/lib/apiClient';
import type {
  Result,
  AuthAccountDto,
  AuthLoginWithTokenResponseDto,
  PortalMenuDto,
  PortalAccountListItemDto,
} from '@/types/portal';

export interface RegisterRequest {
  username: string;
  password: string;
  menuIds?: string[];
  dealerId?: string; // Bayi seçimi için ÖNEMLİ
}

export async function portalRegister(request: RegisterRequest): Promise<AuthAccountDto> {
  // Backend dokümantasyonuna göre:
  // - Username benzersizlik kontrolü
  // - Password hash'leme
  // - Portal hesap oluşturma
  // - Menü ilişkilendirme (varsa)
  // - Bayi ilişkilendirme (varsa):
  //   - Dealer.OwnerPortalAccountId = PortalAccount.Id
  //   - PortalAccount.DealerCode = Dealer.DealerCode

  const res = await apiClient.post<Result<AuthAccountDto>>('/auth/register', request);
  const payload = res.data as unknown as Result<AuthAccountDto> | AuthAccountDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kayıt başarısız');
    return result.data as AuthAccountDto;
  }
  
  return payload as AuthAccountDto;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export async function portalLogin(request: LoginRequest): Promise<AuthLoginWithTokenResponseDto> {
  // Backend dokümantasyonuna göre JWT login endpoint'i kullanılır
  // İş Mantığı:
  // 1. Username ile hesap bulma
  // 2. Hesap aktiflik kontrolü
  // 3. Password doğrulama
  // 4. Aktif menüleri getirme
  // 5. DealerCode'u response'a dahil etme (ÖNEMLİ: Frontend'de saklanmalı)
  
  const res = await apiClient.post<Result<AuthLoginWithTokenResponseDto>>('/auth/login/jwt', request);
  const payload = res.data as unknown as Result<AuthLoginWithTokenResponseDto> | AuthLoginWithTokenResponseDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Giriş başarısız');
    return result.data as AuthLoginWithTokenResponseDto;
  }
  
  return payload as AuthLoginWithTokenResponseDto;
}

export async function updatePortalAccount(
  id: string,
  payload: { password?: string; isActive?: boolean; menuIds?: string[]; ownedDealerId?: string | null; dealerCode?: string | null },
): Promise<AuthAccountDto> {
  const res = await apiClient.put<Result<AuthAccountDto>>(`/portalaccounts/${id}`, payload);
  const data = res.data as unknown as Result<AuthAccountDto> | AuthAccountDto;
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Güncelleme başarısız');
    return result.data as AuthAccountDto;
  }
  return data as AuthAccountDto;
}

export async function deactivatePortalAccount(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/portalaccounts/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Pasife alma başarısız');
  }
}

export async function getPortalAccount(id: string): Promise<AuthAccountDto> {
  const res = await apiClient.get<Result<AuthAccountDto> | AuthAccountDto>(
    `/portalaccounts/${encodeURIComponent(id)}`,
  );
  const payload = res.data as unknown;
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const r = payload as any;
    const succeeded = r.succeeded ?? r.isSuccess;
    if (!succeeded) throw new Error(r.message ?? 'Kayıt alınamadı');
    return r.data as AuthAccountDto;
  }
  return payload as AuthAccountDto;
}



export async function getPortalAccountMenus(id: string): Promise<PortalMenuDto[]> {
  const res = await apiClient.get<Result<PortalMenuDto[]> | PortalMenuDto[]>(
    `/portalaccounts/${encodeURIComponent(id)}/menus`,
  );
  const payload = res.data as unknown;
  if (Array.isArray(payload)) return payload as PortalMenuDto[];
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const r = payload as any;
    const succeeded = r.succeeded ?? r.isSuccess;
    if (!succeeded) throw new Error(r.message ?? 'Kullanıcı menüleri alınamadı');
    return (r.data ?? []) as PortalMenuDto[];
  }
  return [];
}

export async function listPortalAccounts(): Promise<PortalAccountListItemDto[]> {
  const res = await apiClient.get<Result<PortalAccountListItemDto[]> | PortalAccountListItemDto[]>('/portalaccounts');
  const payload = res.data as unknown;
  if (Array.isArray(payload)) return payload as PortalAccountListItemDto[];
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const r = payload as any;
    const succeeded = r.succeeded ?? r.isSuccess;
    if (!succeeded) throw new Error(r.message ?? 'Portal hesapları alınamadı');
    return (r.data ?? []) as PortalAccountListItemDto[];
  }
  return [];
}

export async function deletePortalAccount(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/portalaccounts/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Silme başarısız');
  }
}

