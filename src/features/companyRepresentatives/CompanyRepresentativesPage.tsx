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

  CompanyRepresentativeDto,

  DealerDto,

  Guid,

} from '@/types/entities';

import type { ApiError } from '@/lib/apiClient';

import { applyValidationErrors } from '@/utils/form';
import { filterByQuery } from '@/utils/filter';
import { listDealersForCompanyAddresses } from '@/features/dealers/api';
import { useQuery } from '@tanstack/react-query';



type RepresentativeFormValues = Omit<CompanyRepresentativeDto, 'id'>;



export const CompanyRepresentativesPage = () => {

  const [form] = Form.useForm<RepresentativeFormValues>();

  const { modal } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<Guid | null>(null);



  const {

    data: representatives,

    isLoading,

    isError,

    refetch,

  } = useCrudList<CompanyRepresentativeDto>('companyrepresentatives');

  // Şirket temsilcileri için özel endpoint kullan - sadece yetkili müşterileri getirir
  const { data: dealers, refetch: refetchDealers } = useQuery<DealerDto[], ApiError>({
    queryKey: ['dealers', 'for-company-addresses'],
    queryFn: listDealersForCompanyAddresses,
    staleTime: 0, // Her zaman fresh data çek
    refetchOnMount: true, // Sayfa mount olduğunda refetch et
    refetchOnWindowFocus: false, // Window focus'ta refetch etme (isteğe bağlı)
  });



  const createMutation = useCreateMutation<RepresentativeFormValues>(

    'companyrepresentatives',

    {

      successMessage: 'Temsilci Oluşturuldu.',

    },

  );

  const updateMutation = useUpdateMutation<RepresentativeFormValues>(

    'companyrepresentatives',

    {

      successMessage: 'Temsilci Güncellendi.',

    },

  );

  const deleteMutation = useDeleteMutation('companyrepresentatives', {

    successMessage: 'Temsilci silindi.',

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



  const dealerOptions = useMemo(

    () =>

      dealers?.map((dealer) => ({

        label: `${dealer.title} ${dealer.isCustomer ? '(Müşteri)' : '(Bayi)'}`,

        value: dealer.id,

      })) ?? [],

    [dealers],

  );



  const dealerMap = useMemo(() => {

    const map = new Map<Guid, DealerDto>();

    dealers?.forEach((dealer) => map.set(dealer.id, dealer));

    return map;

  }, [dealers]);



  const openCreateModal = () => setIsModalOpen(true);



  const openEditModal = async (id: Guid) => {

    try {

      const representative = await fetchEntityById<CompanyRepresentativeDto>(

        'companyrepresentatives',

        id,

      );

      setEditingId(id);

      form.setFieldsValue({

        dealerId: representative.dealerId,

        name: representative.name,

        lastName: representative.lastName,

        phoneNumber: representative.phoneNumber ?? undefined,

        emailAddress: representative.emailAddress ?? undefined,

      });

      setIsModalOpen(true);

    } catch {

      // handled globally

    }

  };



  const handleDelete = (id: Guid) => {

    modal.confirm({

      title: 'Temsilci Kaydını silmek istediğinize emin misiniz?',

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
  const filteredRepresentatives = useMemo(
    () => filterByQuery(representatives, search),
    [representatives, search],
  );

  const columns: ColumnsType<CompanyRepresentativeDto> = [

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

      title: 'Ad',

      dataIndex: 'name',

    },

    {

      title: 'Soyad',

      dataIndex: 'lastName',

    },

    {

      title: 'Telefon',

      dataIndex: 'phoneNumber',

      render: (value?: string | null) => value ?? '-',

    },

    {

      title: 'E-posta',

      dataIndex: 'emailAddress',

      render: (value?: string | null) => value ?? '-',

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

    return <LoadingState text="Temsilciler Yükleniyor..." />;

  }



  if (isError || !representatives) {

    return (

      <ErrorState

        subtitle="Temsilciler alınırken bir hata oluştu."

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  return (

    <>

      <PageHeader

        title="Şirket Temsilcileri Yönetimi"

        description="Bayi sorumlularını kaydedin ve iletişim bilgilerine hızla ulaşın."

        actions={

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>

            Yeni Temsilci

          </Button>

        }

      />



      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<CompanyRepresentativeDto>
          rowKey="id"
          dataSource={filteredRepresentatives}
          columns={columns}
          pagination={{ pageSize: 7 }}
        />
      </SurfaceCard>



      <Modal

        title={editingId ? 'Temsilciyi Düzenle' : 'Yeni Temsilci'}

        open={isModalOpen}

        onCancel={() => setIsModalOpen(false)}

        onOk={() => void handleSubmit()}

        okText={editingId ? 'Güncelle' : 'Oluştur'}

        cancelText="Vazgeç"

        width={600}

      >

        <Form<RepresentativeFormValues> form={form} layout="vertical">

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

                label="Ad"

                name="name"

                rules={[

                  { required: true, message: 'Ad zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Ad girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Soyad"

                name="lastName"

                rules={[

                  { required: true, message: 'Soyad zorunludur.' },

                  { max: 64, message: 'En fazla 64 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="Soyad girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="Telefon"

                name="phoneNumber"

                rules={[{ max: 32, message: 'En fazla 32 karakter olmalıdır.' }]}

              >

                <Input placeholder="Telefon girin" />

              </Form.Item>

            </Col>

            <Col xs={24} md={12}>

              <Form.Item

                label="E-posta"

                name="emailAddress"

                rules={[

                  { type: 'email', message: 'Geçerli bir e-posta girin.' },

                  { max: 256, message: 'En fazla 256 karakter olmalıdır.' },

                ]}

              >

                <Input placeholder="E-posta girin" />

              </Form.Item>

            </Col>

          </Row>

        </Form>

      </Modal>

    </>

  );

};





