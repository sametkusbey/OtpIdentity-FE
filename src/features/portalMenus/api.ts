import { apiClient } from '@/lib/apiClient';
import type { Result, PortalMenuDto } from '@/types/portal';

// Portal Menus API - Dokümantasyona göre /api/portalmenus endpoint'leri

export interface CreatePortalMenuRequest {
  menuCode: string;
  menuName: string;
}

export interface UpdatePortalMenuRequest {
  menuCode?: string;
  menuName?: string;
}

export async function listPortalMenus(): Promise<PortalMenuDto[]> {
  const res = await apiClient.get<Result<PortalMenuDto[]> | PortalMenuDto[]>('/portalmenus');
  const payload = res.data as unknown;
  
  if (Array.isArray(payload)) return payload as PortalMenuDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Portal menüleri alınamadı');
    return (result.data ?? []) as PortalMenuDto[];
  }
  
  return [];
}

export async function getPortalMenu(id: string): Promise<PortalMenuDto> {
  const res = await apiClient.get<Result<PortalMenuDto>>(`/portalmenus/${id}`);
  const payload = res.data as unknown as Result<PortalMenuDto> | PortalMenuDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Portal menüsü alınamadı');
    return result.data as PortalMenuDto;
  }
  
  return payload as PortalMenuDto;
}

export async function createPortalMenu(request: CreatePortalMenuRequest): Promise<PortalMenuDto> {
  const res = await apiClient.post<Result<PortalMenuDto>>('/portalmenus', request);
  const payload = res.data as unknown as Result<PortalMenuDto> | PortalMenuDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Portal menüsü oluşturulamadı');
    return result.data as PortalMenuDto;
  }
  
  return payload as PortalMenuDto;
}

export async function updatePortalMenu(id: string, request: UpdatePortalMenuRequest): Promise<PortalMenuDto> {
  const res = await apiClient.put<Result<PortalMenuDto>>(`/portalmenus/${id}`, request);
  const payload = res.data as unknown as Result<PortalMenuDto> | PortalMenuDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Portal menüsü güncellenemedi');
    return result.data as PortalMenuDto;
  }
  
  return payload as PortalMenuDto;
}

export async function deletePortalMenu(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/portalmenus/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Portal menüsü silinemedi');
  }
}
