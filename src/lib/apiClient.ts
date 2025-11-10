import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

const AUTH_TOKEN_STORAGE_KEY = 'otpidentity_token';

export const setAuthToken = (token?: string) => {
  if (token && token.trim() !== '') {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } catch {
      // ignore
    }
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};

// Authorization devre dışıyken kullanıcı ID'sini header'a set etmek için
export const setCurrentUserId = (userId?: string) => {
  if (userId && userId.trim() !== '') {
    apiClient.defaults.headers.common['X-Current-User-Id'] = userId;
    console.log('Current User ID set:', userId);
  } else {
    delete apiClient.defaults.headers.common['X-Current-User-Id'];
    console.log('Current User ID cleared');
  }
};

export const setIsAdmin = (isAdmin: boolean) => {
  if (isAdmin) {
    apiClient.defaults.headers.common['X-Is-Admin'] = 'true';
    console.log('Is Admin set to true');
  } else {
    delete apiClient.defaults.headers.common['X-Is-Admin'];
    console.log('Is Admin cleared');
  }
};

// Dealer code'u header'a set etmek için
export const setDealerCode = (dealerCode?: string | null) => {
  if (dealerCode && dealerCode.trim() !== '') {
    apiClient.defaults.headers.common['X-Dealer-Code'] = dealerCode;
    console.log('Dealer Code set:', dealerCode);
  } else {
    delete apiClient.defaults.headers.common['X-Dealer-Code'];
    console.log('Dealer Code cleared');
  }
};

// On load: pick up persisted token if any
try {
  const t = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? undefined;
  console.log('Sayfa yüklenirken localStorage token kontrolü:', t ? `Token bulundu (${t.substring(0, 20)}...)` : 'Token bulunamadı');
  if (t) {
    setAuthToken(t);
    console.log('Token API client\'a set edildi');
  }
} catch (error) {
  console.error('localStorage token alınırken hata:', error);
}

// Optional: bypass auth in production by auto-login with env creds
// const BYPASS_AUTH = (import.meta as any).env?.VITE_BYPASS_AUTH === 'true';
// const AUTH_USERNAME = (import.meta as any).env?.VITE_AUTH_USERNAME as string | undefined;
// const AUTH_PASSWORD = (import.meta as any).env?.VITE_AUTH_PASSWORD as string | undefined;

// Authorization devre dışı - bu fonksiyonlar geçici olarak kullanılmıyor
// let authPromise: Promise<string | undefined> | null = null;

// const autoLoginWithEnv = async (): Promise<string | undefined> => {
//   if (!BYPASS_AUTH) return undefined;
//   if (!AUTH_USERNAME || !AUTH_PASSWORD) return undefined;
//   try {
//     const res = await apiClient.post(
//       '/auth/login/jwt',
//       { username: AUTH_USERNAME, password: AUTH_PASSWORD },
//       { headers: { 'x-skip-auth': '1' } }, // prevent interceptor loop
//     );
//     const data = (res as any).data as { data?: { token?: string } } | { token?: string };
//     const token = (data as any)?.token ?? (data as any)?.data?.token;
//     if (typeof token === 'string' && token.trim() !== '') {
//       setAuthToken(token);
//       return token;
//     }
//   } catch {
//     // ignore
//   }
//   return undefined;
// };

// Authorization devre dışı - ensureAuth fonksiyonu geçici olarak kullanılmıyor
// const ensureAuth = async (): Promise<string | undefined> => {
//   // Önce mevcut header'ı kontrol et
//   const header = (apiClient.defaults.headers as any)?.common?.Authorization as string | undefined;
//   if (header && header.startsWith('Bearer ')) {
//     console.log('Token mevcut header\'da bulundu');
//     return header.substring('Bearer '.length);
//   }
  
//   // LocalStorage'dan token'ı kontrol et
//   try {
//     const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
//     if (storedToken && storedToken.trim() !== '') {
//       console.log('Token localStorage\'dan alındı');
//       setAuthToken(storedToken);
//       return storedToken;
//     }
//   } catch {
//     console.warn('localStorage\'dan token alınamadı');
//   }
  
//   // Son çare olarak env'den auto-login dene
//   if (!authPromise) authPromise = autoLoginWithEnv().finally(() => { authPromise = null; });
//   return authPromise;
// };

// Authorization geçici olarak devre dışı - token kontrolü yapılmıyor
apiClient.interceptors.request.use(
  async (config) => {
    console.log('API Request (Auth Disabled):', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    return config;
  },
  (error) => Promise.reject(error),
);

// Eski token interceptor - geçici olarak devre dışı
// apiClient.interceptors.request.use(
//   async (config) => {
//     if ((config.headers as any)?.['x-skip-auth'] === '1') return config;
    
//     // Her request'te token'ı kontrol et ve ekle
//     let hasValidToken = false;
//     const currentToken = apiClient.defaults.headers.common.Authorization;
    
//     if (currentToken && typeof currentToken === 'string' && currentToken.startsWith('Bearer ')) {
//       config.headers = config.headers ?? {};
//       (config.headers as any).Authorization = currentToken;
//       console.log('API Request - Mevcut token kullanıldı:', currentToken.substring(0, 30) + '...');
//       hasValidToken = true;
//     }
    
//     if (!hasValidToken) {
//       console.log('API Request - Token bulunamadı, yeniden alınıyor...');
//       const token = await ensureAuth();
//       if (token) {
//         config.headers = config.headers ?? {};
//         (config.headers as any).Authorization = `Bearer ${token}`;
//         console.log('API Request - Yeni token eklendi:', token.substring(0, 30) + '...');
//         hasValidToken = true;
//       } else {
//         console.warn('API Request - Token alınamadı!');
//       }
//     }
    
//     console.log('API Request:', config.method?.toUpperCase(), config.url, {
//       hasAuth: !!(config.headers as any)?.Authorization,
//       authHeader: (config.headers as any)?.Authorization?.substring(0, 30) + '...',
//       baseURL: config.baseURL,
//       fullURL: `${config.baseURL}${config.url}`
//     });
    
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

const resolveErrorMessage = (payload: unknown): string | undefined => {
  if (!payload) return undefined;

  if (typeof payload === 'string') {
    const s = payload.trim();
    return s.length > 0 ? s : undefined;
  }

  if (typeof payload !== 'object') return undefined;

  const obj = payload as Record<string, unknown>;

  const candidates = [
    obj.message,
    obj.Message,
    obj.detail,
    obj.error,
    obj.title,
    obj.error_description,
  ];

  const direct = candidates.find(
    (c) => typeof c === 'string' && (c as string).trim() !== '',
  ) as string | undefined;
  if (direct) return direct;

  // errors can be array or dictionary { field: [messages] }
  const errors = obj.errors as unknown;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      const nested = resolveErrorMessage(first);
      if (nested) return nested;
    }
  } else if (errors && typeof errors === 'object') {
    const dict = errors as Record<string, unknown>;
    for (const key of Object.keys(dict)) {
      const value = dict[key];
      if (typeof value === 'string' && value.trim() !== '') return value;
      if (Array.isArray(value) && value.length > 0) {
        const firstVal = value[0];
        if (typeof firstVal === 'string' && firstVal.trim() !== '') return firstVal;
      }
    }
  }

  // Nested data wrappers (Result<T> or ApiResponse)
  const nestedData = (obj.data ?? (obj as Record<string, unknown>).Data) as unknown;
  if (nestedData && typeof nestedData === 'object') {
    const nested = resolveErrorMessage(nestedData);
    if (nested) return nested;
  }

  return undefined;
};

const resolveSuccessMessage = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const objectPayload = payload as Record<string, unknown>;
  const candidates = [
    objectPayload.message,
    objectPayload.Message,
    objectPayload.detail,
    objectPayload.info,
  ];

  const directMessage = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim() !== '',
  ) as string | undefined;

  if (directMessage) {
    return directMessage;
  }

  if (objectPayload.data && typeof objectPayload.data === 'object') {
    return resolveSuccessMessage(objectPayload.data);
  }

  return undefined;
};

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, {
      success: true,
      dataType: typeof response.data
    });
    const message = resolveSuccessMessage(response.data);
    return {
      ...response,
      data: response.data,
      metaMessage: message,
    };
  },
  async (error) => {
    const status = error.response?.status as number | undefined;
    const originalConfig = error.config ?? {};
    // const alreadyRetried = (originalConfig as any)._retried === true; // Authorization devre dışı

    console.error('API Error:', status, originalConfig.url, {
      error: error.message,
      response: error.response?.data,
      hasAuth: !!(originalConfig.headers as any)?.Authorization,
      responseHeaders: error.response?.headers,
      requestHeaders: originalConfig.headers
    });

    // Authorization devre dışı - 401/403 retry logic'i kapatıldı
    // if ((status === 401 || status === 403) && !alreadyRetried) {
    //   console.log('401/403 hatası - token yenileme deneniyor...');
    //   const token = await ensureAuth();
    //   if (token) {
    //     console.log('Token yenilendi, request tekrar deneniyor...');
    //     (originalConfig as any)._retried = true;
    //     originalConfig.headers = originalConfig.headers ?? {};
    //     (originalConfig.headers as any).Authorization = `Bearer ${token}`;
    //     return apiClient(originalConfig);
    //   } else {
    //     console.error('Token yenilenemedi!');
    //   }
    // }

    const payload = error.response?.data;
    const contentType = (error.response?.headers?.['content-type'] as string | undefined)?.toLowerCase() ?? '';
    const isHtml = contentType.includes('text/html') || (typeof payload === 'string' && /^\s*<!doctype\s*html/i.test(payload));
    const message = isHtml
      ? `Sunucu hatasi (${status ?? ''} ${error.response?.statusText ?? ''}).`
      : (resolveErrorMessage(payload) ?? 'Beklenmeyen bir hata olustu.');
    return Promise.reject({
      ...error,
      message,
      status,
      validationErrors: payload?.errors,
    });
  },
);

export type ApiError = {
  message: string;
  status?: number;
  validationErrors?: Record<string, string[]>;
};

export type ApiResponse<TData> = {
  data: TData;
  metaMessage?: string;
};
