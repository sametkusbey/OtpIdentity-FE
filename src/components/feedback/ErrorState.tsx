import { Button, Flex, Result } from 'antd';

type ErrorStateProps = {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  title = 'Bir hata olustu',
  subtitle = 'Lutfen tekrar deneyin.',
  onRetry,
}: ErrorStateProps) => (
  <Flex align="center" justify="center" style={{ minHeight: 320 }}>
    <Result
      status="error"
      title={title}
      subTitle={subtitle}
      extra={
        onRetry && (
          <Button type="primary" onClick={onRetry}>
            Yeniden Dene
          </Button>
        )
      }
    />
  </Flex>
);
