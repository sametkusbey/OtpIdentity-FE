import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
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
  Guid,
  LicenseCardDto,
  RenewalPeriodType,
} from '@/types/entities';
import type { ApiError } from '@/lib/apiClient';
import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';

type LicenseCardFormValues = Omit<LicenseCardDto, 'id'>;

type LicenseCardPayload = Omit<LicenseCardDto, 'id'>;

const renewalOptions = [
  { label: 'Gün', value: 1 },
  { label: 'Ay', value: 2 },
  { label: 'Yıl', value: 3 },
];

export const LicenseCardsPage = () => {
  const [form] = Form.useForm<LicenseCardFormValues>();
  const { modal } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Guid | null>(null);

  const {
    data: licenseCards,
    isLoading,
    isError,
    refetch,
  } = useCrudList<LicenseCardDto>('licenseCards');

  const createMutation = useCreateMutation<LicenseCardPayload>('licenseCards', {
    successMessage: 'Lisans Kartı Oluşturuldu.',
  });

  const updateMutation = useUpdateMutation<LicenseCardPayload>('licenseCards', {
    successMessage: 'Lisans Kartı Güncellendi.',
  });

  const deleteMutation = useDeleteMutation('licenseCards', {
    successMessage: 'Lisans Kartı silindi.',
  });

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditingId(null);
    }
  }, [form, isModalOpen]);

  const openCreateModal = () => setIsModalOpen(true);

  const openEditModal = async (id: Guid) => {
    try {
      const card = await fetchEntityById<LicenseCardDto>('licenseCards', id);
      setEditingId(id);
      form.setFieldsValue({
        cardName: card.cardName,
        renewalPeriod: card.renewalPeriod,
        renewalPeriodType: card.renewalPeriodType,
        baseUserCount: card.baseUserCount,
      });
      setIsModalOpen(true);
    } catch {
      // handled globally
    }
  };

  const handleDelete = (id: Guid) => {
    modal.confirm({
      title: 'Lisans kartını silmek istediğinize emin misiniz?',
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
      const payload: LicenseCardPayload = values;

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      const apiError = error as ApiError;
      applyValidationErrors(apiError, form);
    }
  };

  const [search, setSearch] = useState('');
  const filteredLicenseCards = useMemo(() => filterByQuery(licenseCards, search), [licenseCards, search]);

  const columns: ColumnsType<LicenseCardDto> = [
    {
      title: 'Kart Adı',
      dataIndex: 'cardName',
      sorter: (a, b) => a.cardName.localeCompare(b.cardName),
    },
    {
      title: 'Ana Paket Kullanıcı',
      dataIndex: 'baseUserCount',
      render: (value: number) => (
        <Tag color="green">{value} Kullanıcı</Tag>
      ),
      sorter: (a, b) => a.baseUserCount - b.baseUserCount,
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
      title: 'Periyot Tipi',
      dataIndex: 'renewalPeriodType',
      render: (value: RenewalPeriodType) => {
        const option = renewalOptions.find((opt) => opt.value === value);
        const colors: Record<number, string> = { 1: 'blue', 2: 'green', 3: 'orange' };
        return <Tag color={colors[value]}>{option?.label ?? '-'}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button icon={<EditOutlined />} onClick={() => void openEditModal(record.id)} />
          </Tooltip>
          <Tooltip title="Sil">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState text="Lisans Kartları Yükleniyor..." />;
  }

  if (isError || !licenseCards) {
    return (
      <ErrorState
        subtitle="Lisans kartları alınırken bir hata oluştu."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Lisans Kartı Yönetimi"
        description="Lisans kartı şablonlarını yönetin, yeni lisans kartı ekleyin."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Lisans Kartı
          </Button>
        }
      />

      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<LicenseCardDto>
          rowKey="id"
          dataSource={filteredLicenseCards}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </SurfaceCard>

      <Modal
        title={editingId ? 'Lisans Kartını Düzenle' : 'Yeni Lisans Kartı'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void handleSubmit()}
        okText={editingId ? 'Güncelle' : 'Oluştur'}
        cancelText="Vazgeç"
        width={560}
      >
        <Form<LicenseCardFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            renewalPeriodType: 2 as RenewalPeriodType,
            renewalPeriod: 1,
            baseUserCount: 1,
          }}
        >
          <Row gutter={[18, 18]}>
            <Col xs={24}>
              <Form.Item
                label="Kart Adı"
                name="cardName"
                rules={[{ required: true, message: 'Kart adı zorunludur.' }]}
              >
                <Input placeholder="Örn: 1 Aylık Lisans" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Yenileme Periyodu"
                name="renewalPeriod"
                rules={[
                  { required: true, message: 'Yenileme periyodu zorunludur.' },
                  {
                    validator(_, value) {
                      if (!value || value <= 0) {
                        return Promise.reject(
                          new Error('Periyot sıfırdan büyük olmalıdır.'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Periyot Tipi"
                name="renewalPeriodType"
                rules={[{ required: true, message: 'Periyot tipi zorunludur.' }]}
              >
                <Select options={renewalOptions} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Ana Paket Kullanıcı Sayısı"
                name="baseUserCount"
                rules={[
                  { required: true, message: 'Kullanıcı sayısı zorunludur.' },
                  {
                    validator(_, value) {
                      if (!value || value <= 0) {
                        return Promise.reject(
                          new Error('Kullanıcı sayısı sıfırdan büyük olmalıdır.'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                help="Bu lisans kartı kaç kullanıcıyı içeriyor? (Ana paket)"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

