import { apiClient } from '@/lib/apiClient';
import type {
  Result,
  AuthAccountDto,
  AuthLoginWithTokenResponseDto,
  PortalMenuDto,
} from '@/types/portal';

export async function portalRegister(
  username: string,
  password: string,
  menuIds?: string[],
): Promise<AuthAccountDto> {
  const res = await apiClient.post<Result<AuthAccountDto>>('/auth/register', {
    username,
    password,
    menuIds,
  });
  const payload = res.data as unknown as Result<AuthAccountDto> | AuthAccountDto;
  if (payload && typeof payload === 'object' && 'succeeded' in (payload as Result<AuthAccountDto>)) {
    const result = payload as Result<AuthAccountDto>;
    if (!result.succeeded) throw new Error(result.message ?? 'Kayit basarisiz');
    return result.data as AuthAccountDto;
  }
  return payload as AuthAccountDto;
}

export async function portalLogin(
  username: string,
  password: string,
): Promise<AuthLoginWithTokenResponseDto> {
  // Prefer JWT login endpoint to obtain token
  const res = await apiClient.post<Result<AuthLoginWithTokenResponseDto>>('/auth/login/jwt', {
    username,
    password,
  });
  const payload = res.data as unknown as Result<AuthLoginWithTokenResponseDto> | AuthLoginWithTokenResponseDto;
  if (payload && typeof payload === 'object' && 'succeeded' in (payload as Result<AuthLoginWithTokenResponseDto>)) {
    const result = payload as Result<AuthLoginWithTokenResponseDto>;
    if (!result.succeeded) throw new Error(result.message ?? 'Giris basarisiz');
    return result.data as AuthLoginWithTokenResponseDto;
  }
  return payload as AuthLoginWithTokenResponseDto;
}

export async function updatePortalAccount(
  id: string,
  payload: { password?: string; isActive?: boolean; menuIds?: string[] },
): Promise<AuthAccountDto> {
  const res = await apiClient.put<Result<AuthAccountDto>>(`/portalaccounts/${id}`, payload);
  const data = res.data as unknown as Result<AuthAccountDto> | AuthAccountDto;
  if (data && typeof data === 'object' && 'succeeded' in (data as Result<AuthAccountDto>)) {
    const result = data as Result<AuthAccountDto>;
    if (!result.succeeded) throw new Error(result.message ?? 'Guncelleme basarisiz');
    return result.data as AuthAccountDto;
  }
  return data as AuthAccountDto;
}

export async function deactivatePortalAccount(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/portalaccounts/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  if (data && typeof data === 'object' && 'succeeded' in (data as Result<unknown>)) {
    const result = data as Result<unknown>;
    if (!result.succeeded) throw new Error(result.message ?? 'Pasife alma basarisiz');
  }
}

export async function getPortalAccount(id: string): Promise<AuthAccountDto> {
  const res = await apiClient.get<Result<AuthAccountDto> | AuthAccountDto>(
    `/portalaccounts/${encodeURIComponent(id)}`,
  );
  const payload = res.data as unknown;
  if (payload && typeof payload === 'object' && 'succeeded' in (payload as Result<AuthAccountDto>)) {
    const r = payload as Result<AuthAccountDto>;
    if (!r.succeeded) throw new Error(r.message ?? 'Kayit alinamadi');
    return r.data as AuthAccountDto;
  }
  return payload as AuthAccountDto;
}

export async function listPortalMenus(): Promise<PortalMenuDto[]> {
  const res = await apiClient.get<Result<PortalMenuDto[]> | PortalMenuDto[]>('/portalmenus');
  const payload = res.data as unknown;
  if (Array.isArray(payload)) return payload as PortalMenuDto[];
  if (payload && typeof payload === 'object' && 'succeeded' in (payload as Result<PortalMenuDto[]>)) {
    const r = payload as Result<PortalMenuDto[]>;
    if (!r.succeeded) throw new Error(r.message ?? 'Menuler alinamadi');
    return (r.data ?? []) as PortalMenuDto[];
  }
  return [];
}


export async function getPortalAccountMenus(id: string): Promise<PortalMenuDto[]> {
  const res = await apiClient.get<Result<PortalMenuDto[]> | PortalMenuDto[]>(
    `/portalaccounts/${encodeURIComponent(id)}/menus`,
  );
  const payload = res.data as unknown;
  if (Array.isArray(payload)) return payload as PortalMenuDto[];
  if (payload && typeof payload === 'object' && 'succeeded' in (payload as Result<PortalMenuDto[]>)) {
    const r = payload as Result<PortalMenuDto[]>;
    if (!r.succeeded) throw new Error(r.message ?? 'Kullanici menuleri alinamadi');
    return (r.data ?? []) as PortalMenuDto[];
  }
  return [];
}
