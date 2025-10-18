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

    successMessage: 'Bayi OluÅŸturuldu.',

  });

  const updateMutation = useUpdateMutation<DealerFormValues>('dealers', {

    successMessage: 'Bayi GÃ¼ncellendi.',

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

        isCustomer: dealer.isCustomer,

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

      title: 'Bayiyi silmek istediginize emin misiniz?',

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

      if (values.isCustomer && !values.dealerCode) {

        form.setFields([

          {

            name: 'dealerCode',

            errors: ['MÃ¼ÅŸteri olarak isaretlenen bayiler icin bayi kodu zorunludur.'],

          },

        ]);

        return;

      }

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

        <Tag color={value ? 'green' : 'default'}>{value ? 'Evet' : 'HayÄ±r'}</Tag>

      ),

    },

    {

      title: 'Bayi Kodu',

      dataIndex: 'dealerCode',

      render: (value?: string | null) => value ?? '-',

    },

    {

      title: 'KullanÄ±cÄ± Sayisi',

      dataIndex: 'userIds',

      render: (value: Guid[]) => value?.length ?? 0,

    },

    {

      title: 'İşlemler',

      key: 'actions',

      width: 160,

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

    return <LoadingState text="Bayiler YÃ¼kleniyor..." />;

  }



  if (isError || !dealers) {

    return (

      <ErrorState

        subtitle="Bayiler alinirken bir hata olustu."

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

        description="Şirket ve bayi KayÄ±tlarını yönetin, MÃ¼ÅŸteri bayileri işaretleyin."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Bayi

          </Button>

        }

      />



      <SurfaceCard>

        <Table<DealerDto>

          rowKey="id"

          dataSource={dealers}

          columns={columns}

          pagination={{ pageSize: 10 }}

        />

      </SurfaceCard>



      <Modal

        title={editingId ? 'Bayiyi Duzenle' : 'Yeni Bayi'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'GÃ¼ncelle' : 'OluÅŸtur'}

        cancelText="Vazgec"

        width={760}

      >

        <Form<DealerFormValues>

          layout="vertical"

          form={form}

          initialValues={{

            companyType: 1,

            isCustomer: false,

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

                  { max: 32, message: 'En fazla 32 karakter olmalidir.' },

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

                  { max: 128, message: 'En fazla 128 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Şirket unvani" />

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

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

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

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

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

                  { max: 32, message: 'En fazla 32 karakter olmalidir.' },

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

                  { type: 'email', message: 'GeÃ§erli bir e-posta girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="ornek@firma.com" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Row gutter={12}>

                <Col span={12}>

                  <Form.Item

                    label="Müşteri mi?"

                    name="isCustomer"

                    valuePropName="checked"

                  >

                    <Switch checkedChildren="Evet" unCheckedChildren="HayÄ±r" />

                  </Form.Item>

                </Col>

                <Col span={12}>

                  <Form.Item

                    label="Bayi Kodu"

                    name="dealerCode"

                    rules={[

                      ({ getFieldValue }) => ({

                        validator(_, value) {

                          if (getFieldValue('isCustomer') && !value) {

                            return Promise.reject(

                              new Error('MÃ¼ÅŸteri bayileri icin bayi kodu gereklidir.'),

                            );

                          }

                          if (value && value.length > 64) {

                            return Promise.reject(

                              new Error('En fazla 64 karakter olmalidir.'),

                            );

                          }

                          return Promise.resolve();

                        },

                      }),

                    ]}

                  >

                    <Input placeholder="Bayi kodu" />

                  </Form.Item>

                </Col>

              </Row>

            </Col>

            <Col span={24}>

              <Form.Item label="Bağlı Kullanıcılar" name="userIds">

                <Select

                  mode="multiple"

                  placeholder="Kullanıcıları Seçin"

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







