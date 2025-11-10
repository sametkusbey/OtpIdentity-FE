import {

  DeleteOutlined,

  EditOutlined,

  PlusOutlined,

} from '@ant-design/icons';

import {

  App,

  Button,

  Col,

  DatePicker,

  Form,

  InputNumber,

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

import dayjs, { type Dayjs } from 'dayjs';

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

  DealerDto,

  Guid,

  LicenseDto,

  RenewalPeriodType,

} from '@/types/entities';

import type { ApiError } from '@/lib/apiClient';

import { formatDate } from '@/utils/formatters';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';



type LicenseFormValues = Omit<LicenseDto, 'id' | 'startDate' | 'endDate'> & {

  startDate: Dayjs;

  endDate?: Dayjs | null;

};



type LicensePayload = Omit<LicenseDto, 'id'>;



const renewalOptions = [

  { label: 'Gun', value: 1 },

  { label: 'Ay', value: 2 },

  { label: 'Yil', value: 3 },

];



export const LicensesPage = () => {

  const [form] = Form.useForm<LicenseFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: licenses,

    isLoading,

    isError,

    refetch,

  } = useCrudList<LicenseDto>('licenses');

  const { data: dealers } = useCrudList<DealerDto>('dealers');

  const { data: apps } = useCrudList<AppDto>('apps');



  const createMutation = useCreateMutation<LicensePayload>('licenses', {

    successMessage: 'Lisans Oluşturuldu.',

  });

  const updateMutation = useUpdateMutation<LicensePayload>('licenses', {

    successMessage: 'Lisans Güncellendi.',

  });

  const deleteMutation = useDeleteMutation('licenses', {

    successMessage: 'Lisans silindi.',

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



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const license = await fetchEntityById<LicenseDto>('licenses', id);

      setEditingId(id);

      form.setFieldsValue({

        dealerId: license.dealerId,

        appId: license.appId,

        startDate: dayjs(license.startDate),

        endDate: license.endDate ? dayjs(license.endDate) : null,

        renewalPeriod: license.renewalPeriod,

        renewalPeriodType: license.renewalPeriodType,

        isAutoRenewed: license.isAutoRenewed,

        isLocked: license.isLocked,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Lisans silmek istediğinize emin misiniz?',

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

      const payload: LicensePayload = {

        ...values,

        startDate: values.startDate.toISOString(),

        endDate: values.endDate ? values.endDate.toISOString() : null,

      };

      if (editingId) {

        await updateMutation.mutateAsync({ id: editingId, payload });

      } else {

        await createMutation.mutateAsync(payload);

      }

      setIsModalOpen(false);

    } catch (error) {

      const apiError = error as ApiError;

      applyValidationErrors(apiError, form);

    }

  };



  const [search, setSearch] = useState('');
  const filteredLicenses = useMemo(() => filterByQuery(licenses, search), [licenses, search]);

  const columns: ColumnsType<LicenseDto> = [

    {

      title: 'Bayi',

      dataIndex: 'dealerId',

      render: (value: Guid) => dealerMap.get(value)?.title ?? '-',

    },

    {

      title: 'Uygulama',

      dataIndex: 'appId',

      render: (value: Guid) => appMap.get(value)?.appName ?? '-',

    },

    {

      title: 'Başlangıç',

      dataIndex: 'startDate',

      render: (value: string) => formatDate(value),

    },

    {

      title: 'Bitiş',

      dataIndex: 'endDate',

      render: (value?: string | null) => formatDate(value),

    },

    {

      title: 'Yenileme Periyodu',

      dataIndex: 'renewalPeriod',

      render: (value: number, record) =>

        `${value} ${

          renewalOptions.find((opt) => opt.value === record.renewalPeriodType)?.label ?? ''

        }`,

    },

    {

      title: 'Otomatik Yenileme',

      dataIndex: 'isAutoRenewed',

      render: (value: boolean) => (

        <Tag color={value ? 'green' : 'default'}>{value ? 'Aktif' : 'Pasif'}</Tag>

      ),

    },

    {

      title: 'Kilitle',

      dataIndex: 'isLocked',

      render: (value: boolean) => (

        <Tag color={value ? 'red' : 'default'}>{value ? 'Kilitle' : 'Açık'}</Tag>

      ),

    },

    {

      title: 'İşlemler',

      key: 'actions',

      width: 170,

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

    return <LoadingState text="Lisanslar Yükleniyor..." />;

  }



  if (isError || !licenses) {

    return (

      <ErrorState

        subtitle="Lisanslar alinirken bir hata olustu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Lisans Yönetimi"

        description="Lisans kayıtlarını yönetin, yeni lisans ekleyin."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Lisans

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<LicenseDto>
          rowKey="id"
          dataSource={filteredLicenses}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Lisansı Düzenle' : 'Yeni Lisans'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={760}

      >

        <Form<LicenseFormValues>

          form={form}

          layout="vertical"

          initialValues={{

            renewalPeriodType: 2 as RenewalPeriodType,

            renewalPeriod: 1,

            isAutoRenewed: false,

            isLocked: false,

          }}

        >

          <Row gutter={[18, 18]}>

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

                label="Başlangıç Tarihi"

                name="startDate"

                rules={[{ required: true, message: 'Başlangıç tarihi zorunludur.' }]}

              >

                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Bitiş Tarihi"

                name="endDate"

                dependencies={['startDate']}

                rules={[

                  ({ getFieldValue }) => ({

                    validator(_, value: Dayjs | undefined) {

                      const start = getFieldValue('startDate') as Dayjs | undefined;

                      if (!value || !start) {

                        return Promise.resolve();

                      }

                      if (value.isBefore(start)) {

                        return Promise.reject(

                          new Error('Bitiş tarihi başlangıç tarihinden önce olamaz.'),

                        );

                      }

                      return Promise.resolve();

                    },

                  }),

                ]}

              >

                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} allowClear />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Yenileme Periyodu"

                name="renewalPeriod"

                rules={[

                  { required: true, message: 'Yenileme periyodu zorunludur.' },

                  {

                    validator(_, value) {

                      if (!value || value <= 0) {

                        return Promise.reject(

                          new Error('Periyot sıfırdan büyük olmalıdır.'),

                        );

                      }

                      return Promise.resolve();

                    },

                  },

                ]}

              >

                <InputNumber min={1} style={{ width: '100%' }} />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Periyot Tipi"

                name="renewalPeriodType"

                rules={[{ required: true, message: 'Periyot tipi zorunludur.' }]}

              >

                <Select options={renewalOptions} />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Otomatik Yenileme"

                name="isAutoRenewed"

                valuePropName="checked"

              >

                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Kilitle"

                name="isLocked"

                valuePropName="checked"

              >

                <Switch checkedChildren="Kilitle" unCheckedChildren="Açık" />

              </Form.Item>

            </Col>

          </Row>

        </Form>

      </Modal>

    </>

  );

};







