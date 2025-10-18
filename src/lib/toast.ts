import type { NotificationArgsProps } from 'antd';
import type { NotificationInstance } from 'antd/es/notification/interface';

type ToastType = 'success' | 'error' | 'warning' | 'info';

let notificationApi: NotificationInstance | null = null;

export const registerNotificationApi = (api: NotificationInstance) => {
  notificationApi = api;
};

const baseConfig: Partial<NotificationArgsProps> = {
  placement: 'topRight',
  duration: 4,
};

export const showToast = (
  type: ToastType,
  title: string,
  description?: string,
) => {
  if (!notificationApi) {
    return;
  }

  const config: NotificationArgsProps = {
    ...baseConfig,
    message: title,
    description,
  };

  notificationApi[type](config);
};

export const showSuccessToast = (message: string, description?: string) =>
  showToast('success', message, description);

export const showErrorToast = (message: string, description?: string) =>
  showToast('error', message, description);

export const showWarningToast = (message: string, description?: string) =>
  showToast('warning', message, description);
