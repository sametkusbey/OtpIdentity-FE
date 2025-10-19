import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '48px 24px' }}>
      <Result
        status="403"
        title="403"
        subTitle="Bu sayfaya erişim yetkiniz yok."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
        }
      />
    </div>
  );
};

