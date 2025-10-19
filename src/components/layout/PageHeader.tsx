import { Flex, Space, Typography } from 'antd';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <Flex
    align="center"
    justify="space-between"
    wrap="wrap"
    gap={16}
    style={{ width: '100%' }}
  >
    <Space direction="vertical" size={4}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Text type="secondary">{description}</Typography.Text>
      ) : null}
    </Space>
    {actions ? (
      <Space className="page-header-actions" wrap size={12}>
        {actions}
      </Space>
    ) : null}
  </Flex>
);
