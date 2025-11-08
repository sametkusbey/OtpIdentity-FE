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
  SettingOutlined,
  BugOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export type NavigationItem = {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  code: string;
};

// Not: Turkce metinler ASCII olacak sekilde yazilir.
export const navigationItems: NavigationItem[] = [
  { key: 'dashboard', label: 'Kontrol Paneli', path: '/', icon: <DashboardOutlined />, code: 'dashboard' },
  { key: 'users', label: 'Kullanicilar', path: '/kullanicilar', icon: <UserOutlined />, code: 'users' },
  { key: 'dealers', label: 'Bayiler', path: '/bayiler', icon: <TeamOutlined />, code: 'dealers' },
  { key: 'apps', label: 'Uygulamalar', path: '/uygulamalar', icon: <AppstoreOutlined />, code: 'apps' },
  { key: 'programs', label: 'Programlar', path: '/programlar', icon: <BranchesOutlined />, code: 'programs' },
  { key: 'programVersions', label: 'Program Versiyonlari', path: '/program-surumleri', icon: <BarsOutlined />, code: 'programVersions' },
  { key: 'customers', label: 'Musteriler', path: '/musteriler', icon: <TeamOutlined />, code: 'customers' },
  { key: 'programEditions', label: 'Program Sürümleri', path: '/program-yayinlari', icon: <BarsOutlined />, code: 'programEditions' },
  { key: 'licenses', label: 'Lisanslar', path: '/lisanslar', icon: <IdcardOutlined />, code: 'licenses' },
  { key: 'authorizations', label: 'Yetkilendirmeler', path: '/yetkilendirmeler', icon: <CrownOutlined />, code: 'authorizations' },
  { key: 'connections', label: 'Baglantilar', path: '/baglantilar', icon: <LinkOutlined />, code: 'connections' },
  { key: 'companyAddresses', label: 'Sirket Adresleri', path: '/sirket-adresleri', icon: <BankOutlined />, code: 'companyAddresses' },
  { key: 'companyRepresentatives', label: 'Sirket Temsilcileri', path: '/sirket-temsilcileri', icon: <ApartmentOutlined />, code: 'companyRepresentatives' },
  { key: 'generalSettings', label: 'Genel Ayarlar', path: '/genel-ayarlar', icon: <SettingOutlined />, code: 'generalSettings' },
  { key: 'debug', label: 'Debug', path: '/debug', icon: <BugOutlined />, code: 'debug' },
];
