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

import type { ApiError } from '@/lib/apiClient';

import type { DealerDto, Guid, UserDto, CompanyTypeDto, CityDto, DistrictDto } from '@/types/entities';
import { listCities } from '@/features/cities/api';
import { listDistricts } from '@/features/districts/api';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';



// Backend CreateDealerRequest ile uyumlu form değerleri
type DealerFormValues = {
  taxIdentifierNumber: string;
  title: string;
  companyTypeId: Guid;
  cityId: Guid;
  districtId: Guid;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  dealerCode: string;
  userIds: Guid[];
  // isCustomer ve parentDealerId backend'de otomatik set ediliyor
};



export const DealersPage = () => {

  const [form] = Form.useForm<DealerFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: dealers,

    isLoading,

    isError,

    refetch,

  } = useCrudList<DealerDto>('dealers');

  const { data: users } = useCrudList<UserDto>('users');
  const { data: companyTypes } = useCrudList<CompanyTypeDto>('companytypes');
  
  const [cities, setCities] = useState<CityDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<Guid | null>(null);



  const createMutation = useCreateMutation<DealerFormValues>('dealers', {

    successMessage: 'Bayi Oluşturuldu.',

  });

  const updateMutation = useUpdateMutation<DealerFormValues>('dealers', {

    successMessage: 'Bayi Güncellendi.',

  });

  const deleteMutation = useDeleteMutation('dealers', {

    successMessage: 'Bayi silindi.',

  });



  useEffect(() => {
    // Türkiye şehirlerini yükle
    const loadCities = async () => {
      try {
        const turkeyId = 'd4e5f6a7-b8c9-4d3e-a2f1-123456789abc'; // Türkiye ID
        const citiesData = await listCities(turkeyId);
        setCities(citiesData);
      } catch (error) {
        console.error('Şehirler yüklenemedi:', error);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    // Seçili şehre göre ilçeleri yükle
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

  }, [form, isModalOpen]);



  const userOptions = useMemo(

    () =>

      users?.map((user) => ({

        label: `${user.name} ${user.lastName}`,

        value: user.id,

      })) ?? [],

    [users],

  );

  const companyTypeOptions = useMemo(

    () =>

      companyTypes?.map((ct) => ({

        label: ct.name,

        value: ct.id,

      })) ?? [],

    [companyTypes],

  );



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const dealer = await fetchEntityById<DealerDto>('dealers', id);

      setEditingId(id);
      
      // Şehir seçili ise ilçeleri yükle
      if (dealer.cityId) {
        setSelectedCityId(dealer.cityId);
        const districtsData = await listDistricts(dealer.cityId);
        setDistricts(districtsData);
      }

      form.setFieldsValue({

        taxIdentifierNumber: dealer.taxIdentifierNumber,

        title: dealer.title,

        companyTypeId: dealer.companyTypeId,

        cityId: dealer.cityId,

        districtId: dealer.districtId,

        companyPhoneNumber: dealer.companyPhoneNumber,

        companyEmailAddress: dealer.companyEmailAddress,

        dealerCode: dealer.dealerCode ?? '', // Zorunlu alan, boş string olarak set et

        userIds: dealer.userIds,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Bayiyi silmek istediğinize emin misiniz?',

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

      console.log('Form Values (Dealers):', values);

      // Backend zaten isCustomer: false olarak ayarlıyor, göndermeye gerek yok
      const payload = {
        ...values,
      };

      console.log('Payload to be sent (Dealers):', payload);

      if (editingId) {

        await updateMutation.mutateAsync({ id: editingId, payload });

      } else {

        await createMutation.mutateAsync(payload);

      }

      setIsModalOpen(false);

    } catch (error) {

      console.error('Submit error (Dealers):', error);

      const apiError = error as ApiError;

      applyValidationErrors(apiError, form);

    }

  };



  const [search, setSearch] = useState('');
  const filteredDealers = useMemo(() => filterByQuery(dealers, search), [dealers, search]);

  const columns: ColumnsType<DealerDto> = [

    {

      title: 'Unvan',

      dataIndex: 'title',

    },

    {

      title: 'Vergi No',

      dataIndex: 'taxIdentifierNumber',

    },

    {

      title: 'Şehir',

      dataIndex: 'cityName',

    },

    {

      title: 'İlçe',

      dataIndex: 'districtName',

    },

    {

      title: 'Telefon',

      dataIndex: 'companyPhoneNumber',

    },

    {

      title: 'E-posta',

      dataIndex: 'companyEmailAddress',

    },

    {

      title: 'Müşteri mi?',

      dataIndex: 'isCustomer',

      render: (value: boolean) => (

        <Tag color={value ? 'green' : 'default'}>{value ? 'Evet' : 'Hayır'}</Tag>

      ),

    },

    {

      title: 'Bayi Kodu',

      dataIndex: 'dealerCode',

      render: (value?: string | null) => value ?? '-',

    },

    {

      title: 'Kullanıcı Sayısı',

      dataIndex: 'userIds',

      render: (value: Guid[]) => value?.length ?? 0,

    },

    {

      title: 'İşlemler',

      key: 'actions',

      width: 160,

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

    return <LoadingState text="Bayiler yükleniyor..." />;

  }



  if (isError || !dealers) {

    return (

      <ErrorState

        subtitle="Bayiler alınırken bir hata oluştu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Bayi Yönetimi"

        description="Bayi kayıtlarını yönetin. Müşteri oluşturmak için Müşteriler sayfasını kullanın."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Bayi

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<DealerDto>
          rowKey="id"
          dataSource={filteredDealers}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Bayiyi Düzenle' : 'Yeni Bayi'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={760}

      >

        <Form<DealerFormValues>

          layout="vertical"

          form={form}

          initialValues={{

            companyTypeId: undefined,

            userIds: [],

          }}

        >

          <Row gutter={[18, 18]}>

                <Col xs={24} md={12}>

              <Form.Item

                label="Vergi No"

                name="taxIdentifierNumber"

                rules={[

                  { required: true, message: 'Vergi numarasi zorunludur.' },

                  { max: 32, message: 'En fazla 32 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Vergi numarasi" disabled={!!editingId} />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Unvan"

                name="title"

                rules={[

                  { required: true, message: 'Unvan zorunludur.' },

                  { max: 128, message: 'En fazla 128 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Şirket unvanı" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Şirket Tipi"

                name="companyTypeId"

                rules={[{ required: true, message: 'Şirket tipi zorunludur.' }]}

              >

                <Select

                  placeholder="Şirket tipi seçin"

                  options={companyTypeOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Şehir"

                name="cityId"

                rules={[

                  { required: true, message: 'Şehir zorunludur.' },

                ]}

              >

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

              <Form.Item

                label="İlçe"

                name="districtId"

                rules={[

                  { required: true, message: 'İlçe zorunludur.' },

                ]}

              >

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

              <Form.Item

                label="Telefon"

                name="companyPhoneNumber"

                rules={[

                  { required: true, message: 'Telefon zorunludur.' },

                  { max: 32, message: 'En fazla 32 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="+90" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="E-posta"

                name="companyEmailAddress"

                rules={[

                  { required: true, message: 'E-posta zorunludur.' },

                  { type: 'email', message: 'Geçerli bir e-posta girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="ornek@firma.com" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Bayi Kodu"

                name="dealerCode"

                rules={[
                  { required: true, message: 'Bayi kodu zorunludur.' },
                  { max: 64, message: 'En fazla 64 karakter olmalıdır.' },
                ]}

              >

                <Input placeholder="Bayi kodu" disabled={!!editingId} />

              </Form.Item>

            </Col>

            <Col span={24}>

              <Form.Item label="Bağlı Kullanıcılar" name="userIds">

                <Select

                  mode="multiple"

                  placeholder="Kullanıcıları seçin"

                  options={userOptions}

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

          </Row>

        </Form>

      </Modal>

    </>

  );

};







