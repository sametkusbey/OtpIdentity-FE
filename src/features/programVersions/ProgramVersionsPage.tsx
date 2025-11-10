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
import { TableFilterBar } from '@/components/table/TableFilterBar';

import {

  fetchEntityById,

  useCreateMutation,

  useCrudList,

  useDeleteMutation,

  useUpdateMutation,

} from '@/hooks/useCrud';

import type { ApiError } from '@/lib/apiClient';

import type {

  Guid,

  ProgramDto,

  ProgramVersionDto,

} from '@/types/entities';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';



type ProgramVersionFormValues = Omit<ProgramVersionDto, 'id'>;



export const ProgramVersionsPage = () => {

  const [form] = Form.useForm<ProgramVersionFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: programVersions,

    isLoading,

    isError,

    refetch,

  } = useCrudList<ProgramVersionDto>('versions');

  const { data: programs } = useCrudList<ProgramDto>('programs');



  const createMutation = useCreateMutation<ProgramVersionFormValues>('versions', {

    successMessage: 'Program versiyonu oluşturuldu.',

  });

  const updateMutation = useUpdateMutation<ProgramVersionFormValues>('versions', {

    successMessage: 'Program versiyonu güncellendi.',

  });

  const deleteMutation = useDeleteMutation('versions', {

    successMessage: 'Versiyon silindi.',

  });



  useEffect(() => {

    if (!isModalOpen) {

      form.resetFields();

      setEditingId(null);

    }

  }, [form, isModalOpen]);



  const programOptions = useMemo(

    () =>

      programs?.map((program) => ({

        label: program.programName,

        value: program.id,

      })) ?? [],

    [programs],

  );



  const programMap = useMemo(() => {

    const map = new Map<Guid, ProgramDto>();

    programs?.forEach((program) => map.set(program.id, program));

    return map;

  }, [programs]);



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const programVersion = await fetchEntityById<ProgramVersionDto>('versions', id);

      setEditingId(id);

      form.setFieldsValue({

        programId: programVersion.programId,

        versionCode: programVersion.versionCode,

        versionName: programVersion.versionName,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Versiyonu silmek istediğinize emin misiniz?',

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



  const [search, setSearch] = useState('');
  const filteredProgramVersions = useMemo(
    () => filterByQuery(programVersions, search),
    [programVersions, search],
  );

  const columns: ColumnsType<ProgramVersionDto> = [

    {

      title: 'Program',

      dataIndex: 'programId',

      render: (value: Guid) => programMap.get(value)?.programName ?? '-',

    },

    {

      title: 'Versiyon Kodu',

      dataIndex: 'versionCode',

    },

    {

      title: 'Versiyon Adı',

      dataIndex: 'versionName',

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

    return <LoadingState text="Program versiyonleri yükleniyor..." />;

  }



  if (isError || !programVersions) {

    return (

      <ErrorState

        subtitle="Program versiyonları alınırken bir hata oluştu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Program Versiyon Yönetimi"

        description="Her program için benzersiz versiyon kodları tanımlayın."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Versiyon

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<ProgramVersionDto>
          rowKey="id"
          dataSource={filteredProgramVersions}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Versiyon Düzenle' : 'Yeni Program Versiyon'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => {

          void handleSubmit();

        }}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={640}

      >

        <Form<ProgramVersionFormValues>

          form={form}

          layout="vertical"

          initialValues={{ programId: undefined }}

        >

          <Row gutter={[18, 18]}>

            <Col xs={24} md={12}>

              <Form.Item

                label="Program"

                name="programId"

                rules={[{ required: true, message: 'Program seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Program seçin"

                  options={programOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Versiyon Kodu"

                name="versionCode"

                rules={[

                  { required: true, message: 'Versiyon kodu zorunludur.' },

                  { max: 32, message: 'En fazla 32 karakter olmalıdır.' },

                  () => ({

                    validator(_, value) {

                      if (!value) return Promise.resolve();

                      const selectedProgram = form.getFieldValue('programId') as Guid | undefined;

                      if (!selectedProgram) return Promise.resolve();

                      const exists = programVersions?.some(

                        (item) =>

                          item.programId === selectedProgram &&

                          item.versionCode.toLowerCase() === String(value).toLowerCase() &&

                          item.id !== editingId,

                      );

                      if (exists) {

                        return Promise.reject(

                          new Error('Seçilen program için bu versiyon kodu zaten kayıtlı.'),

                        );

                      }

                      return Promise.resolve();

                    },

                  }),

                ]}

              >

                <Input placeholder="Örn. v1.0.0" disabled={!!editingId} />

              </Form.Item>

            </Col>

            <Col xs={24} md={24}>

              <Form.Item

                label="Versiyon Adı"

                name="versionName"

                rules={[

                  { required: true, message: 'Versiyon adı zorunludur.' },

                  { max: 128, message: 'En fazla 128 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Versiyon adı" />

              </Form.Item>

            </Col>

          </Row>

        </Form>

      </Modal>

    </>

  );

};



