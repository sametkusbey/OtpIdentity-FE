import { Layout, Typography } from 'antd';
import { primaryColor } from '@/config/theme';
import { NavigationMenu } from './NavigationMenu';

type SidebarProps = {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
};

export const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={64}
      width={260}
      style={{
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        paddingInline: 12,
        boxShadow: '8px 0 24px -24px rgba(15, 23, 42, 0.65)',
      }}
      trigger={null}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '32px 0 20px' : '28px 12px 20px',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '18px',
            backgroundColor: primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 18,
            boxShadow: '0 12px 28px -18px rgba(6, 146, 62, 0.65)',
          }}
        >
          OI
        </div>
        {!collapsed && (
          <Typography.Title
            level={4}
            style={{ color: '#ffffff', margin: 0, fontSize: 20, letterSpacing: 0.3 }}
          >
            OtpIdentity
          </Typography.Title>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <NavigationMenu />
      </div>
    </Layout.Sider>
  );
};
