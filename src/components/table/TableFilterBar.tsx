import { Flex, Input } from 'antd';
import type { ReactNode } from 'react';

import type { ChangeEvent } from 'react';


type TableFilterBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  extra?: ReactNode;
};


export const TableFilterBar = ({ value, onChange, placeholder, extra }: TableFilterBarProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Flex align="center" justify="space-between" wrap="wrap" gap={12} style={{ marginBottom: 12 }}>
      <Input.Search
        allowClear
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? 'Ara...'}
        style={{ width: '100%', maxWidth: 320 }}
      />
      {extra}
    </Flex>
  );
};

