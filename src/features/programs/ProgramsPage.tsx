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

import type { Guid, ProgramDto } from '@/types/entities';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';



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

    successMessage: 'Program Oluşturuldu.',

  });

  const updateMutation = useUpdateMutation<ProgramFormValues>('programs', {

    successMessage: 'Program Güncellendi.',

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

      title: 'Programı silmek istediğinize emin misiniz?',

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
  const filteredPrograms = useMemo(() => filterByQuery(programs, search), [programs, search]);

  const columns: ColumnsType<ProgramDto> = [

    {

      title: 'Program Kodu',

      dataIndex: 'programCode',

    },

    {

      title: 'Program Adı',

      dataIndex: 'programName',

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

    return <LoadingState text="Programlar Yükleniyor..." />;

  }



  if (isError || !programs) {

    return (

      <ErrorState

        subtitle="Programlar alınırken bir hata oluştu."

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
        description="Program kayıtlarını yönetin, yeni program ekleyin."
        actions={[
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Program
          </Button>
        ]}
      />



      <SurfaceCard style={{ width: '100%' }}>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<ProgramDto>
          rowKey="id"
          dataSource={filteredPrograms}
          columns={columns}
          pagination={{ pageSize: 8 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Programı Düzenle' : 'Yeni Program'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => {

          void handleSubmit();

        }}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={520}

      >

        <Form<ProgramFormValues> layout="vertical" form={form}>

          <Form.Item

            label="Program Kodu"

            name="programCode"

            rules={[

              { required: true, message: 'Kod zorunludur.' },

              { max: 32, message: 'En fazla 32 karakter olmalıdır.' },

            ]}

          >

            <Input placeholder="Örn. SAP" />

          </Form.Item>

          <Form.Item

            label="Program Adı"

            name="programName"

            rules={[

              { required: true, message: 'Program adı zorunludur.' },

              { max: 128, message: 'En fazla 128 karakter olmalıdır.' },

            ]}

          >

            <Input placeholder="Program adı" />

          </Form.Item>

        </Form>

      </Modal>

    </>

  );

};




