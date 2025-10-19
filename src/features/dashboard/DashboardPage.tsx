import { useQuery } from '@tanstack/react-query';

import { useEffect, type ReactNode } from 'react';

import { Card, Col, Flex, Row, Statistic, Tag, Typography } from 'antd';

import {

  AppstoreOutlined,

  IdcardOutlined,

  TeamOutlined,

  UserOutlined,

} from '@ant-design/icons';

import { LoadingState } from '@/components/feedback/LoadingState';

import { ErrorState } from '@/components/feedback/ErrorState';

import { apiClient } from '@/lib/apiClient';

import { primaryColor } from '@/config/theme';

import { PageHeader } from '@/components/layout/PageHeader';

import { SurfaceCard } from '@/components/layout/SurfaceCard';

import { showErrorToast } from '@/lib/toast';



type DashboardStats = {

  totalUsers: number;

  totalDealers: number;

  totalApps: number;

  totalLicenses: number;

};



const infoCards: Array<{

  key: keyof DashboardStats;

  title: string;

  icon: ReactNode;

  color: string;

}> = [

  {

    key: 'totalUsers',

    title: 'Toplam Kullanıcı',

    icon: <UserOutlined />,

    color: '#0f6cbd',

  },

  {

    key: 'totalDealers',

    title: 'Toplam Bayi',

    icon: <TeamOutlined />,

    color: '#f59e0b',

  },

  {

    key: 'totalApps',

    title: 'Aktif Uygulama',

    icon: <AppstoreOutlined />,

    color: '#6366f1',

  },

  {

    key: 'totalLicenses',

    title: 'Lisans Kaydı',

    icon: <IdcardOutlined />,

    color: '#10b981',

  },

];



export const DashboardPage = () => {

  const { data, isLoading, isError, error, refetch } = useQuery<DashboardStats>({

    queryKey: ['dashboard-stats'],

    queryFn: async () => {

      const [

        usersResponse,

        appsResponse,

        licensesResponse,

        dealersResponse,

      ] = await Promise.all([

        apiClient.get<{ data?: number }>('/statistics/users/count'),

        apiClient.get<{ data?: number }>('/statistics/apps/active/count'),

        apiClient.get<{ data?: number }>('/statistics/licenses/count'),

        apiClient.get('/dealers'),

      ]);



      const usersCount = usersResponse.data?.data ?? 0;

      const activeAppsCount = appsResponse.data?.data ?? 0;

      const licenseCount = licensesResponse.data?.data ?? 0;



      const dealersPayload = dealersResponse.data as unknown;

      let dealersCount = 0;

      if (Array.isArray(dealersPayload)) {

        dealersCount = dealersPayload.length;

      } else if (

        dealersPayload &&

        typeof dealersPayload === 'object' &&

        Array.isArray((dealersPayload as { data?: unknown[] }).data)

      ) {

        dealersCount =

          ((dealersPayload as { data: unknown[] }).data ?? []).length;

      }



      return {

        totalUsers: usersCount,

        totalDealers: dealersCount,

        totalApps: activeAppsCount,

        totalLicenses: licenseCount,

      };

    },

    retry: 0,

  });


  useEffect(() => {

    if (error) {

      showErrorToast(error.message);

    }

  }, [error]);



  if (isLoading) {

    return <LoadingState text="Kontrol paneli Yükleniyor..." />;

  }



  if (isError || !data) {

    return (

      <ErrorState

        subtitle="Özet verileri alirken bir problem yasandi."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }


  const stats = data;


  return (

    <Flex vertical gap={28}>

      <PageHeader

        title="Kontrol Paneli"

        description="OtpIdentity altyapisina ait ana metrikleri tek bakista Görüntüleyin."

      />

      <Row gutter={[20, 20]}>

        {infoCards.map((card) => (

          <Col xs={24} sm={12} lg={6} key={card.key}>

            <Card

              bordered={false}

              style={{

                height: '100%',

                borderRadius: 24,

                background: `linear-gradient(135deg, ${card.color}1a 0%, rgba(255,255,255,0.95) 90%)`,

              }}

              bodyStyle={{ padding: 24 }}

            >

              <Flex justify="space-between" align="center">

                <Flex vertical gap={6}>

                  <Typography.Text type="secondary">{card.title}</Typography.Text>

                  <Statistic

                    value={stats[card.key]}

                    valueStyle={{ fontSize: 30, fontWeight: 600 }}

                  />

                </Flex>

                <Flex

                  align="center"

                  justify="center"

                  style={{

                    width: 56,

                    height: 56,

                    borderRadius: '50%',

                    backgroundColor: `${card.color}`,

                    color: '#ffffff',

                    fontSize: 24,

                    boxShadow: '0 12px 30px -18px rgba(15, 23, 42, 0.55)',

                  }}

                >

                  {card.icon}

                </Flex>

              </Flex>

            </Card>

          </Col>

        ))}

      </Row>

      <SurfaceCard style={{ padding: 0 }} bodyStyle={{ padding: 28 }}>

        <Flex vertical gap={12}>

          <Typography.Title level={4} style={{ margin: 0 }}>

            OTP Bilişim Identity Server Kontrol Paneli

          </Typography.Title>

          <Typography.Text>

           Buraya henüz içerik eklenmedi.

          </Typography.Text>

          <Tag color={primaryColor} style={{ alignSelf: 'flex-start' }}>

            Senkronizasyon: Her sayfa yenilemesinde otomatik

          </Tag>

        </Flex>

      </SurfaceCard>

    </Flex>

  );

};



