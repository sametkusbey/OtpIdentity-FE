import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { DistrictDto, Guid } from '@/types/entities';

export interface CreateDistrictRequest {
  cityId: Guid;
  name: string;
}

export interface UpdateDistrictRequest {
  cityId: Guid;
  name: string;
}

export async function listDistricts(cityId?: Guid): Promise<DistrictDto[]> {
  const url = cityId ? `/districts?cityId=${cityId}` : '/districts';
  const res = await apiClient.get<Result<DistrictDto[]>>(url);
  const payload = res.data as unknown as Result<DistrictDto[]> | DistrictDto[];
  
  if (Array.isArray(payload)) return payload as DistrictDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'İlçeler alınamadı');
    return result.data as DistrictDto[];
  }
  
  return [];
}

export async function getDistrict(id: string): Promise<DistrictDto> {
  const res = await apiClient.get<Result<DistrictDto>>(`/districts/${id}`);
  const payload = res.data as unknown as Result<DistrictDto> | DistrictDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'İlçe alınamadı');
    return result.data as DistrictDto;
  }
  
  return payload as DistrictDto;
}

