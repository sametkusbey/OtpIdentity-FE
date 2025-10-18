import {

  DeleteOutlined,

  EditOutlined,

  PlusOutlined,

} from '@ant-design/icons';

import {

  App,

  Button,

  Form,

  Input,

  Modal,

  Col,

  Row,

  Select,

  Switch,

  Table,

  Tag,

  Tooltip,

  Space,

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

import type { AppDto, DealerDto, Guid, UserDto } from '@/types/entities';

import { applyValidationErrors } from '@/utils/form';



type UserFormValues = Omit<UserDto, 'id'>;



export const UsersPage = () => {

  const [form] = Form.useForm<UserFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: users,

    isLoading,

    isError,

    refetch,

  } = useCrudList<UserDto>('users');

  const { data: dealers } = useCrudList<DealerDto>('dealers');

  const { data: apps } = useCrudList<AppDto>('apps');



  const createMutation = useCreateMutation<UserFormValues>('users', {

    successMessage: 'KullanÄ±cÄ± OluÅŸturuldu.',

  });

  const updateMutation = useUpdateMutation<UserFormValues>('users', {

    successMessage: 'KullanÄ±cÄ± GÃ¼ncellendi.',

  });

  const deleteMutation = useDeleteMutation('users', {

    successMessage: 'KullanÄ±cÄ± silindi.',

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



  const appOptions = useMemo(

    () =>

      apps?.map((app) => ({

        label: app.appName,

        value: app.id,

      })) ?? [],

    [apps],

  );



  const openCreateModal = () => {

    setEditingId(null);

    setIsModalOpen(true);

  };



  const openEditModal = async (id: Guid) => {

    try {

      const user = await fetchEntityById<UserDto>('users', id);

      setEditingId(id);

      form.setFieldsValue({

        name: user.name,

        lastName: user.lastName,

        email: user.email,

        phoneNumber: user.phoneNumber,

        isEmailVerified: user.isEmailVerified,

        isPhoneNumberVerified: user.isPhoneNumberVerified,

        identityNumber: user.identityNumber,

        dealerIds: user.dealerIds,

        appIds: user.appIds,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Bu KullanÄ±cÄ±yi silmek istediginize emin misiniz?',

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



  const columns: ColumnsType<UserDto> = [

    {

      title: 'Ad',

      dataIndex: 'name',

    },

    {

      title: 'Soyad',

      dataIndex: 'lastName',

    },

    {

      title: 'E-posta',

      dataIndex: 'email',

    },

    {

      title: 'Telefon',

      dataIndex: 'phoneNumber',

    },

    {

      title: 'Kimlik No',

      dataIndex: 'identityNumber',

    },

    {

      title: 'E-posta Doğrulama',

      dataIndex: 'isEmailVerified',

      render: (value: boolean) => (

        <Tag color={value ? 'green' : 'red'}>{value ? 'Doğrulandı' : 'Bekliyor'}</Tag>

      ),

    },

    {

      title: 'Telefon Doğrulama',

      dataIndex: 'isPhoneNumberVerified',

      render: (value: boolean) => (

        <Tag color={value ? 'green' : 'red'}>{value ? 'Doğrulandı' : 'Bekliyor'}</Tag>

      ),

    },

    {

      title: 'Bayi Sayisi',

      dataIndex: 'dealerIds',

      render: (value: Guid[]) => value?.length ?? 0,

    },

    {

      title: 'Uygulama Sayisi',

      dataIndex: 'appIds',

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

    return <LoadingState text="KUllanıcılar Yükleniyor..." />;

  }



  if (isError || !users) {

    return (

      <ErrorState

        subtitle="Kullanıcılar alinirken bir hata olustu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader
        title="Kullanıcı Yönetimi"
        description="OtpIdentity kullanıcılarını görüntüleyin, oluşturun ve yönetin."
       
        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni KullanÄ±cÄ±

          </Button>

        }

      />

      <SurfaceCard>

        <Table<UserDto>

          rowKey="id"

          dataSource={users}

          columns={columns}

          pagination={{ pageSize: 10 }}

        />

      </SurfaceCard>



      <Modal

        title={editingId ? 'KullanÄ±cÄ±yi Duzenle' : 'Yeni KullanÄ±cÄ±'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => {

          void handleSubmit();

        }}

        okText={editingId ? 'GÃ¼ncelle' : 'OluÅŸtur'}

        cancelText="Vazgec"

        width={760}

      >

        <Form<UserFormValues>

          form={form}

          layout="vertical"

          initialValues={{

            isEmailVerified: false,

            isPhoneNumberVerified: false,

            dealerIds: [],

            appIds: [],

          }}

        >

          <Row gutter={[18, 18]}>

            <Col xs={24} md={12}>

              <Form.Item

                label="Ad"

                name="name"

                rules={[

                  { required: true, message: 'Ad zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Ad" />

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

                <Input placeholder="Soyad" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="E-posta"

                name="email"

                rules={[

                  { required: true, message: 'E-posta zorunludur.' },

                  { type: 'email', message: 'GeÃ§erli bir e-posta girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="ornek@otpbilisim.com" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Telefon"

                name="phoneNumber"

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

                label="Kimlik Numarasi"

                name="identityNumber"

                rules={[

                  { required: true, message: 'Kimlik numarasi zorunludur.' },

                  { max: 32, message: 'En fazla 32 karakter olmalidir.' },

                ]}

              >

                <Input placeholder="Kimlik numarasi" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Row gutter={12}>

                <Col span={12}>

                  <Form.Item

                    label="E-posta Doğrulandı mi?"

                    name="isEmailVerified"

                    valuePropName="checked"

                  >

                    <Switch checkedChildren="Evet" unCheckedChildren="HayÄ±r" />

                  </Form.Item>

                </Col>

                <Col span={12}>

                  <Form.Item

                    label="Telefon Doğrulandı mi?"

                    name="isPhoneNumberVerified"

                    valuePropName="checked"

                  >

                    <Switch checkedChildren="Evet" unCheckedChildren="HayÄ±r" />

                  </Form.Item>

                </Col>

              </Row>

            </Col>

            <Col span={24}>

              <Form.Item label="BaÄŸlÄ± bayiler" name="dealerIds">

                <Select

                  mode="multiple"

                  placeholder="Bayileri SeÃ§in"

                  options={dealerOptions}

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col span={24}>

              <Form.Item label="BaÄŸlÄ± uygulamalar" name="appIds">

                <Select

                  mode="multiple"

                  placeholder="uygulamaları SeÃ§in"

                  options={appOptions}

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






