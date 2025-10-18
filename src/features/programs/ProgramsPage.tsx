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

import { useEffect, useState } from 'react';

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

import type { Guid, ProgramDto } from '@/types/entities';

import { applyValidationErrors } from '@/utils/form';



type ProgramFormValues = Omit<ProgramDto, 'id'>;



export const ProgramsPage = () => {

  const [form] = Form.useForm<ProgramFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: programs,

    isLoading,

    isError,

    refetch,

  } = useCrudList<ProgramDto>('programs');



  const createMutation = useCreateMutation<ProgramFormValues>('programs', {

    successMessage: 'Program OluÅŸturuldu.',

  });

  const updateMutation = useUpdateMutation<ProgramFormValues>('programs', {

    successMessage: 'Program GÃ¼ncellendi.',

  });

  const deleteMutation = useDeleteMutation('programs', {

    successMessage: 'Program silindi.',

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

      const program = await fetchEntityById<ProgramDto>('programs', id);

      setEditingId(id);

      form.setFieldsValue({

        programCode: program.programCode,

        programName: program.programName,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Programi silmek istediginize emin misiniz?',

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



  const columns: ColumnsType<ProgramDto> = [

    {

      title: 'Program Kodu',

      dataIndex: 'programCode',

    },

    {

      title: 'Program Adi',

      dataIndex: 'programName',

    },

    {

      title: 'Ä°ÅŸlemler',

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

    return <LoadingState text="Programlar YÃ¼kleniyor..." />;

  }



  if (isError || !programs) {

    return (

      <ErrorState

        subtitle="Programlar alinirken bir hata olustu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Program Yönetimi"

        description="Harici sistem programlarını kaydedin ve kodlarını takip edin."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Program

          </Button>

        }

      />



      <SurfaceCard>

        <Table<ProgramDto>

          rowKey="id"

          dataSource={programs}

          columns={columns}

          pagination={{ pageSize: 10 }}

        />

      </SurfaceCard>



      <Modal

        title={editingId ? 'Programi Duzenle' : 'Yeni Program'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => {

          void handleSubmit();

        }}

        okText={editingId ? 'GÃ¼ncelle' : 'OluÅŸtur'}

        cancelText="Vazgec"

        width={520}

      >

        <Form<ProgramFormValues> layout="vertical" form={form}>

          <Form.Item

            label="Program Kodu"

            name="programCode"

            rules={[

              { required: true, message: 'Kod zorunludur.' },

              { max: 32, message: 'En fazla 32 karakter olmalidir.' },

            ]}

          >

            <Input placeholder="Orn. SAP" />

          </Form.Item>

          <Form.Item

            label="Program Adi"

            name="programName"

            rules={[

              { required: true, message: 'Program adi zorunludur.' },

              { max: 128, message: 'En fazla 128 karakter olmalidir.' },

            ]}

          >

            <Input placeholder="Program adi" />

          </Form.Item>

        </Form>

      </Modal>

    </>

  );

};




