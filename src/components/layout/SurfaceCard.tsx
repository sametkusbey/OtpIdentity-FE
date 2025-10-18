import { Card } from 'antd';
import type { CardProps } from 'antd';
import type { ReactNode } from 'react';

type SurfaceCardProps = CardProps & {
  children: ReactNode;
};

export const SurfaceCard = ({
  children,
  style,
  bodyStyle,
  ...rest
}: SurfaceCardProps) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 26,
      background: '#ffffff',
      boxShadow:
        '0 28px 60px -28px rgba(15, 23, 42, 0.35), 0 18px 40px -36px rgba(15, 23, 42, 0.45)',
      ...style,
    }}
    bodyStyle={{
      padding: 28,
      ...bodyStyle,
    }}
    {...rest}
  >
    {children}
  </Card>
);
