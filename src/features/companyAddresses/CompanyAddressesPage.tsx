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

} from '@/types/entities';

import type { ApiError } from '@/lib/apiClient';

import { applyValidationErrors } from '@/utils/form';



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



  const {

    data: addresses,

    isLoading,

    isError,

    refetch,

  } = useCrudList<CompanyAddressDto>('companyaddresses');

  const { data: dealers } = useCrudList<DealerDto>('dealers');



  const createMutation = useCreateMutation<CompanyAddressPayload>(

    'companyaddresses',

    {

      successMessage: 'Adres OluÅŸturuldu.',

    },

  );

  const updateMutation = useUpdateMutation<CompanyAddressPayload>(

    'companyaddresses',

    {

      successMessage: 'Adres GÃ¼ncellendi.',

    },

  );

  const deleteMutation = useDeleteMutation('companyaddresses', {

    successMessage: 'Adres silindi.',

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

        label: dealer.title,

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

      form.setFieldsValue({

        dealerId: address.dealerId,

        addressName: address.addressName,

        country: address.country,

        city: address.city,

        district: address.district,

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

      title: 'Adres KaydÄ±ni silmek istediginize emin misiniz?',

      okText: 'Sil',

      okType: 'danger',

      cancelText: 'Vazgec',

      centered: true,

      onOk: () => deleteMutation.mutate(id),

    });

  };



  const handleSubmit = async () => {

    try {

      const values = await form.validateFields();

      const payload: CompanyAddressPayload = {

        ...values,

        eInvoiceTransitionDate: values.eInvoiceTransitionDate

          ? values.eInvoiceTransitionDate.toISOString()

          : null,

        eWaybillTransitionDate: values.eWaybillTransitionDate

          ? values.eWaybillTransitionDate.toISOString()

          : null,

      };

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



  const columns: ColumnsType<CompanyAddressDto> = [

    {

      title: 'Bayi',

      dataIndex: 'dealerId',

      render: (value: Guid) => dealerMap.get(value)?.title ?? '-',

    },

    {

      title: 'Adres Adi',

      dataIndex: 'addressName',

    },

    {

      title: 'Ãœlke',

      dataIndex: 'country',

    },

    {

      title: 'Şehir',

      dataIndex: 'city',

    },

    {

      title: 'İlçe',

      dataIndex: 'district',

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

      title: 'e-Ä°rsaliye',

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

          <Tooltip title="Duzenle">

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

    return <LoadingState text="Adresler YÃ¼kleniyor..." />;

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

        title="Şirket Adresleri"

        description="Bayilerin fatura ve irsaliye adreslerini detayli sekilde kaydedin."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Adres

          </Button>

        }

      />



      <SurfaceCard>

        <Table<CompanyAddressDto>

          rowKey="id"

          dataSource={addresses}

          columns={columns}

          pagination={{ pageSize: 10 }}

        />

      </SurfaceCard>



      <Modal

        title={editingId ? 'Adresi Duzenle' : 'Yeni Adres'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'GÃ¼ncelle' : 'OluÅŸtur'}

        cancelText="Vazgec"

        width={860}

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

                label="Bayi"

                name="dealerId"

                rules={[{ required: true, message: 'Bayi SeÃ§imi zorunludur.' }]}

              >

                <Select

                  placeholder="Bayi SeÃ§in"

                  options={dealerOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Adres Adi"

                name="addressName"

                rules={[

                  { required: true, message: 'Adres adi zorunludur.' },

                  { max: 128, message: 'En fazla 128 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Merkez, Depo vb." />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Ãœlke"

                name="country"

                rules={[

                  { required: true, message: 'Ãœlke zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Turkiye" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Şehir"

                name="city"

                rules={[

                  { required: true, message: 'Şehir zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

                ]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="İlçe"

                name="district"

                rules={[

                  { required: true, message: 'İlçe zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

                ]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Belde/Koy"

                name="town"

                rules={[{ max: 64, message: 'En fazla 64 karakter olmalidir.' }]}

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

                  { max: 128, message: 'En fazla 128 karakter olmalidir.' },

                ]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Posta Kodu"

                name="zipCode"

                rules={[

                  { required: true, message: 'Posta kodu zorunludur.' },

                  { max: 16, message: 'En fazla 16 karakter olmalidir.' },

                ]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Apartman Adi"

                name="apartmentName"

                rules={[{ max: 128, message: 'En fazla 128 karakter olmalidir.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Apartman No"

                name="apartmentNumber"

                rules={[{ max: 16, message: 'En fazla 16 karakter olmalidir.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Kapi No"

                name="doorNumber"

                rules={[{ max: 16, message: 'En fazla 16 karakter olmalidir.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="E-posta"

                name="emailAddress"

                rules={[

                  { type: 'email', message: 'GeÃ§erli bir e-posta adresi girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalidir.' },

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

                  { type: 'url', message: 'GeÃ§erli bir URL girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="https://..." />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-Fatura Mukellefi"

                name="isEInvoiceTaxpayer"

                valuePropName="checked"

              >

                <Switch checkedChildren="Evet" unCheckedChildren="HayÄ±r" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item label="e-Fatura GeÃ§iÅŸ Tarihi" name="eInvoiceTransitionDate">

                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} allowClear />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-Fatura Alias"

                name="eInvoiceAlias"

                rules={[{ max: 128, message: 'En fazla 128 karakter olmalidir.' }]}

              >

                <Input />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-Ä°rsaliye Mukellefi"

                name="isEWaybillTaxpayer"

                valuePropName="checked"

              >

                <Switch checkedChildren="Evet" unCheckedChildren="HayÄ±r" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item label="e-Ä°rsaliye GeÃ§iÅŸ Tarihi" name="eWaybillTransitionDate">

                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} allowClear />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="e-Ä°rsaliye Alias"

                name="eWaybillAlias"

                rules={[{ max: 128, message: 'En fazla 128 karakter olmalidir.' }]}

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




