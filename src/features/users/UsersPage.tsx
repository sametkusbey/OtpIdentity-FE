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
import { TableFilterBar } from '@/components/table/TableFilterBar';
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
import { filterByQuery } from '@/utils/filter';

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
    successMessage: 'Kullanıcı oluşturuldu.',
  });
  const updateMutation = useUpdateMutation<UserFormValues>('users', {
    successMessage: 'Kullanıcı güncellendi.',
  });
  const deleteMutation = useDeleteMutation('users', {
    successMessage: 'Kullanıcı silindi.',
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
      title: 'Kullanıcıyı silmek istediğinize emin misiniz?',
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

  const [search, setSearch] = useState('');
  const filteredUsers = useMemo(() => filterByQuery(users, search), [users, search]);

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
      title: 'E-posta Doğrulandı',
      dataIndex: 'isEmailVerified',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>
          {value ? 'Evet' : 'Hayır'}
        </Tag>
      ),
    },
    {
      title: 'Telefon Doğrulandı',
      dataIndex: 'isPhoneNumberVerified',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>
          {value ? 'Evet' : 'Hayır'}
        </Tag>
      ),
    },
    {
      title: 'Bayiler',
      dataIndex: 'dealerIds',
      render: (dealerIds: Guid[]) => (
        <>{dealers?.filter((d) => dealerIds?.includes(d.id)).map((d) => d.title).join(', ')}</>
      ),
    },
    {
      title: 'Uygulamalar',
      dataIndex: 'appIds',
      render: (appIds: Guid[]) => (
        <>{apps?.filter((a) => appIds?.includes(a.id)).map((a) => a.appName).join(', ')}</>
      ),
    },
    {
      title: 'İşlemler',
      dataIndex: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record.id)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              size="small"
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState text="Kullanıcılar Yükleniyor..." />;
  }

  if (isError || !users) {
    return (
      <ErrorState
        subtitle="Kullanıcılar alınırken bir hata oluştu."
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
        description="Kullanıcı kayıtlarını yönetin, yeni kullanıcı ekleyin."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Kullanıcı
          </Button>
        }
      />
      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<UserDto>
          rowKey="id"
          dataSource={filteredUsers}
          columns={columns}
          pagination={{ pageSize: 8 }}
        />
      </SurfaceCard>
      <Modal
        title={editingId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingId ? 'Güncelle' : 'Oluştur'}
        cancelText="Vazgeç"
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isEmailVerified: false, isPhoneNumberVerified: false }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ad"
                name="name"
                rules={[{ required: true, message: 'Ad zorunlu.' }]}
              >
                <Input placeholder="Adınızı girin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Soyad"
                name="lastName"
                rules={[{ required: true, message: 'Soyad zorunlu.' }]}
              >
                <Input placeholder="Soyadınızı girin" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="E-posta"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Geçerli bir e-posta adresi girin.' }]}
              >
                <Input placeholder="E-posta adresinizi girin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Telefon"
                name="phoneNumber"
                rules={[{ required: true, message: 'Telefon numarası zorunlu.' }]}
              >
                <Input placeholder="Telefon numaranızı girin" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Kimlik No"
                name="identityNumber"
                rules={[{ required: true, message: 'Kimlik numarası zorunlu.' }]}
              >
                <Input placeholder="Kimlik numaranızı girin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bayiler"
                name="dealerIds"
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={dealerOptions}
                  placeholder="Bayi seçiniz"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Uygulamalar"
                name="appIds"
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={appOptions}
                  placeholder="Uygulama seçiniz"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="E-posta Doğrulandı"
                name="isEmailVerified"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
              <Form.Item
                label="Telefon Doğrulandı"
                name="isPhoneNumberVerified"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};






