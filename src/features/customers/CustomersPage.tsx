import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Input, Modal, Row, Space, Table, Tag, Tooltip, Select } from 'antd';
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
import { CompanyType } from '@/types/entities';
import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';
import { useAuth } from '@/features/auth/AuthContext';
import { listCustomers, createCustomer, updateCustomer, deleteCustomer, type CreateCustomerRequest, type UpdateCustomerRequest } from './api';

type CustomerFormValues = Omit<CreateCustomerRequest, 'userIds' | 'isCustomer' | 'dealerCode'> & {
  // userIds, isCustomer, dealerCode otomatik set edilir
};

export const CustomersPage = () => {
  const [form] = Form.useForm<CustomerFormValues>();
  const { modal, message } = App.useApp();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Guid | null>(null);
  const listQuery = useQuery<DealerDto[], ApiError>({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Müşteriler yükleniyor...');
        console.log('Current auth state:', {
          isAuthenticated: !!document.querySelector('[data-auth-token]'),
          hasApiToken: !!(window as any).apiClient?.defaults?.headers?.common?.Authorization
        });
        
        // Dokümantasyona göre customers API'sini kullan
        // Backend otomatik olarak giriş yapan kullanıcının bayi koduna göre filtreleme yapar
        // Admin kullanıcılar tüm müşterileri görebilir
        // Normal kullanıcılar sadece kendi bayi koduna ait müşterileri görür
        const result = await listCustomers();
        console.log('Müşteriler yüklendi:', result);
        return result;
      } catch (error: any) {
        console.error('Müşteriler yüklenirken hata:', error);
        console.error('Error details:', {
          message: error?.message,
          status: error?.status,
          response: error?.response?.data,
          config: error?.config
        });
        throw error;
      }
    },
  });

  const refetch = () => listQuery.refetch();

  const createMutation = useMutation<DealerDto, ApiError, CustomerFormValues>({
    mutationFn: async (values) => {
      // Bayi kontrolü - admin değilse ve bayi kodu yoksa hata fırlat
      if (!user?.isAdmin && !user?.dealerCode) {
        throw new Error('Henüz bayiliğiniz tanımlanmadığı için müşteri oluşturamazsınız.');
      }
      
      // Dokümantasyona göre createCustomer API'sini kullan
      // Backend otomatik olarak:
      // - IsCustomer = true set eder
      // - DealerCode = parent bayinin DealerCode'u atar (user.dealerCode kullanılır)
      // - ParentDealerId = parent bayinin Id'si atar
      // - OwnerPortalAccountId = giriş yapan kullanıcının Id'si atar
      const request: CreateCustomerRequest = {
        ...values,
        isCustomer: true, // Her zaman true
        dealerCode: null, // Backend otomatik atar (user.dealerCode kullanılır)
        userIds: [], // Boş array gönder
      };
      return await createCustomer(request);
    },
    onSuccess: async () => {
      await refetch();
      message.success('Müşteri oluşturuldu.');
    },
  });

  const updateMutation = useMutation<DealerDto, ApiError, { id: Guid; payload: CustomerFormValues }>({
    mutationFn: async ({ id, payload }) => {
      // Dokümantasyona göre updateCustomer API'sini kullan
      // İş Mantığı:
      // 1. Müşteri bulma ve yetki kontrolü
      // 2. Bilgileri güncelleme
      // 3. DealerCode korunur (değiştirilmez)
      const request: UpdateCustomerRequest = {
        ...payload,
        userIds: [],
      };
      return await updateCustomer(id, request);
    },
    onSuccess: async () => {
      await refetch();
      message.success('Müşteri güncellendi.');
    },
  });

  const deleteMutation = useMutation<unknown, ApiError, Guid>({
    mutationFn: async (id) => {
      // Dokümantasyona göre deleteCustomer API'sini kullan
      return await deleteCustomer(id);
    },
    onSuccess: async () => {
      await refetch();
      message.success('Müşteri silindi.');
    },
  });

  const data = listQuery.data ?? [];
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => filterByQuery(data, search), [data, search]);

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditingId(null);
    }
  }, [isModalOpen, form]);

  const openCreate = () => {
    // Bayi kontrolü - admin değilse ve bayi kodu yoksa uyarı göster
    if (!user?.isAdmin && !user?.dealerCode) {
      message.error('Henüz bayiliğiniz tanımlanmadığı için müşteri oluşturamazsınız.');
      return;
    }
    
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = useCallback(async (id: Guid) => {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      const responseData = res.data as unknown;
      
      let entity: DealerDto;
      // API response format kontrolü - backend dokümantasyonuna göre isSuccess kullanılıyor
      if (responseData && typeof responseData === 'object' && 'isSuccess' in responseData) {
        const result = responseData as { isSuccess: boolean; data?: unknown; message?: string };
        if (result.isSuccess) {
          entity = result.data as DealerDto;
        } else {
          throw new Error(result.message ?? 'Müşteri detayı alınamadı');
        }
      } else {
        entity = ((responseData as any)?.data ?? responseData) as DealerDto;
      }
      
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
    } catch {
      // ignore
    }
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CustomerFormValues = {
        taxIdentifierNumber: String(values.taxIdentifierNumber || '').trim(),
        title: String(values.title || '').trim(),
        companyType: Number(values.companyType),
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
      title: 'Kaydı silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      centered: true,
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const columns: ColumnsType<DealerDto> = [
    { title: 'Unvan', dataIndex: 'title' },
    { title: 'Vergi No', dataIndex: 'taxIdentifierNumber' },
    { title: 'Şehir', dataIndex: 'city' },
    { title: 'İlçe', dataIndex: 'district' },
    { title: 'Telefon', dataIndex: 'companyPhoneNumber' },
    { title: 'E-posta', dataIndex: 'companyEmailAddress' },
    { title: 'Müşteri mi?', dataIndex: 'isCustomer', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Evet' : 'Hayır'}</Tag> },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button icon={<EditOutlined />} onClick={() => void openEdit(record.id)} />
          </Tooltip>
          <Tooltip title="Sil">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (listQuery.isLoading) return <LoadingState text="Müşteriler yükleniyor..." />;
  if (listQuery.isError || !data) return <ErrorState onRetry={() => void refetch()} subtitle="Müşteriler alınırken bir hata oluştu." />;

  return (
    <>
      <PageHeader
        title="Müşteri Yönetimi"
        description="Müşteri kayıtlarını yönetin ve düzenleyin."
        actions={
          // Sadece admin veya bayi kodu olan kullanıcılar müşteri oluşturabilir
          (user?.isAdmin || user?.dealerCode) ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
            >
              Yeni Müşteri
            </Button>
          ) : (
            <Button
              type="default"
              disabled
              icon={<PlusOutlined />}
              title="Henüz bayiliğiniz tanımlanmadığı için müşteri oluşturamazsınız."
            >
              Yeni Müşteri
            </Button>
          )
        }
      />

      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<DealerDto>
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>

      <Modal
        title={editingId ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onOk={handleSubmit}
        okText={editingId ? 'Güncelle' : 'Oluştur'}
        cancelText="Vazgeç"
        width={640}
      >
        <Form<CustomerFormValues> form={form} layout="vertical" initialValues={{ companyType: CompanyType.Limited }}>
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
              <Form.Item label="Şirket Türü" name="companyType" rules={[{ required: true, message: 'Şirket türü zorunludur.' }]}>
                <Select options={[{ value: CompanyType.Limited, label: 'Limited' }]} placeholder="Şirket türü" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Şehir" name="city" rules={[{ required: true }, { max: 64 }]}>
                <Input placeholder="Şehir" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="İlçe" name="district" rules={[{ required: true }, { max: 64 }]}>
                <Input placeholder="İlçe" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Telefon" name="companyPhoneNumber" rules={[{ required: true }, { max: 32 }]}>
                <Input placeholder="Telefon" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="E-posta" name="companyEmailAddress" rules={[{ required: true }, { type: 'email', message: 'Geçerli bir e-posta girin.' }, { max: 256 }]}>
                <Input placeholder="örnek@firma.com" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
