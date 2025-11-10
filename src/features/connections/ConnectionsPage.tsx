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

import type {

  AppDto,

  ConnectionDto,

  ConnectionTypeDto,

  DealerDto,

  Guid,

  ProgramDto,

  ProgramVersionDto,

} from '@/types/entities';

import type { ApiError } from '@/lib/apiClient';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';
import { listDealersForCompanyAddresses } from '@/features/dealers/api';
import { useQuery } from '@tanstack/react-query';



type ConnectionFormValues = Omit<ConnectionDto, 'id'>;



export const ConnectionsPage = () => {

  const [form] = Form.useForm<ConnectionFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: connections,

    isLoading,

    isError,

    refetch,

  } = useCrudList<ConnectionDto>('Connections');

  const { data: programs } = useCrudList<ProgramDto>('Programs');

  const { data: programVersions } = useCrudList<ProgramVersionDto>('Versions');

  const { data: connectionTypes } = useCrudList<ConnectionTypeDto>('ConnectionTypes');

  // Bağlantılar için özel endpoint kullan - sadece yetkili müşterileri getirir
  const { data: dealers, refetch: refetchDealers } = useQuery<DealerDto[], ApiError>({
    queryKey: ['dealers', 'for-company-addresses'],
    queryFn: listDealersForCompanyAddresses,
    staleTime: 0, // Her zaman fresh data çek
    refetchOnMount: true, // Sayfa mount olduğunda refetch et
    refetchOnWindowFocus: false, // Window focus'ta refetch etme (isteğe bağlı)
  });

  const { data: apps } = useCrudList<AppDto>('Apps');



  const createMutation = useCreateMutation<ConnectionFormValues>('Connections', {

    successMessage: 'Bağlantı Oluşturuldu.',

  });

  const updateMutation = useUpdateMutation<ConnectionFormValues>('Connections', {

    successMessage: 'Bağlantı Güncellendi.',

  });

  const deleteMutation = useDeleteMutation('Connections', {

    successMessage: 'Bağlantı silindi.',

  });



  useEffect(() => {

    if (!isModalOpen) {

      form.resetFields();

      setEditingId(null);

    } else {
      // Modal açıldığında dealers'ı refetch et
      void refetchDealers();
    }

  }, [form, isModalOpen, refetchDealers]);



  const [search, setSearch] = useState('');
  const filteredConnections = useMemo(
    () => filterByQuery(connections, search),
    [connections, search],
  );

  const dealerOptions = useMemo(

    () =>

      dealers?.map((dealer) => ({

        label: `${dealer.title} ${dealer.isCustomer ? '(Müşteri)' : '(Bayi)'}`,

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



  const dealerMap = useMemo(() => {

    const map = new Map<Guid, DealerDto>();

    dealers?.forEach((dealer) => map.set(dealer.id, dealer));

    return map;

  }, [dealers]);



  const appMap = useMemo(() => {

    const map = new Map<Guid, AppDto>();

    apps?.forEach((app) => map.set(app.id, app));

    return map;

  }, [apps]);



  const selectedProgramId = Form.useWatch('programId', form) as Guid | undefined;
  const selectedConnectionTypeId = Form.useWatch('connectionTypeId', form) as Guid | undefined;



  const filteredProgramVersions = useMemo(

    () =>

      (programVersions ?? [])

        .filter((version) => version.programId === selectedProgramId)

        .map((version) => ({

          label: version.versionName,

          value: version.id,

        })),

    [programVersions, selectedProgramId],

  );



  const programVersionMap = useMemo(() => {

    const map = new Map<Guid, ProgramVersionDto>();

    programVersions?.forEach((version) => map.set(version.id, version));

    return map;

  }, [programVersions]);

  const connectionTypeMap = useMemo(() => {

    const map = new Map<Guid, ConnectionTypeDto>();

    connectionTypes?.forEach((type) => map.set(type.id, type));

    return map;

  }, [connectionTypes]);

  const connectionTypeOptions = useMemo(

    () =>

      connectionTypes?.map((type) => ({

        label: type.name,

        value: type.id,

      })) ?? [],

    [connectionTypes],

  );

  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const connection = await fetchEntityById<ConnectionDto>('Connections', id);

      setEditingId(id);

      form.setFieldsValue({

        programId: connection.programId,

        programVersionId: connection.programVersionId,

        appId: connection.appId,

        dealerId: connection.dealerId,

        connectionTypeId: connection.connectionTypeId,

        parameter1: connection.parameter1 ?? undefined,

        parameter2: connection.parameter2 ?? undefined,

        parameter3: connection.parameter3 ?? undefined,

        parameter4: connection.parameter4 ?? undefined,

        parameter5: connection.parameter5 ?? undefined,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Bağlantı kaydını silmek istediğinize emin misiniz?',

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

      const version = programVersions?.find(

        (item) => item.id === values.programVersionId,

      );

      if (version && version.programId !== values.programId) {

        form.setFields([

          {

            name: 'programVersionId',

            errors: ['Seçili sürüm seçilen program ile eşleşmiyor.'],

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



  const columns: ColumnsType<ConnectionDto> = [

    {

      title: 'Bayi/Müşteri',

      dataIndex: 'dealerId',

      render: (value: Guid) => {
        const dealer = dealerMap.get(value);
        if (!dealer) return '-';
        return (
          <span>
            {dealer.title}{' '}
            <Tag color={dealer.isCustomer ? 'blue' : 'green'}>
              {dealer.isCustomer ? 'Müşteri' : 'Bayi'}
            </Tag>
          </span>
        );
      },

    },

    {

      title: 'Uygulama',

      dataIndex: 'appId',

      render: (value: Guid) => appMap.get(value)?.appName ?? '-',

    },

    {

      title: 'Program',

      dataIndex: 'programId',

      render: (value: Guid) => programMap.get(value)?.programName ?? '-',

    },

    {

      title: 'Program Versiyonu',

      dataIndex: 'programVersionId',

      render: (value: Guid) => programVersionMap.get(value)?.versionName ?? '-',

    },

    {

      title: 'Bağlantı Tipi',

      dataIndex: 'connectionTypeId',

      render: (value: Guid) => connectionTypeMap.get(value)?.name ?? '-',

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

    return <LoadingState text="Bağlantılar Yükleniyor..." />;

  }



  if (isError || !connections) {

    return (

      <ErrorState

        subtitle="Bağlantılar alınırken bir hata oluştu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Bağlantı Yönetimi"

        description="Program, sürüm, uygulama ve bayi bağlantılarını parametrik olarak tanımlayın."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Bağlantı

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<ConnectionDto>
          rowKey="id"
          dataSource={filteredConnections}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Bağlantıyı Düzenle' : 'Yeni Bağlantı'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={780}

      >

        <Form<ConnectionFormValues> form={form} layout="vertical">

          <Row gutter={[18, 18]}>

            <Col xs={24} md={12}>

              <Form.Item

                label="Program"

                name="programId"

                rules={[{ required: true, message: 'Program Seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Program Seçin"

                  options={programOptions}

                  showSearch

                  optionFilterProp="label"

                  onChange={() => {

                    form.setFieldValue('programVersionId', undefined);

                  }}

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Program Versiyonu"

                name="programVersionId"

                rules={[{ required: true, message: 'Program sürümü seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Sürüm Seçin"

                  options={filteredProgramVersions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Uygulama"

                name="appId"

                rules={[{ required: true, message: 'Uygulama Seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Uygulama Seçin"

                  options={appOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Bayi/Müşteri"

                name="dealerId"

                rules={[{ required: true, message: 'Bayi Seçimi zorunludur.' }]}

              >

                <Select

                  placeholder="Bayi Seçin"

                  options={dealerOptions}

                  showSearch

                  optionFilterProp="label"

                />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Bağlantı Tipi"

                name="connectionTypeId"

                rules={[{ required: true, message: 'Bağlantı tipi zorunludur.' }]}

              >

                <Select

                  placeholder="Bağlantı Tipi Seçin"

                  options={connectionTypeOptions}

                  showSearch

                  optionFilterProp="label"

                  onChange={() => {

                    // Bağlantı tipi değiştiğinde parametreleri temizle

                    form.setFieldsValue({

                      parameter1: undefined,

                      parameter2: undefined,

                      parameter3: undefined,

                      parameter4: undefined,

                      parameter5: undefined,

                    });

                  }}

                />

              </Form.Item>

            </Col>

            {/* Dinamik parametreler - sadece seçili bağlantı tipine göre */}

            {selectedConnectionTypeId && (() => {

              const selectedType = connectionTypeMap.get(selectedConnectionTypeId);

              if (!selectedType) return null;

              

              const params = [

                { name: 'parameter1', label: selectedType.parameter1Name },

                { name: 'parameter2', label: selectedType.parameter2Name },

                { name: 'parameter3', label: selectedType.parameter3Name },

                { name: 'parameter4', label: selectedType.parameter4Name },

                { name: 'parameter5', label: selectedType.parameter5Name },

              ].filter(p => p.label); // Sadece dolu olanları göster



              return params.map((param) => (

                <Col xs={24} md={12} key={param.name}>

                  <Form.Item

                    label={param.label}

                    name={param.name}

                    rules={[{ max: 256, message: 'En fazla 256 karakter olmalıdır.' }]}

                  >

                    <Input placeholder={param.label ?? ''} />

                  </Form.Item>

                </Col>

              ));

            })()}

          </Row>

        </Form>

      </Modal>

    </>

  );

};



