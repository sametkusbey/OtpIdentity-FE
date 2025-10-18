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

} from '@ant-design/icons';

import type { ReactNode } from 'react';



export type NavigationItem = {

  key: string;

  label: string;

  path: string;

  icon: ReactNode;

};



export const navigationItems: NavigationItem[] = [

  {

    key: 'dashboard',

    label: 'Kontrol Paneli',

    path: '/',

    icon: <DashboardOutlined />,

  },

  {

    key: 'users',

    label: 'Kullanıcılar',

    path: '/kullanicilar',

    icon: <UserOutlined />,

  },

  {

    key: 'dealers',

    label: 'Bayiler',

    path: '/bayiler',

    icon: <TeamOutlined />,

  },

  {

    key: 'apps',

    label: 'Uygulamalar',

    path: '/uygulamalar',

    icon: <AppstoreOutlined />,

  },

  {

    key: 'programs',

    label: 'Programlar',

    path: '/programlar',

    icon: <BranchesOutlined />,

  },

  {

    key: 'programVersions',

    label: 'Program Surumleri',

    path: '/program-surumleri',

    icon: <BarsOutlined />,

  },

  {

    key: 'licenses',

    label: 'Lisanslar',

    path: '/lisanslar',

    icon: <IdcardOutlined />,

  },

  {

    key: 'authorizations',

    label: 'Yetkilendirmeler',

    path: '/yetkilendirmeler',

    icon: <CrownOutlined />,

  },

  {

    key: 'connections',

    label: 'BaÄŸlantÄ±lar',

    path: '/BaÄŸlantÄ±lar',

    icon: <LinkOutlined />,

  },

  {

    key: 'companyAddresses',

    label: 'Şirket Adresleri',

    path: '/Şirket-adresleri',

    icon: <BankOutlined />,

  },

  {

    key: 'companyRepresentatives',

    label: 'Şirket Temsilcileri',

    path: '/Şirket-temsilcileri',

    icon: <ApartmentOutlined />,

  },

];




