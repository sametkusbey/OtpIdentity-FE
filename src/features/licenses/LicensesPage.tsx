import {
  DeleteOutlined,
  // EditOutlined, // Şimdilik gizli
  PlusOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { SurfaceCard } from '@/components/layout/SurfaceCard';
import { TableFilterBar } from '@/components/table/TableFilterBar';
import {
  fetchEntityById,
  useCreateMutation,
  useCrudList,
  useDeleteMutation,
  useUpdateMutation,
} from '@/hooks/useCrud';
import type {
  AppDto,
  DealerDto,
  Guid,
  LicenseCardDto,
  LicenseDto,
} from '@/types/entities';
import type { ApiError } from '@/lib/apiClient';
// import { apiClient } from '@/lib/apiClient'; // Şimdilik gizli
import { formatDate } from '@/utils/formatters';
import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';

type LicenseFormValues = {
  dealerId: Guid;
  appId: Guid;
  licenseCardId: Guid;
  initialExtraUserCount?: number;
  isLocked?: boolean;
};

type LicenseCreatePayload = {
  dealerId: Guid;
  appId: Guid;
  licenseCardId: Guid;
  initialExtraUserCount: number;
};

type LicenseUpdatePayload = {
  dealerId: Guid;
  appId: Guid;
  licenseCardId: Guid;
  isLocked: boolean;
};

const renewalOptions = [
  { label: 'Gün', value: 1 },
  { label: 'Ay', value: 2 },
  { label: 'Yıl', value: 3 },
];

// Kalan gün hesaplama fonksiyonu
const calculateRemainingDays = (endDate?: string | null): number => {
  if (!endDate) return 0;
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const LicensesPage = () => {
  const [form] = Form.useForm<LicenseFormValues>();
  const { modal } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Guid | null>(null);

  const {
    data: licenses,
    isLoading,
    isError,
    refetch,
  } = useCrudList<LicenseDto>('licenses');

  // Yetki mantıklı dealer listesi (for-company-addresses endpoint'i kullanıyoruz)
  const { data: dealers } = useCrudList<DealerDto>('dealers/for-company-addresses');
  const { data: apps } = useCrudList<AppDto>('apps');
  const { data: licenseCards } = useCrudList<LicenseCardDto>('licenseCards');

  const createMutation = useCreateMutation<LicenseCreatePayload>('licenses', {
    successMessage: 'Lisans Oluşturuldu.',
  });

  const updateMutation = useUpdateMutation<LicenseUpdatePayload>('licenses', {
    successMessage: 'Lisans Güncellendi.',
  });

  const deleteMutation = useDeleteMutation('licenses', {
    successMessage: 'Lisans silindi.',
  });

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditingId(null);
    }
  }, [form, isModalOpen]);

  const dealerOptions = useMemo(
    () =>
      dealers?.map((dealer) => ({
        label: `${dealer.title}${dealer.isCustomer ? ' (Müşteri)' : ' (Bayi)'}`,
        value: dealer.id,
      })) ?? [],
    [dealers],
  );

  const appOptions = useMemo(
    () =>
      apps?.map((app) => ({
        label: app.appName,
        value: app.id,
      })) ?? [],
    [apps],
  );

  const licenseCardOptions = useMemo(
    () =>
      licenseCards?.map((card) => ({
        label: card.cardName,
        value: card.id,
      })) ?? [],
    [licenseCards],
  );

  const dealerMap = useMemo(() => {
    const map = new Map<Guid, DealerDto>();
    dealers?.forEach((dealer) => map.set(dealer.id, dealer));
    return map;
  }, [dealers]);

  const appMap = useMemo(() => {
    const map = new Map<Guid, AppDto>();
    apps?.forEach((app) => map.set(app.id, app));
    return map;
  }, [apps]);

  const licenseCardMap = useMemo(() => {
    const map = new Map<Guid, LicenseCardDto>();
    licenseCards?.forEach((card) => map.set(card.id, card));
    return map;
  }, [licenseCards]);

  const openCreateModal = () => setIsModalOpen(true);

  // Şimdilik gizli - düzenleme butonu kapalı
  // @ts-ignore - openEditModal kullanılmıyor şimdilik
  const openEditModal = async (id: Guid) => {
    try {
      const license = await fetchEntityById<LicenseDto>('licenses', id);
      setEditingId(id);
      form.setFieldsValue({
        dealerId: license.dealerId,
        appId: license.appId,
        licenseCardId: license.licenseCardId,
        initialExtraUserCount: 0, // Edit modunda gösterilmeyecek
        isLocked: license.isLocked,
      });
      setIsModalOpen(true);
    } catch {
      // handled globally
    }
  };

  const handleDelete = (id: Guid) => {
    modal.confirm({
      title: 'Lisansı silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      centered: true,
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        const payload: LicenseUpdatePayload = {
          dealerId: values.dealerId,
          appId: values.appId,
          licenseCardId: values.licenseCardId,
          isLocked: values.isLocked ?? false,
        };
        await updateMutation.mutateAsync({ id: editingId, payload });
      } else {
        const payload: LicenseCreatePayload = {
          dealerId: values.dealerId,
          appId: values.appId,
          licenseCardId: values.licenseCardId,
          initialExtraUserCount: values.initialExtraUserCount ?? 0,
        };
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      const apiError = error as ApiError;
      applyValidationErrors(apiError, form);
    }
  };

  const [search, setSearch] = useState('');
  const filteredLicenses = useMemo(() => filterByQuery(licenses, search), [licenses, search]);

  const columns: ColumnsType<LicenseDto> = [
    {
      title: 'Müşteri/Bayi',
      dataIndex: 'dealerId',
      render: (value: Guid) => {
        const dealer = dealerMap.get(value);
        return dealer ? `${dealer.title}${dealer.isCustomer ? ' (Müşteri)' : ' (Bayi)'}` : '-';
      },
    },
    {
      title: 'Uygulama',
      dataIndex: 'appId',
      render: (value: Guid) => appMap.get(value)?.appName ?? '-',
    },
    {
      title: 'Lisans Kartı',
      dataIndex: 'licenseCardId',
      render: (value: Guid) => licenseCardMap.get(value)?.cardName ?? '-',
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      render: (value?: string | null) => formatDate(value),
    },
    {
      title: 'Kalan Gün',
      dataIndex: 'endDate',
      render: (value?: string | null) => {
        const days = calculateRemainingDays(value);
        let color = 'green';
        if (days === 0) color = 'red';
        else if (days <= 7) color = 'orange';
        else if (days <= 30) color = 'gold';
        return <Tag color={color}>{days} Gün</Tag>;
      },
      sorter: (a, b) => calculateRemainingDays(a.endDate) - calculateRemainingDays(b.endDate),
    },
    {
      title: 'Kullanıcı Sayısı',
      key: 'userCount',
      render: (_, record) => {
        const base = record.baseUserCount;
        const extra = record.activeExtraUserCount;
        const total = record.totalUserCount;
        
        return (
          <Space direction="vertical" size={0}>
            <Tag color="blue" style={{ margin: 0 }}>
              {total} Kullanıcı
            </Tag>
            {extra > 0 && (
              <span style={{ fontSize: '12px', color: '#888' }}>
                Ana: {base} + {extra} Ekstra
              </span>
            )}
            {extra === 0 && (
              <span style={{ fontSize: '12px', color: '#888' }}>
                Ana Paket: {base}
              </span>
            )}
          </Space>
        );
      },
      sorter: (a, b) => a.totalUserCount - b.totalUserCount,
    },
    {
      title: 'Yenileme Periyodu',
      dataIndex: 'renewalPeriod',
      render: (value: number, record) =>
        `${value} ${
          renewalOptions.find((opt) => opt.value === record.renewalPeriodType)?.label ?? ''
        }`,
    },
    {
      title: 'Kilitle',
      dataIndex: 'isLocked',
      render: (value: boolean) => (
        <Tag color={value ? 'red' : 'default'}>{value ? 'Kilitli' : 'Açık'}</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          {/* <Tooltip title="Düzenle">
            <Button icon={<EditOutlined />} onClick={() => void openEditModal(record.id)} />
          </Tooltip> */}
          <Tooltip title="Sil">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState text="Lisanslar Yükleniyor..." />;
  }

  if (isError || !licenses) {
    return (
      <ErrorState
        subtitle="Lisanslar alınırken bir hata oluştu."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Lisans Yönetimi"
        description="Lisans kayıtlarını yönetin, yeni lisans ekleyin."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Lisans
          </Button>
        }
      />

      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<LicenseDto>
          rowKey="id"
          dataSource={filteredLicenses}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>

      <Modal
        title={editingId ? 'Lisansı Düzenle' : 'Yeni Lisans'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void handleSubmit()}
        okText={editingId ? 'Güncelle' : 'Oluştur'}
        cancelText="Vazgeç"
        width={560}
      >
        <Form<LicenseFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            initialExtraUserCount: 0,
            isLocked: false,
          }}
        >
          <Row gutter={[18, 18]}>
            <Col xs={24}>
              <Form.Item
                label="Müşteri/Bayi"
                name="dealerId"
                rules={[{ required: true, message: 'Müşteri/Bayi seçimi zorunludur.' }]}
              >
                <Select
                  placeholder="Müşteri veya Bayi Seçin"
                  options={dealerOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Uygulama"
                name="appId"
                rules={[{ required: true, message: 'Uygulama seçimi zorunludur.' }]}
              >
                <Select
                  placeholder="Uygulama Seçin"
                  options={appOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Lisans Kartı"
                name="licenseCardId"
                rules={[{ required: true, message: 'Lisans kartı seçimi zorunludur.' }]}
              >
                <Select
                  placeholder="Lisans Kartı Seçin"
                  options={licenseCardOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            {!editingId && (
              <Col xs={24}>
                <Form.Item
                  label="Ekstra Kullanıcı Sayısı"
                  name="initialExtraUserCount"
                  help="Ana pakete ek olarak eklenecek kullanıcı sayısı (varsayılan: 0)"
                >
                  <InputNumber 
                    min={0} 
                    defaultValue={0} 
                    style={{ width: '100%' }}
                    placeholder="Ekstra kullanıcı sayısı"
                  />
                </Form.Item>
              </Col>
            )}

            {editingId && (
              <Col xs={24}>
                <Form.Item
                  label="Kilitle"
                  name="isLocked"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Kilitli" unCheckedChildren="Açık" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </>
  );
};
