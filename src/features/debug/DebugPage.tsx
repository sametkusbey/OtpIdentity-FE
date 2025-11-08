import { useState } from 'react';
import { Button, Card, Space, Typography, Divider } from 'antd';
import { listPortalMenus } from '@/features/portalMenus/api';
import { listPortalAccounts } from '@/features/portalAuth/api';
import { listDealers } from '@/features/dealers/api';
import { useAuth } from '@/features/auth/AuthContext';
import { apiClient } from '@/lib/apiClient';

const { Title, Text } = Typography;

export const DebugPage = () => {
  const { user } = useAuth();
  const [menusResult, setMenusResult] = useState<any>(null);
  const [accountsResult, setAccountsResult] = useState<any>(null);
  const [dealersResult, setDealersResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = () => {
    console.log('=== AUTH STATUS ===');
    console.log('User:', user);
    console.log('Token exists:', !!user?.token);
    console.log('Is admin:', user?.isAdmin);
    console.log('Dealer code:', user?.dealerCode);
    console.log('Authorization header:', (apiClient.defaults.headers as any)?.common?.Authorization);
    console.log('LocalStorage token:', localStorage.getItem('otpidentity_token'));
    console.log('LocalStorage auth:', localStorage.getItem('otpidentity_auth'));
    
    // Token'ı parse et
    if (user?.token) {
      try {
        const tokenParts = user.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('JWT Payload:', payload);
        }
      } catch (e) {
        console.error('Token parse hatası:', e);
      }
    }
  };

  const testMenus = async () => {
    try {
      setLoading(true);
      console.log('Testing listPortalMenus...');
      const result = await listPortalMenus();
      console.log('Menüler sonucu:', result);
      setMenusResult(result);
    } catch (error: any) {
      console.error('Menüler hatası:', error);
      setMenusResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = async () => {
    try {
      setLoading(true);
      console.log('Testing listPortalAccounts...');
      const result = await listPortalAccounts();
      console.log('Portal hesapları sonucu:', result);
      setAccountsResult(result);
    } catch (error: any) {
      console.error('Portal hesapları hatası:', error);
      setAccountsResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDealers = async () => {
    try {
      setLoading(true);
      console.log('Testing listDealers...');
      const result = await listDealers({ isCustomer: false });
      console.log('Bayiler sonucu:', result);
      setDealersResult(result);
    } catch (error: any) {
      console.error('Bayiler hatası:', error);
      setDealersResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>API Debug Sayfası</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Auth Status">
          <Space>
            <Button onClick={checkAuthStatus}>
              Auth Durumunu Kontrol Et
            </Button>
            <Text>User: {user?.name || 'Not logged in'}</Text>
            <Text>Token: {user?.token ? 'Exists' : 'Missing'}</Text>
          </Space>
        </Card>

        <Card title="Portal Menüleri Test">
          <Space>
            <Button onClick={testMenus} loading={loading}>
              Menüleri Test Et
            </Button>
            {menusResult && (
              <div>
                <Divider />
                <Text strong>Sonuç:</Text>
                <pre style={{ background: '#f5f5f5', padding: '8px', marginTop: '8px' }}>
                  {JSON.stringify(menusResult, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        </Card>

        <Card title="Portal Hesapları Test">
          <Space>
            <Button onClick={testAccounts} loading={loading}>
              Portal Hesaplarını Test Et
            </Button>
            {accountsResult && (
              <div>
                <Divider />
                <Text strong>Sonuç:</Text>
                <pre style={{ background: '#f5f5f5', padding: '8px', marginTop: '8px' }}>
                  {JSON.stringify(accountsResult, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        </Card>

        <Card title="Bayiler Test">
          <Space>
            <Button onClick={testDealers} loading={loading}>
              Bayileri Test Et
            </Button>
            {dealersResult && (
              <div>
                <Divider />
                <Text strong>Sonuç:</Text>
                <pre style={{ background: '#f5f5f5', padding: '8px', marginTop: '8px' }}>
                  {JSON.stringify(dealersResult, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
};
