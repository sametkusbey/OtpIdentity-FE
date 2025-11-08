import { apiClient } from '@/lib/apiClient';
import type { Result } from '@/types/portal';
import type { UserDto } from '@/types/entities';

// Users API - Dokümantasyona göre /api/users endpoint'leri

export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identityNumber: string; // TC Kimlik No
  isEmailVerified?: boolean;
  isPhoneNumberVerified?: boolean;
  dealerIds?: string[]; // İlişkili bayiler
  appIds?: string[]; // İlişkili uygulamalar
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  identityNumber?: string;
  isEmailVerified?: boolean;
  isPhoneNumberVerified?: boolean;
  dealerIds?: string[];
  appIds?: string[];
}

export async function listUsers(): Promise<UserDto[]> {
  const res = await apiClient.get<Result<UserDto[]>>('/users');
  const payload = res.data as unknown as Result<UserDto[]> | UserDto[];
  
  if (Array.isArray(payload)) return payload as UserDto[];
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kullanıcılar alınamadı');
    return result.data as UserDto[];
  }
  
  return [];
}

export async function getUser(id: string): Promise<UserDto> {
  const res = await apiClient.get<Result<UserDto>>(`/users/${id}`);
  const payload = res.data as unknown as Result<UserDto> | UserDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kullanıcı alınamadı');
    return result.data as UserDto;
  }
  
  return payload as UserDto;
}

export async function createUser(request: CreateUserRequest): Promise<UserDto> {
  const res = await apiClient.post<Result<UserDto>>('/users', request);
  const payload = res.data as unknown as Result<UserDto> | UserDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kullanıcı oluşturulamadı');
    return result.data as UserDto;
  }
  
  return payload as UserDto;
}

export async function updateUser(id: string, request: UpdateUserRequest): Promise<UserDto> {
  const res = await apiClient.put<Result<UserDto>>(`/users/${id}`, request);
  const payload = res.data as unknown as Result<UserDto> | UserDto;
  
  if (payload && typeof payload === 'object' && ('succeeded' in payload || 'isSuccess' in payload)) {
    const result = payload as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kullanıcı güncellenemedi');
    return result.data as UserDto;
  }
  
  return payload as UserDto;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await apiClient.delete<Result<unknown>>(`/users/${id}`);
  const data = res.data as unknown as Result<unknown> | unknown;
  
  if (data && typeof data === 'object' && ('succeeded' in data || 'isSuccess' in data)) {
    const result = data as any;
    const succeeded = result.succeeded ?? result.isSuccess;
    if (!succeeded) throw new Error(result.message ?? 'Kullanıcı silinemedi');
  }
}
