import dayjs from 'dayjs';

export const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD.MM.YYYY') : '-';

export const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '-';

export const formatBoolean = (value?: boolean) => (value ? 'Evet' : 'Hayr');
