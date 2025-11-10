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
import { TableFilterBar } from '@/components/table/TableFilterBar';

import {

  fetchEntityById,

  useCreateMutation,

  useCrudList,

  useDeleteMutation,

  useUpdateMutation,

} from '@/hooks/useCrud';

import type { ApiError } from '@/lib/apiClient';

import type { AppDto, Guid } from '@/types/entities';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';



type AppFormValues = Omit<AppDto, 'id'>;



export const AppsPage = () => {

  const [form] = Form.useForm<AppFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: apps,

    isLoading,

    isError,

    refetch,

  } = useCrudList<AppDto>('apps');



  const createMutation = useCreateMutation<AppFormValues>('apps', {

    successMessage: 'Uygulama Oluşturuldu.',

  });

  const updateMutation = useUpdateMutation<AppFormValues>('apps', {

    successMessage: 'Uygulama Güncellendi.',

  });

  const deleteMutation = useDeleteMutation('apps', {

    successMessage: 'Uygulama silindi.',

  });



  useEffect(() => {

    if (!isModalOpen) {

      form.resetFields();

      setEditingId(null);

    }

  }, [form, isModalOpen]);



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const app = await fetchEntityById<AppDto>('apps', id);

      setEditingId(id);

      form.setFieldsValue({

        appCode: app.appCode,

        appName: app.appName,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Bu uygulamayı silmek istediğinize emin misiniz?',

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
  const filteredApps = useMemo(() => filterByQuery(apps, search), [apps, search]);


  const columns: ColumnsType<AppDto> = [

    {

      title: 'Kod',

      dataIndex: 'appCode',

    },

    {

      title: 'Ad',

      dataIndex: 'appName',

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

    return <LoadingState text="Uygulamalar Yükleniyor..." />;

  }



  if (isError || !apps) {

    return (

      <ErrorState

        subtitle="Uygulamalar alinirken bir hata olustu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Uygulama Yönetimi"

        description="OtpIdentity altyapısını kullanan uygulamaları yönetin."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Uygulama

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<AppDto>
          rowKey="id"
          dataSource={filteredApps}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Uygulamayı Düzenle' : 'Yeni Uygulama'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => {

          void handleSubmit();

        }}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={520}

      >

        <Form<AppFormValues> form={form} layout="vertical">

          <Form.Item

            label="Uygulama Kodu"

            name="appCode"

            rules={[

              { required: true, message: 'Kod zorunludur.' },

              { max: 32, message: 'En fazla 32 karakter olmalıdır.' },

            ]}

          >

            <Input placeholder="Örn. OTPPORTAL" disabled={!!editingId} />

          </Form.Item>

          <Form.Item

            label="Uygulama Adı"

            name="appName"

            rules={[

              { required: true, message: 'Ad zorunludur.' },

              { max: 128, message: 'En fazla 128 karakter olmalıdır.' },

            ]}

          >

            <Input placeholder="Uygulama adı" />

          </Form.Item>

        </Form>

      </Modal>

    </>

  );

};



