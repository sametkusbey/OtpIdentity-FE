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

  AppDto,

  AuthorizationDto,

  DealerDto,

  Guid,

  UserDto,

} from '@/types/entities';

import type { ApiError } from '@/lib/apiClient';

import { applyValidationErrors } from '@/utils/form';



type AuthorizationFormValues = Omit<AuthorizationDto, 'id'>;



export const AuthorizationsPage = () => {

  const [form] = Form.useForm<AuthorizationFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: authorizations,

    isLoading,

    isError,

    refetch,

  } = useCrudList<AuthorizationDto>('authorizations');

  const { data: users } = useCrudList<UserDto>('users');

  const { data: apps } = useCrudList<AppDto>('apps');

  const { data: dealers } = useCrudList<DealerDto>('dealers');



  const createMutation = useCreateMutation<AuthorizationFormValues>(

    'authorizations',

    {

      successMessage: 'Yetki Oluşturuldu.',

    },

  );

  const updateMutation = useUpdateMutation<AuthorizationFormValues>(

    'authorizations',

    {

      successMessage: 'Yetki Güncellendi.',

    },

  );

  const deleteMutation = useDeleteMutation('authorizations', {

    successMessage: 'Yetki silindi.',

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



  const appOptions = useMemo(

    () =>

      apps?.map((app) => ({

        label: app.appName,

        value: app.id,

      })) ?? [],

    [apps],

  );



  const dealerOptions = useMemo(

    () =>

      dealers?.map((dealer) => ({

        label: dealer.title,

        value: dealer.id,

      })) ?? [],

    [dealers],

  );



  const userMap = useMemo(() => {

    const map = new Map<Guid, UserDto>();

    users?.forEach((user) => map.set(user.id, user));

    return map;

  }, [users]);



  const appMap = useMemo(() => {

    const map = new Map<Guid, AppDto>();

    apps?.forEach((app) => map.set(app.id, app));

    return map;

  }, [apps]);



  const dealerMap = useMemo(() => {

    const map = new Map<Guid, DealerDto>();

    dealers?.forEach((dealer) => map.set(dealer.id, dealer));

    return map;

  }, [dealers]);



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const authorization = await fetchEntityById<AuthorizationDto>(

        'authorizations',

        id,

      );

      setEditingId(id);

      form.setFieldsValue({

        userId: authorization.userId,

        appId: authorization.appId,

        dealerId: authorization.dealerId,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Yetki Kaydını silmek istediginize emin misiniz?',

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

      const duplicate = authorizations?.some(

        (auth) =>

          auth.userId === values.userId &&

          auth.appId === values.appId &&

          auth.dealerId === values.dealerId &&

          auth.id !== editingId,

      );

      if (duplicate) {

        form.setFields([

          {

            name: 'userId',

            errors: ['Bu Kullanıcı icin ayni yetki zaten mevcut.'],

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



  const columns: ColumnsType<AuthorizationDto> = [

    {

      title: 'Kullanıcı',

      dataIndex: 'userId',

      render: (value: Guid) => {

        const user = userMap.get(value);

        return user ? `${user.name} ${user.lastName}` : '-';

      },

    },

    {

      title: 'Uygulama',

      dataIndex: 'appId',

      render: (value: Guid) => appMap.get(value)?.appName ?? '-',

    },

    {

      title: 'Bayi',

      dataIndex: 'dealerId',

      render: (value: Guid) => dealerMap.get(value)?.title ?? '-',

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

    return <LoadingState text="Yetkiler Yükleniyor..." />;

  }



  if (isError || !authorizations) {

    return (

      <ErrorState

        subtitle="Yetkiler alinirken bir hata olustu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>
      <PageHeader

        title="Yetkilendirme Yönetimi"

        description="Kullanıcı, uygulama ve bayi kombinasyonlarını kontrol altında tutun."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Yetki

          </Button>

        }

      />



      <SurfaceCard>

        <Table<AuthorizationDto>

          rowKey="id"

          dataSource={authorizations}

          columns={columns}

          pagination={{ pageSize: 10 }}

        />

      </SurfaceCard>



      <Modal

        title={editingId ? 'Yetkiyi Düzenle' : 'Yeni Yetki'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={600}

      >

        <Form<AuthorizationFormValues> form={form} layout="vertical">

          <Row gutter={[18, 18]}>

            <Col xs={24} md={12}>

              <Form.Item

                label="Kullanıcı"

                name="userId"

                rules={[{ required: true, message: 'Kullanıcı seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Kullanıcı seçin"

                  options={userOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Uygulama"

                name="appId"

                rules={[{ required: true, message: 'Uygulama seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Uygulama seçin"

                  options={appOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24}>

              <Form.Item

                label="Bayi"

                name="dealerId"

                rules={[{ required: true, message: 'Bayi seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Bayi seçin"

                  options={dealerOptions}

                  showSearch

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




