import {
  AppstoreOutlined,
  ApartmentOutlined,
  BankOutlined,
  BarsOutlined,
  BranchesOutlined,
  CrownOutlined,
  DashboardOutlined,
  IdcardOutlined,
  LinkOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export type NavigationItem = {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  code: string;
};

export const navigationItems: NavigationItem[] = [
  { key: 'dashboard', label: 'Kontrol Paneli', path: '/', icon: <DashboardOutlined />, code: 'dashboard' },
  { key: 'users', label: 'Kullanıcılar', path: '/kullanicilar', icon: <UserOutlined />, code: 'users' },
  { key: 'dealers', label: 'Bayiler', path: '/bayiler', icon: <TeamOutlined />, code: 'dealers' },
  { key: 'apps', label: 'Uygulamalar', path: '/uygulamalar', icon: <AppstoreOutlined />, code: 'apps' },
  { key: 'programs', label: 'Programlar', path: '/programlar', icon: <BranchesOutlined />, code: 'programs' },
  { key: 'programVersions', label: 'Program Sürümleri', path: '/program-surumleri', icon: <BarsOutlined />, code: 'programVersions' },
  { key: 'licenses', label: 'Lisanslar', path: '/lisanslar', icon: <IdcardOutlined />, code: 'licenses' },
  { key: 'authorizations', label: 'Yetkilendirmeler', path: '/yetkilendirmeler', icon: <CrownOutlined />, code: 'authorizations' },
  { key: 'connections', label: 'Bağlantılar', path: '/baglantilar', icon: <LinkOutlined />, code: 'connections' },
  { key: 'companyAddresses', label: 'Şirket Adresleri', path: '/sirket-adresleri', icon: <BankOutlined />, code: 'companyAddresses' },
  { key: 'companyRepresentatives', label: 'Şirket Temsilcileri', path: '/sirket-temsilcileri', icon: <ApartmentOutlined />, code: 'companyRepresentatives' }
,
  { key: 'generalSettings', label: 'Genel Ayarlar', path: '/genel-ayarlar', icon: <SettingOutlined />, code: 'generalSettings' }];

// navigationItems array'inde herhangi bir değişiklik yapmıyorum çünkü label menüde görünmeli.
// Ancak PageHeader componentlerinde navigationItems'dan gelen label kullanılmamalı.
// Her sayfa kendi başlığını PageHeader'da manuel olarak belirlemeli.
// Eğer bir yerde otomatik olarak navigationItems'dan label çekiliyorsa, bu bağlantıyı kaldırın ve başlığı sabit string olarak bırakın.
// Örneğin:
// <PageHeader title={currentNavItem?.label} ... />
// yerine
// <PageHeader title="Kullanıcı Yönetimi" ... />
// şeklinde olmalı.










