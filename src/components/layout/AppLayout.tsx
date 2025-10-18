import { Layout, Drawer, Grid } from 'antd';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NavigationMenu } from './NavigationMenu';

const { Content } = Layout;

export const AppLayout = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      )}
      <Layout>
        <TopBar collapsed={collapsed && !isMobile} onToggle={handleToggle} />
        <Content style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="page-shell">
            <Outlet />
          </div>
        </Content>
      </Layout>
      <Drawer
        placement="left"
        width={280}
        open={isMobile && mobileOpen}
        closable={false}
        onClose={() => setMobileOpen(false)}
        bodyStyle={{ padding: 0, backgroundColor: '#333446' }}
      >
        <div style={{ height: '100%', backgroundColor: '#333446' }}>
          <NavigationMenu onNavigate={() => setMobileOpen(false)} />
        </div>
      </Drawer>
    </Layout>
  );
};
