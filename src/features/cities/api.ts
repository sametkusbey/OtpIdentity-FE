import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { CityDto, Guid } from '@/types/entities';

export interface CreateCityRequest {
  countryId: Guid;
  name: string;
  plateCode?: string | null;
}

export interface UpdateCityRequest {
  countryId: Guid;
  name: string;
  plateCode?: string | null;
}

export async function listCities(countryId?: Guid): Promise<CityDto[]> {
  const url = countryId ? `/cities?countryId=${countryId}` : '/cities';
  const res = await apiClient.get<Result<CityDto[]>>(url);
  const payload = res.data as unknown as Result<CityDto[]> | CityDto[];
  
  if (Array.isArray(payload)) return payload as CityDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şehirler alınamadı');
    return result.data as CityDto[];
  }
  
  return [];
}

export async function getCity(id: string): Promise<CityDto> {
  const res = await apiClient.get<Result<CityDto>>(`/cities/${id}`);
  const payload = res.data as unknown as Result<CityDto> | CityDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Şehir alınamadı');
    return result.data as CityDto;
  }
  
  return payload as CityDto;
}

