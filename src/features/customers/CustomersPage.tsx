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
import type { DealerDto, Guid, CompanyTypeDto, CityDto, DistrictDto } from '@/types/entities';
import { listCities } from '@/features/cities/api';
import { listDistricts } from '@/features/districts/api';
import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';
import { useAuth } from '@/features/auth/AuthContext';
import { useCrudList } from '@/hooks/useCrud';
import { listCustomers, createCustomer, updateCustomer, deleteCustomer, type CreateCustomerRequest, type UpdateCustomerRequest } from './api';

type CustomerFormValues = {
  taxIdentifierNumber: string;
  title: string;
  companyTypeId: Guid;
  cityId: Guid;
  districtId: Guid;
  companyPhoneNumber: string;
  companyEmailAddress: string;
};

export const CustomersPage = () => {
  const [form] = Form.useForm<CustomerFormValues>();
  const { modal, message } = App.useApp();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Guid | null>(null);
  const { data: companyTypes } = useCrudList<CompanyTypeDto>('companytypes');
  
  // Bayileri çek (parent dealer bilgisi için)
  const { data: allDealers } = useCrudList<DealerDto>('Dealers');
  
  const [cities, setCities] = useState<CityDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<Guid | null>(null);
  
  useEffect(() => {
    const loadCities = async () => {
      try {
        const turkeyId = 'd4e5f6a7-b8c9-4d3e-a2f1-123456789abc';
        const citiesData = await listCities(turkeyId);
        setCities(citiesData);
      } catch (error) {
        console.error('Şehirler yüklenemedi:', error);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedCityId) {
        try {
          const districtsData = await listDistricts(selectedCityId);
          setDistricts(districtsData);
        } catch (error) {
          console.error('İlçeler yüklenemedi:', error);
        }
      } else {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [selectedCityId]);

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditingId(null);
      setSelectedCityId(null);
      setDistricts([]);
    }
  }, [isModalOpen, form]);
  
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
    onError: (error) => {
      message.error(error.message || 'Müşteri oluşturulurken bir hata oluştu.');
    },
  });

  const updateMutation = useMutation<DealerDto, ApiError, { id: Guid; payload: Partial<CustomerFormValues> }>({
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
    onError: (error) => {
      message.error(error.message || 'Müşteri güncellenirken bir hata oluştu.');
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
    onError: (error) => {
      message.error(error.message || 'Müşteri silinirken bir hata oluştu.');
    },
  });

  const data = listQuery.data ?? [];
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => filterByQuery(data, search), [data, search]);

  const companyTypeOptions = useMemo(
    () =>
      companyTypes?.map((ct) => ({
        label: ct.name,
        value: ct.id,
      })) ?? [],
    [companyTypes],
  );

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
      
      // Şehir seçili ise ilçeleri yükle
      if (entity.cityId) {
        setSelectedCityId(entity.cityId);
        const districtsData = await listDistricts(entity.cityId);
        setDistricts(districtsData);
      }
      
      setIsModalOpen(true);
      form.setFieldsValue({
        taxIdentifierNumber: entity.taxIdentifierNumber,
        title: entity.title,
        companyTypeId: entity.companyTypeId,
        cityId: entity.cityId,
        districtId: entity.districtId,
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
      
      console.log('Form Values (Customers):', values);
      
      if (!editingId) {
        // Yeni kayıt - tüm alanlar dahil
        const payload: CustomerFormValues = {
          taxIdentifierNumber: String(values.taxIdentifierNumber || '').trim(),
          title: String(values.title || '').trim(),
          companyTypeId: values.companyTypeId,
          cityId: values.cityId,
          districtId: values.districtId,
          companyPhoneNumber: String(values.companyPhoneNumber || '').trim(),
          companyEmailAddress: String(values.companyEmailAddress || '').trim(),
        };
        console.log('Payload to be sent (Create Customer):', payload);
        await createMutation.mutateAsync(payload);
      } else {
        // Güncelleme - taxIdentifierNumber hariç
        const payload: Partial<CustomerFormValues> = {
          title: String(values.title || '').trim(),
          companyTypeId: values.companyTypeId,
          cityId: values.cityId,
          districtId: values.districtId,
          companyPhoneNumber: String(values.companyPhoneNumber || '').trim(),
          companyEmailAddress: String(values.companyEmailAddress || '').trim(),
        };
        console.log('Payload to be sent (Update Customer):', payload);
        await updateMutation.mutateAsync({ id: editingId, payload });
      }
      
      setIsModalOpen(false);
      setEditingId(null);
    } catch (e) {
      console.error('Submit error (Customers):', e);
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

  // Parent dealer map oluştur
  const dealerMap = useMemo(() => {
    const map = new Map<Guid, DealerDto>();
    allDealers?.forEach((dealer) => map.set(dealer.id, dealer));
    return map;
  }, [allDealers]);

  const columns: ColumnsType<DealerDto> = useMemo(() => {
    const baseColumns: ColumnsType<DealerDto> = [
      { title: 'Unvan', dataIndex: 'title' },
      { title: 'Vergi No', dataIndex: 'taxIdentifierNumber' },
      { title: 'Şehir', dataIndex: 'cityName' },
      { title: 'İlçe', dataIndex: 'districtName' },
      { title: 'Telefon', dataIndex: 'companyPhoneNumber' },
      { title: 'E-posta', dataIndex: 'companyEmailAddress' },
    ];

    // Sadece admin kullanıcılar için "Bağlı Olduğu Bayi" kolonunu ekle
    if (user?.isAdmin) {
      baseColumns.push({
        title: 'Bağlı Olduğu Bayi', 
        dataIndex: 'parentDealerId',
        render: (parentDealerId: Guid | null | undefined) => {
          if (!parentDealerId) return '-';
          const parentDealer = dealerMap.get(parentDealerId);
          return parentDealer ? parentDealer.title : '-';
        }
      });
    }

    baseColumns.push(
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
      }
    );

    return baseColumns;
  }, [user?.isAdmin, dealerMap]);

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
        <Form<CustomerFormValues> form={form} layout="vertical" initialValues={{ companyTypeId: undefined }}>
          <Row gutter={[18, 18]}>
            <Col xs={24} md={12}>
              <Form.Item label="Vergi No" name="taxIdentifierNumber" rules={[{ required: true, message: 'Vergi no zorunludur.' }, { max: 32 }]}>
                <Input placeholder="Vergi no" disabled={!!editingId} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Unvan" name="title" rules={[{ required: true, message: 'Unvan zorunludur.' }, { max: 128 }]}>
                <Input placeholder="Unvan" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Şirket Türü" name="companyTypeId" rules={[{ required: true, message: 'Şirket türü zorunludur.' }]}>
                <Select options={companyTypeOptions} placeholder="Şirket türü seçin" showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Şehir" name="cityId" rules={[{ required: true, message: 'Şehir zorunludur.' }]}>
                <Select
                  placeholder="Şehir seçiniz"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSelectedCityId(value);
                    form.setFieldValue('districtId', undefined);
                  }}
                  options={cities.map((city) => ({
                    label: city.name,
                    value: city.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="İlçe" name="districtId" rules={[{ required: true, message: 'İlçe zorunludur.' }]}>
                <Select
                  placeholder="Önce şehir seçiniz"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={!selectedCityId}
                  options={districts.map((district) => ({
                    label: district.name,
                    value: district.id,
                  }))}
                />
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
