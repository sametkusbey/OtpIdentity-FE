import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { SurfaceCard } from '@/components/layout/SurfaceCard';
import { TableFilterBar } from '@/components/table/TableFilterBar';

import { fetchEntityById, useCreateMutation, useCrudList, useDeleteMutation, useUpdateMutation } from '@/hooks/useCrud';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { ApiError } from '@/lib/apiClient';
import type { Guid, ProgramDto, ProgramVersionDto } from '@/types/entities';
import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';

export type ProgramEditionDto = {
  id: Guid;
  programVersionId: Guid;
  editionCode: string;
  editionName: string;
};

type ProgramEditionFormValues = { programId?: Guid; programVersionId: Guid; editionCode: string; editionName: string };

export const ProgramEditionsPage = () => {
  const [form] = Form.useForm<ProgramEditionFormValues>();
  const { modal } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Guid | null>(null);

  const { data: programs } = useCrudList<ProgramDto>('programs');
  const { data: versions } = useCrudList<ProgramVersionDto>('versions');

  // Filters for list
  const [filterProgramId, setFilterProgramId] = useState<Guid | undefined>(undefined);
  const [filterVersionId, setFilterVersionId] = useState<Guid | undefined>(undefined);

  // Load editions with optional version filter
  const { data: editions, isLoading, isError, refetch } = useQuery<ProgramEditionDto[], ApiError>({
    queryKey: ['programeditions', { filterVersionId }],
    queryFn: async () => {
      const qs = filterVersionId ? `?programVersionId=${encodeURIComponent(filterVersionId)}` : '';
      const res = await apiClient.get(`/programeditions${qs}`);
      const payload = res.data as any;
      const data = Array.isArray(payload) ? payload : payload?.data;
      return Array.isArray(data) ? (data as ProgramEditionDto[]) : [];
    },
  });

  const createMutation = useCreateMutation<ProgramEditionFormValues>('programeditions', {
    successMessage: 'Program sürümü oluşturuldu.',
  });
  const updateMutation = useUpdateMutation<ProgramEditionFormValues>('programeditions', {
    successMessage: 'Program sürümü güncellendi.',
  });
  const deleteMutation = useDeleteMutation('programeditions', {
    successMessage: 'Kayit silindi.',
  });

  const programOptions = useMemo(() => (programs ?? []).map((p) => ({ label: p.programName, value: p.id })), [programs]);
  const versionOptionsAll = useMemo(
    () => (versions ?? []).map((v) => ({ label: v.versionName, value: v.id, programId: v.programId })),
    [versions],
  );
  const versionOptionsForFilter = useMemo(
    () => versionOptionsAll.filter((v) => (filterProgramId ? v.programId === filterProgramId : true)),
    [versionOptionsAll, filterProgramId],
  );
  const versionOptionsForForm = useMemo(
    () => versionOptionsAll.filter((v) => (form.getFieldValue('programId') ? v.programId === form.getFieldValue('programId') : true)),
    [versionOptionsAll, form],
  );

  const [search, setSearch] = useState('');
  const filtered = useMemo(() => filterByQuery(editions, search), [editions, search]);

  useEffect(() => {
    if (!isModalOpen) form.resetFields();
  }, [isModalOpen, form]);

  const openCreate = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = async (id: Guid) => {
    try {
      const entity = await fetchEntityById<ProgramEditionDto>('programeditions', id);
      setEditingId(id);
      setIsModalOpen(true);
      // derive programId from version map
      const v = (versions ?? []).find((x) => x.id === entity.programVersionId);
      form.setFieldsValue({
        programId: v?.programId,
        programVersionId: entity.programVersionId,
        editionCode: entity.editionCode,
        editionName: entity.editionName,
      } as ProgramEditionFormValues);
    } catch (e) {
      // ignore; error state below will handle
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: ProgramEditionFormValues = {
        programId: values.programId,
        programVersionId: values.programVersionId,
        editionCode: String(values.editionCode).trim(),
        editionName: String(values.editionName).trim(),
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: { programVersionId: payload.programVersionId, editionCode: payload.editionCode, editionName: payload.editionName } as any });
      } else {
        await createMutation.mutateAsync({ programVersionId: payload.programVersionId, editionCode: payload.editionCode, editionName: payload.editionName } as any);
      }
      setIsModalOpen(false);
      setEditingId(null);
      void refetch();
    } catch (e) {
      const err = e as ApiError & { response?: { data?: unknown } };
      applyValidationErrors(err, form);
    }
  };

  const handleDelete = (id: Guid) => {
    modal.confirm({
      title: 'Kaydı silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgec',
      centered: true,
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        void refetch();
      },
    });
  };

  const programNameMap = useMemo(() => {
    const map = new Map<Guid, string>();
    (programs ?? []).forEach((p) => map.set(p.id, p.programName));
    return map;
  }, [programs]);
  const versionMap = useMemo(() => {
    const map = new Map<Guid, ProgramVersionDto>();
    (versions ?? []).forEach((v) => map.set(v.id, v));
    return map;
  }, [versions]);

  const columns: ColumnsType<ProgramEditionDto> = [
    { title: 'Program', dataIndex: 'programVersionId', render: (v: Guid) => {
      const ver = versionMap.get(v); return ver ? (programNameMap.get(ver.programId) ?? '-') : '-';
    } },
    { title: 'Versiyon', dataIndex: 'programVersionId', render: (v: Guid) => versionMap.get(v)?.versionName ?? '-' },
    { title: 'Sürüm Kodu', dataIndex: 'editionCode' },
    { title: 'Sürüm Adı', dataIndex: 'editionName' },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button icon={<EditOutlined />} onClick={() => void openEdit(record.id)} />
          </Tooltip>
          <Tooltip title="Sil">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError || !editions) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader
        title="Program Sürümleri"
        description="Program versiyonlarına ait sürüm kayıtlarını yönetin ve yeni sürüm ekleyin."
        actions={
          <Space>
            <Select
              placeholder="Program filtre"
              allowClear
              style={{ minWidth: 200 }}
              options={programOptions}
              value={filterProgramId}
              onChange={(v) => { setFilterProgramId(v); setFilterVersionId(undefined); }}
            />
            <Select
              placeholder="Sürüm filtre"
              allowClear
              style={{ minWidth: 200 }}
              options={versionOptionsForFilter.map(({ label, value }) => ({ label, value }))}
              value={filterVersionId}
              onChange={(v) => { setFilterVersionId(v); }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Yeni Sürüm
            </Button>
          </Space>
        }
      />

      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<ProgramEditionDto>
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>

      <Modal
        title={editingId ? 'Sürümü Düzenle' : 'Yeni Sürüm'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onOk={handleSubmit}
        okText={editingId ? 'Güncelle' : 'Oluştur'}
        cancelText="Vazgec"
        width={640}
      >
        <Form<ProgramEditionFormValues> form={form} layout="vertical" initialValues={{ programId: undefined }}>
          <Row gutter={[18, 18]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Program"
                name="programId"
                rules={[{ required: true, message: 'Program seçimi zorunludur.' }]}
              >
                <Select placeholder="Program seçin" options={programOptions} showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Versiyon"
                name="programVersionId"
                rules={[{ required: true, message: 'Versiyon seçimi zorunludur.' }]}
              >
                <Select placeholder="Versiyon seçin" options={versionOptionsForForm.map(({ label, value }) => ({ label, value }))} showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Sürüm Kodu"
                name="editionCode"
                rules={[
                  { required: true, message: 'Sürüm kodu zorunludur.' },
                  { max: 32, message: 'En fazla 32 karakter olmalıdır.' },
                  () => ({
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const vId = form.getFieldValue('programVersionId') as Guid | undefined;
                      if (!vId) return Promise.resolve();
                      const exists = editions?.some(
                        (e: ProgramEditionDto) => e.programVersionId === vId && e.editionCode.toLowerCase() === String(value).toLowerCase() && e.id !== editingId,
                      );
                      return exists ? Promise.reject(new Error('Bu program için sürüm kodu benzersiz olmalıdır.')) : Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input placeholder="RUN" disabled={!!editingId} />
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item
                label="Sürüm Adı"
                name="editionName"
                rules={[
                  { required: true, message: 'Sürüm adı zorunludur.' },
                  { max: 128, message: 'En fazla 128 karakter olmalıdır.' },
                ]}
              >
                <Input placeholder="Run" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
