import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';

// Statistics API - Dokümantasyona göre /api/statistics endpoint'leri

export interface StatisticsCount {
  count: number;
}

export async function getUsersCount(): Promise<number> {
  const res = await apiClient.get<Result<StatisticsCount> | StatisticsCount>('/statistics/users/count');
  const payload = res.data as unknown as Result<StatisticsCount> | StatisticsCount | number;
  
  // Direkt sayı dönerse
  if (typeof payload === 'number') return payload;
  
  // Result wrapper'ı varsa
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kullanıcı sayısı alınamadı');
    return (result.data as StatisticsCount)?.count ?? 0;
  }
  
  // Direkt count objesi
  if (payload && typeof payload === 'object' && 'count' in payload) {
    return (payload as StatisticsCount).count;
  }
  
  return 0;
}

export async function getActiveAppsCount(): Promise<number> {
  const res = await apiClient.get<Result<StatisticsCount> | StatisticsCount>('/statistics/apps/active/count');
  const payload = res.data as unknown as Result<StatisticsCount> | StatisticsCount | number;
  
  // Direkt sayı dönerse
  if (typeof payload === 'number') return payload;
  
  // Result wrapper'ı varsa
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Aktif uygulama sayısı alınamadı');
    return (result.data as StatisticsCount)?.count ?? 0;
  }
  
  // Direkt count objesi
  if (payload && typeof payload === 'object' && 'count' in payload) {
    return (payload as StatisticsCount).count;
  }
  
  return 0;
}

export async function getLicensesCount(): Promise<number> {
  const res = await apiClient.get<Result<StatisticsCount> | StatisticsCount>('/statistics/licenses/count');
  const payload = res.data as unknown as Result<StatisticsCount> | StatisticsCount | number;
  
  // Direkt sayı dönerse
  if (typeof payload === 'number') return payload;
  
  // Result wrapper'ı varsa
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Lisans sayısı alınamadı');
    return (result.data as StatisticsCount)?.count ?? 0;
  }
  
  // Direkt count objesi
  if (payload && typeof payload === 'object' && 'count' in payload) {
    return (payload as StatisticsCount).count;
  }
  
  return 0;
}
