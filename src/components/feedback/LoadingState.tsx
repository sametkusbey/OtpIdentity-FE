import { Flex, Spin, Typography } from 'antd';

type LoadingStateProps = {
  text?: string;
};

export const LoadingState = ({ text = 'Yükleniyor...' }: LoadingStateProps) => (
  <Flex
    align="center"
    justify="center"
    vertical
    style={{ minHeight: 240, gap: 16 }}
  >
    <Spin size="large" />
    <Typography.Text type="secondary">{text}</Typography.Text>
  </Flex>
);

