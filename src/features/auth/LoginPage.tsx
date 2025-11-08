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
  Checkbox,

} from 'antd';

import dayjs from 'dayjs';

import { useCallback } from 'react';

import { useLocation, useNavigate, type Location } from 'react-router-dom';

import { primaryColor, secondaryColor } from '@/config/theme';

import { useAuth } from './AuthContext';
import { showErrorToast } from '@/lib/toast';
import { portalLogin, type LoginRequest } from '@/features/portalAuth/api';



type FormValues = { username: string; password: string; rememberMe?: boolean };



const currentYear = dayjs().year();



export const LoginPage = () => {

  const { login } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const REMEMBER_KEY = 'otpidentity_remember';

  const readRemember = (): { enabled: boolean; username?: string } => {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as { enabled?: boolean; username?: string };
        return { enabled: !!obj.enabled, username: obj.username };
      }
    } catch {
      // ignore
    }
    return { enabled: false };
  };

  const persistRemember = (enabled: boolean, username?: string) => {
    try {
      if (enabled) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({ enabled: true, username: username ?? '' }),
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      // storage might be blocked; ignore
    }
  };

  const remembered = readRemember();



  const handleFinish = useCallback(
    async (values: FormValues) => {
      try {
        // Dokümantasyona göre LoginRequest interface'ini kullan
        const loginRequest: LoginRequest = {
          username: values.username,
          password: values.password,
        };
        
        const account = await portalLogin(loginRequest);
        
        console.log('Login başarılı - Account data:', {
          id: account.id,
          username: account.username,
          isAdmin: account.isAdmin,
          dealerCode: account.dealerCode,
          hasToken: !!account.token,
          tokenStart: account.token?.substring(0, 20),
          menusCount: account.menus?.length ?? 0
        });
        
        // Dokümantasyona göre response'da dealerCode ÖNEMLİ: Frontend'de saklanmalı
        login({ 
          id: account.id, 
          name: account.username, 
          menus: account.menus, 
          token: account.token, 
          isAdmin: account.isAdmin, 
          dealerCode: account.dealerCode // ÖNEMLİ: Bu saklanmalı
        });
        
        // Remember username if user opted in (do not store password)
        persistRemember(!!values.rememberMe, values.username);
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

            OTP Bilişim Identity Server

          </Typography.Title>

          <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>

            Yönetim paneline erişim için bilgilerinizi girin.

          </Typography.Paragraph>

        </Space>

        <Form<FormValues>

          layout="vertical"

          onFinish={handleFinish}

          style={{ marginTop: 32 }}

          initialValues={{ username: remembered.username ?? '', password: '', rememberMe: remembered.enabled }}

        >

          <Form.Item label="Kullanıcı Adı" name="username" rules={[{ required: true, message: 'Kullanıcı adı zorunludur.' }]}>
            <Input prefix={<UserOutlined />} placeholder="kullanıcı adı" size="large" />
          </Form.Item>

          <Form.Item label="Şifre" name="password" rules={[{ required: true, message: 'Şifre zorunludur.' }]}>

            <Input.Password prefix={<LockOutlined />} placeholder="**********" size="large" />

          </Form.Item>

          <Form.Item name="rememberMe" valuePropName="checked" style={{ marginBottom: 12 }}>
            <Checkbox>Beni hatırla</Checkbox>
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





