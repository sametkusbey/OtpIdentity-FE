import type { FormInstance } from 'antd';
import type { ApiError } from '@/lib/apiClient';

export const applyValidationErrors = <TValues>(
  error: ApiError,
  form: FormInstance<TValues>,
) => {
  if (!error.validationErrors) {
    return;
  }

  const fields = Object.entries(error.validationErrors).map(
    ([field, messages]) => ({
      name: field,
      errors: messages,
    }),
  );

  form.setFields(fields as any);
};
