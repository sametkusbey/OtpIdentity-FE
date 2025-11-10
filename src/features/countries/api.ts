import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { CountryDto } from '@/types/entities';

export interface CreateCountryRequest {
  code: string;
  name: string;
}

export interface UpdateCountryRequest {
  code: string;
  name: string;
}

export async function listCountries(): Promise<CountryDto[]> {
  const res = await apiClient.get<Result<CountryDto[]>>('/countries');
  const payload = res.data as unknown as Result<CountryDto[]> | CountryDto[];
  
  if (Array.isArray(payload)) return payload as CountryDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Ülkeler alınamadı');
    return result.data as CountryDto[];
  }
  
  return [];
}

export async function getCountry(id: string): Promise<CountryDto> {
  const res = await apiClient.get<Result<CountryDto>>(`/countries/${id}`);
  const payload = res.data as unknown as Result<CountryDto> | CountryDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Ülke alınamadı');
    return result.data as CountryDto;
  }
  
  return payload as CountryDto;
}

