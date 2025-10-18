import {

  LogoutOutlined,

  MenuFoldOutlined,

  MenuUnfoldOutlined,

} from '@ant-design/icons';

import { Avatar, Button, Flex, Layout, Space, Typography } from 'antd';

import { useLocation } from 'react-router-dom';

import { navigationItems } from '@/constants/navigation';

import { useAuth } from '@/features/auth/AuthContext';



type TopBarProps = {

  collapsed: boolean;

  onToggle: () => void;

};



export const TopBar = ({ collapsed, onToggle }: TopBarProps) => {

  const location = useLocation();

  const { user, logout } = useAuth();



  const activeItem =

    navigationItems.find((item) => item.path === location.pathname) ??

    navigationItems[0];



  return (

    <Layout.Header

      style={{

        padding: '0 28px',

        background: 'rgba(255, 255, 255, 0.85)',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'space-between',

        backdropFilter: 'blur(12px)',

        borderBottom: '1px solid rgba(15, 23, 42, 0.05)',

        boxShadow: '0 18px 30px -26px rgba(15, 23, 42, 0.45)',

      }}

    >

      <Space size={16} align="center">

        <Button

          type="text"

          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}

          onClick={onToggle}

          style={{

            fontSize: 18,
            height: 42,

            borderRadius: 14,

            backgroundColor: 'rgba(6, 146, 62, 0.08)',

          }}

        />

        <Space direction="vertical" size={0}>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>

            Hoş geldiniz

          </Typography.Text>

       

        </Space>

      </Space>

      <Space size={16}>

        <Flex align="center" gap={12}>

          <Avatar style={{ backgroundColor: '#06923e' }}>

            {user?.name?.[0] ?? 'O'}

          </Avatar>

          <Space direction="vertical" size={0}>

            <Typography.Text strong>

              {user?.name ?? 'OtpIdentity Yöneticisi'}

            </Typography.Text>

            {user?.email && (

              <Typography.Text type="secondary">{user.email}</Typography.Text>

            )}

          </Space>

        </Flex>

        <Button

          type="text"

          icon={<LogoutOutlined />}

          onClick={logout}

          style={{

            color: '#d9363e',

            borderRadius: 12,

            background: 'rgba(217, 54, 62, 0.08)',

            paddingInline: 16,

            height: 40,

          }}

        >

          Çıkış Yap

        </Button>

      </Space>

    </Layout.Header>

  );

};



