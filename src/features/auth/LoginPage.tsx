import { LockOutlined, UserOutlined } from '@ant-design/icons';

import {

  Button,

  Card,

  Col,

  Flex,

  Form,

  Input,

  Row,

  Space,

  Typography,

} from 'antd';

import dayjs from 'dayjs';

import { useCallback } from 'react';

import { useLocation, useNavigate, type Location } from 'react-router-dom';

import { primaryColor, secondaryColor } from '@/config/theme';

import { useAuth } from './AuthContext';
import { showErrorToast } from '@/lib/toast';
import { portalLogin } from '@/features/portalAuth/api';



type FormValues = { username: string; password: string };



const currentYear = dayjs().year();



export const LoginPage = () => {

  const { login } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();



  const handleFinish = useCallback(
    async (values: FormValues) => {
      try {
        const account = await portalLogin(values.username, values.password);
        login({ id: (account as any).id, name: account.username, menus: (account as any).menus });
        const redirectPath = (location.state as { from?: Location })?.from?.pathname ?? '/';
        navigate(redirectPath, { replace: true });
      } catch (e) {
        const err = e as { message?: string } | undefined;
        const message = err?.message && err.message.trim() !== '' ? err.message : 'Giriş başarısız. Sunucuya erişilemedi (CORS/SSL).';
        showErrorToast(message);
      }
    },
    [location.state, login, navigate],
  );



  return (

    <div

      style={{

        minHeight: '100vh',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        background: `radial-gradient(circle at 10% 20%, rgba(6, 146, 62, 0.35), transparent 55%), linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,

        padding: '48px 16px',

      }}

    >

      <Card

        style={{

          maxWidth: 440,

          width: '100%',

          borderRadius: 28,

          boxShadow: '0 36px 80px -30px rgba(15, 23, 42, 0.55)',

        }}

        bodyStyle={{ padding: '48px 44px' }}

      >

        <Space direction="vertical" size={12} style={{ width: '100%' }}>

      

          <Typography.Title

            level={3}

            style={{ margin: 0, color: secondaryColor, textAlign: 'center' }}

          >

            Identity Server Paneli

          </Typography.Title>

          <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>

            Yönetim paneline erişim için bilgilerinizi girin.

          </Typography.Paragraph>

        </Space>

        <Form<FormValues>

          layout="vertical"

          onFinish={handleFinish}

          style={{ marginTop: 32 }}

          initialValues={{ username: '', password: '' }}

        >

          <Form.Item label="Kullanıcı Adı" name="username" rules={[{ required: true, message: 'Kullanıcı adı zorunludur.' }]}>
            <Input prefix={<UserOutlined />} placeholder="kullanıcı adı" size="large" />
          </Form.Item>

          <Form.Item label="Şifre" name="password" rules={[{ required: true, message: 'Şifre zorunludur.' }]}>

            <Input.Password prefix={<LockOutlined />} placeholder="***" size="large" />

          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>

            <Button

              type="primary"

              htmlType="submit"

              block

              size="large"

              style={{

                background: `linear-gradient(135deg, ${primaryColor} 0%, #0a7d35 100%)`,

                border: 'none',

                borderRadius: 16,

              }}

            >

              Giriş Yap

            </Button>

          </Form.Item>

        </Form>

        <Row style={{ marginTop: 28 }}>

          <Col span={24}>

            <Flex justify="center">

              <Typography.Text type="secondary" style={{ fontSize: 12 }}>

                © {currentYear} Otp Bilişim Identity Server

              </Typography.Text>

            </Flex>

          </Col>

        </Row>

      </Card>

    </div>

  );

};





