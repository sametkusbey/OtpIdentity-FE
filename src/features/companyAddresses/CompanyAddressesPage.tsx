import {

  DeleteOutlined,

  EditOutlined,

  PlusOutlined,

} from '@ant-design/icons';

import {

  App,

  Button,

  Col,

  DatePicker,

  Form,

  Input,

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

import dayjs, { type Dayjs } from 'dayjs';

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

  CompanyAddressDto,

  DealerDto,

  Guid,

  CountryDto,

  CityDto,

  DistrictDto,

} from '@/types/entities';

import { listCountries } from '@/features/countries/api';
import { listCities } from '@/features/cities/api';
import { listDistricts } from '@/features/districts/api';

import type { ApiError } from '@/lib/apiClient';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';
import { listDealersForCompanyAddresses } from '@/features/dealers/api';
import { useQuery } from '@tanstack/react-query';



type CompanyAddressFormValues = Omit<

  CompanyAddressDto,

  'id' | 'eInvoiceTransitionDate' | 'eWaybillTransitionDate'

> & {

  eInvoiceTransitionDate?: Dayjs | null;

  eWaybillTransitionDate?: Dayjs | null;

};



type CompanyAddressPayload = Omit<CompanyAddressDto, 'id'>;



export const CompanyAddressesPage = () => {

  const [form] = Form.useForm<CompanyAddressFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);
  
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<Guid | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<Guid | null>(null);
  
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await listCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Ülkeler yüklenemedi:', error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (selectedCountryId) {
        try {
          const citiesData = await listCities(selectedCountryId);
          setCities(citiesData);
        } catch (error) {
          console.error('Şehirler yüklenemedi:', error);
        }
      } else {
        setCities([]);
      }
    };
    loadCities();
  }, [selectedCountryId]);

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
      setSelectedCountryId(null);
      setSelectedCityId(null);
      setCities([]);
      setDistricts([]);
    }
  }, [isModalOpen, form]);



  const {

    data: addresses,

    isLoading,

    isError,

    refetch,

  } = useCrudList<CompanyAddressDto>('companyaddresses');

  // Şirket adresleri için özel endpoint kullan - sadece yetkili müşterileri getirir
  const { data: dealers, refetch: refetchDealers } = useQuery<DealerDto[], ApiError>({
    queryKey: ['dealers', 'for-company-addresses'],
    queryFn: listDealersForCompanyAddresses,
    staleTime: 0, // Her zaman fresh data çek
    refetchOnMount: true, // Sayfa mount olduğunda refetch et
    refetchOnWindowFocus: false, // Window focus'ta refetch etme (isteğe bağlı)
  });



  const createMutation = useCreateMutation<CompanyAddressPayload>(

    'companyaddresses',

    {

      successMessage: 'Adres Oluşturuldu.',

    },

  );

  const updateMutation = useUpdateMutation<CompanyAddressPayload>(

    'companyaddresses',

    {

      successMessage: 'Adres Güncellendi.',

    },

  );

  const deleteMutation = useDeleteMutation('companyaddresses', {

    successMessage: 'Adres silindi.',

  });



  useEffect(() => {

    if (!isModalOpen) {

      form.resetFields();

      setEditingId(null);

    } else {
      // Modal açıldığında dealers'ı refetch et
      void refetchDealers();
    }

  }, [form, isModalOpen, refetchDealers]);



  const dealerOptions = useMemo(

    () =>

      dealers?.map((dealer) => ({

        label: `${dealer.title} ${dealer.isCustomer ? '(Müşteri)' : '(Bayi)'}`,

        value: dealer.id,

      })) ?? [],

    [dealers],

  );



  const dealerMap = useMemo(() => {

    const map = new Map<Guid, DealerDto>();

    dealers?.forEach((dealer) => map.set(dealer.id, dealer));

    return map;

  }, [dealers]);



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const address = await fetchEntityById<CompanyAddressDto>(

        'companyaddresses',

        id,

      );

      setEditingId(id);
      
      // Ülke ve şehir seçili ise ilişkili verileri yükle
      if (address.countryId) {
        setSelectedCountryId(address.countryId);
        const citiesData = await listCities(address.countryId);
        setCities(citiesData);
        
        if (address.cityId) {
          setSelectedCityId(address.cityId);
          const districtsData = await listDistricts(address.cityId);
          setDistricts(districtsData);
        }
      }

      form.setFieldsValue({

        dealerId: address.dealerId,

        addressName: address.addressName,

        countryId: address.countryId,

        cityId: address.cityId,

        districtId: address.districtId,

        town: address.town ?? undefined,

        street: address.street,

        zipCode: address.zipCode,

        apartmentName: address.apartmentName ?? undefined,

        apartmentNumber: address.apartmentNumber ?? undefined,

        doorNumber: address.doorNumber ?? undefined,

        emailAddress: address.emailAddress ?? undefined,

        website: address.website ?? undefined,

        isEInvoiceTaxpayer: address.isEInvoiceTaxpayer,

        eInvoiceTransitionDate: address.eInvoiceTransitionDate

          ? dayjs(address.eInvoiceTransitionDate)

          : null,

        eInvoiceAlias: address.eInvoiceAlias ?? undefined,

        isEWaybillTaxpayer: address.isEWaybillTaxpayer,

        eWaybillTransitionDate: address.eWaybillTransitionDate

          ? dayjs(address.eWaybillTransitionDate)

          : null,

        eWaybillAlias: address.eWaybillAlias ?? undefined,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Adres Kaydını silmek istediğinize emin misiniz?',

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

      console.log('Form Values:', values);

      const payload: CompanyAddressPayload = {

        ...values,

        eInvoiceTransitionDate: values.eInvoiceTransitionDate

          ? values.eInvoiceTransitionDate.toISOString()

          : null,

        eWaybillTransitionDate: values.eWaybillTransitionDate

          ? values.eWaybillTransitionDate.toISOString()

          : null,

      };

      console.log('Payload to be sent:', payload);

      if (editingId) {

        await updateMutation.mutateAsync({ id: editingId, payload });

      } else {

        await createMutation.mutateAsync(payload);

      }

      setIsModalOpen(false);

    } catch (error) {

      console.error('Submit error:', error);

      const apiError = error as ApiError;

      applyValidationErrors(apiError, form);

    }

  };



  const [search, setSearch] = useState('');
  const filteredAddresses = useMemo(
    () => filterByQuery(addresses, search),
    [addresses, search],
  );

  const columns: ColumnsType<CompanyAddressDto> = [

    {

      title: 'Bayi/Müşteri',

      dataIndex: 'dealerId',

      render: (value: Guid) => {
        const dealer = dealerMap.get(value);
        if (!dealer) return '-';
        return (
          <span>
            {dealer.title}{' '}
            <Tag color={dealer.isCustomer ? 'blue' : 'green'}>
              {dealer.isCustomer ? 'Müşteri' : 'Bayi'}
            </Tag>
          </span>
        );
      },

    },

    {

      title: 'Adres Adı',

      dataIndex: 'addressName',

    },

    {

      title: 'Ülke',

      dataIndex: 'countryName',

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

      title: 'Cadde/Sokak',

      dataIndex: 'street',

    },

    {

      title: 'Posta Kodu',

      dataIndex: 'zipCode',

    },

    {

      title: 'e-Fatura',

      dataIndex: 'isEInvoiceTaxpayer',

      render: (value: boolean) => (

        <Tag color={value ? 'green' : 'default'}>{value ? 'Aktif' : 'Pasif'}</Tag>

      ),

    },

    {

      title: 'e-İrsaliye',

      dataIndex: 'isEWaybillTaxpayer',

      render: (value: boolean) => (

        <Tag color={value ? 'green' : 'default'}>{value ? 'Aktif' : 'Pasif'}</Tag>

      ),

    },

    {

      title: 'İşlemler',

      key: 'actions',

      width: 180,

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

    return <LoadingState text="Adresler Yükleniyor..." />;

  }



  if (isError || !addresses) {

    return (

      <ErrorState

        subtitle="Adresler alinirken bir hata olustu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Şirket Adresleri Yönetimi"

        description="Şirket adreslerini yönetin, yeni adres ekleyin."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Adres

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<CompanyAddressDto>
          rowKey="id"
          dataSource={filteredAddresses}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Adresi Düzenle' : 'Yeni Adres'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={600}

      >

        <Form<CompanyAddressFormValues>

          form={form}

          layout="vertical"

          initialValues={{

            isEInvoiceTaxpayer: false,

            isEWaybillTaxpayer: false,

          }}

        >

          <Row gutter={[18, 18]}>

            <Col xs={24} md={12}>

              <Form.Item

                label="Bayi/Müşteri"

                name="dealerId"

                rules={[{ required: true, message: 'Bayi Seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Bayi Seçin"

                  options={dealerOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Adres Adı"

                name="addressName"

                rules={[

                  { required: true, message: 'Adres adı zorunludur.' },

                  { max: 128, message: 'En fazla 128 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Adres adı girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Ülke"

                name="countryId"

                rules={[

                  { required: true, message: 'Ülke zorunludur.' },

                ]}

              >

                <Select
                  placeholder="Ülke seçiniz"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSelectedCountryId(value);
                    form.setFieldValue('cityId', undefined);
                    form.setFieldValue('districtId', undefined);
                    setSelectedCityId(null);
                  }}
                  options={countries.map((country) => ({
                    label: country.name,
                    value: country.id,
                  }))}
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
                  placeholder="Önce ülke seçiniz"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={!selectedCountryId}
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

                label="Belde/Koy"

                name="town"

                rules={[{ max: 64, message: 'En fazla 64 karakter olmalıdır.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Cadde/Sokak"

                name="street"

                rules={[

                  { required: true, message: 'Cadde veya sokak zorunludur.' },

                  { max: 128, message: 'En fazla 128 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Cadde/Sokak girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Posta Kodu"

                name="zipCode"

                rules={[

                  { required: true, message: 'Posta kodu zorunludur.' },

                  { max: 16, message: 'En fazla 16 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Posta kodu girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Apartman Adı"

                name="apartmentName"

                rules={[{ max: 128, message: 'En fazla 128 karakter olmalıdır.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Apartman No"

                name="apartmentNumber"

                rules={[{ max: 16, message: 'En fazla 16 karakter olmalıdır.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Kapı No"

                name="doorNumber"

                rules={[{ max: 16, message: 'En fazla 16 karakter olmalıdır.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="E-posta"

                name="emailAddress"

                rules={[

                  { type: 'email', message: 'Geçerli bir e-posta adresi girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalıdır.' },

                ]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Web Sitesi"

                name="website"

                rules={[

                  { type: 'url', message: 'Geçerli bir URL girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Web sitesi girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-Fatura Mukellefi"

                name="isEInvoiceTaxpayer"

                valuePropName="checked"

              >

                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item label="e-Fatura Geçiş Tarihi" name="eInvoiceTransitionDate">

                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} allowClear />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-Fatura Alias"

                name="eInvoiceAlias"

                rules={[{ max: 128, message: 'En fazla 128 karakter olmalıdır.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-İrsaliye Mukellefi"

                name="isEWaybillTaxpayer"

                valuePropName="checked"

              >

                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item label="e-İrsaliye Geçiş Tarihi" name="eWaybillTransitionDate">

                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} allowClear />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-İrsaliye Alias"

                name="eWaybillAlias"

                rules={[{ max: 128, message: 'En fazla 128 karakter olmalıdır.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

          </Row>

        </Form>

      </Modal>

    </>

  );

};




