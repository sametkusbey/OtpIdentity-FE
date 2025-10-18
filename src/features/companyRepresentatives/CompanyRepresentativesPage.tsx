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

  Tooltip,

} from 'antd';

import type { ColumnsType } from 'antd/es/table';

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

  CompanyRepresentativeDto,

  DealerDto,

  Guid,

} from '@/types/entities';

import type { ApiError } from '@/lib/apiClient';

import { applyValidationErrors } from '@/utils/form';



type RepresentativeFormValues = Omit<CompanyRepresentativeDto, 'id'>;



export const CompanyRepresentativesPage = () => {

  const [form] = Form.useForm<RepresentativeFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: representatives,

    isLoading,

    isError,

    refetch,

  } = useCrudList<CompanyRepresentativeDto>('companyrepresentatives');

  const { data: dealers } = useCrudList<DealerDto>('dealers');



  const createMutation = useCreateMutation<RepresentativeFormValues>(

    'companyrepresentatives',

    {

      successMessage: 'Temsilci Oluşturuldu.',

    },

  );

  const updateMutation = useUpdateMutation<RepresentativeFormValues>(

    'companyrepresentatives',

    {

      successMessage: 'Temsilci Güncellendi.',

    },

  );

  const deleteMutation = useDeleteMutation('companyrepresentatives', {

    successMessage: 'Temsilci silindi.',

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

      const representative = await fetchEntityById<CompanyRepresentativeDto>(

        'companyrepresentatives',

        id,

      );

      setEditingId(id);

      form.setFieldsValue({

        dealerId: representative.dealerId,

        name: representative.name,

        lastName: representative.lastName,

        phoneNumber: representative.phoneNumber ?? undefined,

        emailAddress: representative.emailAddress ?? undefined,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Temsilci Kaydını silmek istediğinize emin misiniz?',

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

        await updateMutation.mutateAsync({ id: editingId, payload: values });

      } else {

        await createMutation.mutateAsync(values);

      }

      setIsModalOpen(false);

    } catch (error) {

      const apiError = error as ApiError;

      applyValidationErrors(apiError, form);

    }

  };



  const columns: ColumnsType<CompanyRepresentativeDto> = [

    {

      title: 'Bayi',

      dataIndex: 'dealerId',

      render: (value: Guid) => dealerMap.get(value)?.title ?? '-',

    },

    {

      title: 'Ad',

      dataIndex: 'name',

    },

    {

      title: 'Soyad',

      dataIndex: 'lastName',

    },

    {

      title: 'Telefon',

      dataIndex: 'phoneNumber',

      render: (value?: string | null) => value ?? '-',

    },

    {

      title: 'E-posta',

      dataIndex: 'emailAddress',

      render: (value?: string | null) => value ?? '-',

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

    return <LoadingState text="Temsilciler Yükleniyor..." />;

  }



  if (isError || !representatives) {

    return (

      <ErrorState

        subtitle="Temsilciler alınırken bir hata oluştu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Şirket Temsilcileri Yönetimi"

        description="Bayi sorumlularını kaydedin ve iletişim bilgilerine hızla ulaşın."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Temsilci

          </Button>

        }

      />



      <SurfaceCard>

        <Table<CompanyRepresentativeDto>

          rowKey="id"

          dataSource={representatives}

          columns={columns}

          pagination={{ pageSize: 10 }}

        />

      </SurfaceCard>



      <Modal

        title={editingId ? 'Temsilciyi Düzenle' : 'Yeni Temsilci'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={600}

      >

        <Form<RepresentativeFormValues> form={form} layout="vertical">

          <Row gutter={[18, 18]}>

            <Col xs={24} md={12}>

              <Form.Item

                label="Bayi"

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

                label="Ad"

                name="name"

                rules={[

                  { required: true, message: 'Ad zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Ad girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Soyad"

                name="lastName"

                rules={[

                  { required: true, message: 'Soyad zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Soyad girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Telefon"

                name="phoneNumber"

                rules={[{ max: 32, message: 'En fazla 32 karakter olmalidir.' }]}

              >

                <Input placeholder="Telefon girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="E-posta"

                name="emailAddress"

                rules={[

                  { type: 'email', message: 'Geçerli bir e-posta girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="E-posta girin" />

              </Form.Item>

            </Col>

          </Row>

        </Form>

      </Modal>

    </>

  );

};





