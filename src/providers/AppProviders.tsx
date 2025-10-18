import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App as AntdApp, ConfigProvider, notification } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { queryClient } from '@/lib/queryClient';
import { themeTokens } from '@/config/theme';
import { AuthProvider } from '@/features/auth/AuthContext';
import { registerNotificationApi } from '@/lib/toast';

const NotificationRegistrar = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    registerNotificationApi(api);
  }, [api]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={trTR} theme={themeTokens}>
        <AntdApp>
          <NotificationRegistrar>
            <AuthProvider>{children}</AuthProvider>
          </NotificationRegistrar>
        </AntdApp>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>
);
