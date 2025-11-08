import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Input, Modal, Row, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { SurfaceCard } from '@/components/layout/SurfaceCard';
import { TableFilterBar } from '@/components/table/TableFilterBar';

import { apiClient, type ApiError } from '@/lib/apiClient';
import type { DealerDto, Guid } from '@/types/entities';
import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';

type CustomerFormValues = Omit<DealerDto, 'id' | 'isCustomer' | 'dealerCode' | 'userIds'> & {
  // no dealerCode and no isCustomer toggle in the form
};

export const CustomersPage = () => {
  const [form] = Form.useForm<CustomerFormValues>();
  const { modal, message } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Guid | null>(null);
  const mineOnly = true; // always only my customers per PRD

  const listQuery = useQuery<DealerDto[], ApiError>({
    queryKey: ['customers', { mineOnly }],
    queryFn: async () => {
      const url = `/dealers?isCustomer=true${mineOnly ? '&mineOnly=true' : ''}`;
      const res = await apiClient.get(url);
      const payload = res.data as unknown;
      // Result wrapper or array
      if (Array.isArray(payload)) return payload as DealerDto[];
      const data = (payload as { data?: unknown })?.data;
      return (Array.isArray(data) ? (data as DealerDto[]) : []) as DealerDto[];
    },
  });

  const refetch = () => listQuery.refetch();

  const createMutation = useMutation<DealerDto, ApiError, CustomerFormValues>({
    mutationFn: async (values) => {
      const payload = { ...values, isCustomer: true } as any;
      const res = await apiClient.post('/dealers', payload);
      const data = (res.data as any)?.data ?? res.data;
      return data as DealerDto;
    },
    onSuccess: async () => {
      await refetch();
      message.success('Musteri olusturuldu.');
    },
  });

  const updateMutation = useMutation<DealerDto, ApiError, { id: Guid; payload: CustomerFormValues }>({
    mutationFn: async ({ id, payload }) => {
      const body = { ...payload, isCustomer: true } as any;
      const res = await apiClient.put(`/dealers/${id}`, body);
      const data = (res.data as any)?.data ?? res.data;
      return data as DealerDto;
    },
    onSuccess: async () => {
      await refetch();
      message.success('Musteri guncellendi.');
    },
  });

  const deleteMutation = useMutation<unknown, ApiError, Guid>({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/dealers/${id}`);
      return res.data;
    },
    onSuccess: async () => {
      await refetch();
      message.success('Musteri silindi.');
    },
  });

  const data = listQuery.data ?? [];
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => filterByQuery(data, search), [data, search]);

  useEffect(() => {
    if (!isModalOpen) form.resetFields();
  }, [isModalOpen, form]);

  const openCreate = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = useCallback(async (id: Guid) => {
    try {
      const res = await apiClient.get(`/dealers/${id}`);
      const entity = ((res.data as any)?.data ?? res.data) as DealerDto;
      setEditingId(id);
      setIsModalOpen(true);
      form.setFieldsValue({
        taxIdentifierNumber: entity.taxIdentifierNumber,
        title: entity.title,
        companyType: entity.companyType,
        city: entity.city,
        district: entity.district,
        companyPhoneNumber: entity.companyPhoneNumber,
        companyEmailAddress: entity.companyEmailAddress,
      } as CustomerFormValues);
    } catch (e) {
      // ignore, error UI handles below
    }
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CustomerFormValues = {
        taxIdentifierNumber: String(values.taxIdentifierNumber || '').trim(),
        title: String(values.title || '').trim(),
        companyType: values.companyType,
        city: String(values.city || '').trim(),
        district: String(values.district || '').trim(),
        companyPhoneNumber: String(values.companyPhoneNumber || '').trim(),
        companyEmailAddress: String(values.companyEmailAddress || '').trim(),
      } as CustomerFormValues;
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (e) {
      const err = e as ApiError;
      applyValidationErrors(err, form);
    }
  };

  const handleDelete = (id: Guid) => {
    modal.confirm({
      title: 'Kaydi silmek istediginize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgec',
      centered: true,
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const columns: ColumnsType<DealerDto> = [
    { title: 'Unvan', dataIndex: 'title' },
    { title: 'Vergi No', dataIndex: 'taxIdentifierNumber' },
    { title: 'Sehir', dataIndex: 'city' },
    { title: 'Ilce', dataIndex: 'district' },
    { title: 'Telefon', dataIndex: 'companyPhoneNumber' },
    { title: 'E-posta', dataIndex: 'companyEmailAddress' },
    { title: 'Musteri mi?', dataIndex: 'isCustomer', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Evet' : 'Hayir'}</Tag> },
    { title: 'Kod', dataIndex: 'dealerCode', render: (v?: string | null) => v ?? '-' },
    {
      title: 'Islemler',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Duzenle">
            <Button icon={<EditOutlined />} onClick={() => void openEdit(record.id)} />
          </Tooltip>
          <Tooltip title="Sil">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (listQuery.isLoading) return <LoadingState text="Musteriler yukleniyor..." />;
  if (listQuery.isError || !data) return <ErrorState onRetry={() => void refetch()} subtitle="Musteriler alinirken bir hata olustu." />;

  return (
    <>
      <PageHeader
        title="Musteriler"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Yeni Musteri
          </Button>
        }
      />

      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<DealerDto>
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </SurfaceCard>

      <Modal
        title={editingId ? 'Musteriyi Duzenle' : 'Yeni Musteri'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onOk={handleSubmit}
        okText={editingId ? 'Guncelle' : 'Olustur'}
        cancelText="Vazgec"
        width={640}
      >
        <Form<CustomerFormValues> form={form} layout="vertical">
          <Row gutter={[18, 18]}>
            <Col xs={24} md={12}>
              <Form.Item label="Vergi No" name="taxIdentifierNumber" rules={[{ required: true, message: 'Vergi no zorunludur.' }, { max: 32 }]}>
                <Input placeholder="Vergi no" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Unvan" name="title" rules={[{ required: true, message: 'Unvan zorunludur.' }, { max: 128 }]}>
                <Input placeholder="Unvan" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Sehir" name="city" rules={[{ required: true }, { max: 64 }]}>
                <Input placeholder="Sehir" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ilce" name="district" rules={[{ required: true }, { max: 64 }]}>
                <Input placeholder="Ilce" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Telefon" name="companyPhoneNumber" rules={[{ required: true }, { max: 32 }]}>
                <Input placeholder="Telefon" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="E-posta" name="companyEmailAddress" rules={[{ required: true }, { type: 'email', message: 'Gecerli bir e-posta girin.' }, { max: 256 }]}>
                <Input placeholder="ornek@firma.com" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
