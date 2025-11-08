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

import type { DealerDto, Guid, UserDto } from '@/types/entities';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';



type DealerFormValues = Omit<DealerDto, 'id'>;



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

    if (!isModalOpen) {

      form.resetFields();

      setEditingId(null);

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



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const dealer = await fetchEntityById<DealerDto>('dealers', id);

      setEditingId(id);

      form.setFieldsValue({

        taxIdentifierNumber: dealer.taxIdentifierNumber,

        title: dealer.title,

        companyType: dealer.companyType,

        city: dealer.city,

        district: dealer.district,

        companyPhoneNumber: dealer.companyPhoneNumber,

        companyEmailAddress: dealer.companyEmailAddress,

        dealerCode: dealer.dealerCode ?? undefined,

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

      // Bayi oluşturma sayfasında isCustomer her zaman false olarak gönderilir
      const payload = {
        ...values,
        isCustomer: false, // Her zaman false
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

      dataIndex: 'city',

    },

    {

      title: 'İlçe',

      dataIndex: 'district',

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

            companyType: 1,

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

                <Input placeholder="Vergi numarasi" />

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

                name="companyType"

                rules={[{ required: true, message: 'Şirket tipi zorunludur.' }]}

              >

                <Select

                  options={[

                    { label: 'Limited Şirket', value: 1 },

                  ]}

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Şehir"

                name="city"

                rules={[

                  { required: true, message: 'Şehir zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Şehir" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="İlçe"

                name="district"

                rules={[

                  { required: true, message: 'İlçe zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="İlçe" />

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

                <Input placeholder="Bayi kodu" />

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







