import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Table, Tag, Space, Tooltip, Switch, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { SurfaceCard } from '@/components/layout/SurfaceCard';
import { useAuth } from '@/features/auth/AuthContext';
import { TableFilterBar } from '@/components/table/TableFilterBar';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { PortalAccountListItemDto, AuthAccountDto, PortalMenuDto } from '@/types/portal';
import type { DealerDto } from '@/types/entities';
import { portalRegister, type RegisterRequest } from '@/features/portalAuth/api';
import { listPortalMenus } from '@/features/portalMenus/api';
import { 
  listPortalAccounts, 
  getPortalAccount, 
  updatePortalAccount, 
  deletePortalAccount,
  getPortalAccountMenus 
} from '@/features/portalAuth/api';
import { formatDateTime } from '@/utils/formatters';

type CreateFormValues = { username: string; password: string; dealerId: string };
type UpdateFormValues = { password?: string; isActive?: boolean; menuIds?: string[]; ownedDealerId?: string | null };

export const GeneralSettingsPage = () => {
  const { user: authUser, login: authLogin } = useAuth();
  const { modal } = App.useApp();

  const [createForm] = Form.useForm<CreateFormValues>();
  const [updateForm] = Form.useForm<UpdateFormValues>();

  const isAdmin = !!authUser?.isAdmin;

  // Portal hesapları listesini dokümandaki API ile çek
  const [accounts, setAccounts] = useState<PortalAccountListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  
  const refetch = async () => {
    try {
      setLoading(true);
      console.log('Portal hesapları yükleniyor...');
      console.log('Auth user:', {
        id: authUser?.id,
        name: authUser?.name,
        isAdmin: authUser?.isAdmin,
        dealerCode: authUser?.dealerCode,
        hasToken: !!authUser?.token,
        tokenStart: authUser?.token?.substring(0, 20)
      });
      console.log('Is authenticated:', !!authUser?.token);
      
      console.log('listPortalAccounts çağrılıyor...');
      const data = await listPortalAccounts();
      console.log('Portal hesapları yüklendi:', data);
      console.log('Data type:', typeof data, 'Array?', Array.isArray(data), 'Length:', data?.length);
      setAccounts(data);
    } catch (error: any) {
      console.error('Portal hesapları alınamadı:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response?.data,
        hasToken: !!authUser?.token
      });
      showErrorToast(`Portal hesapları alınamadı: ${error?.message ?? 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    void refetch();
  }, []);
  // Bayiler listesini dokümandaki API ile çek
  const [dealers, setDealers] = useState<DealerDto[]>([]);
  
  const fetchDealers = async () => {
    try {
      console.log('Bayiler yükleniyor...');
      const { listDealers } = await import('@/features/dealers/api');
      const data = await listDealers({ isCustomer: false }); // Sadece bayiler
      console.log('Bayiler yüklendi:', data);
      setDealers(data);
    } catch (error: any) {
      console.error('Bayiler alınamadı:', error);
      showErrorToast(`Bayiler alınamadı: ${error?.message ?? 'Bilinmeyen hata'}`);
    }
  };
  
  useEffect(() => {
    void fetchDealers();
  }, []);

  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => a.username.toLowerCase().includes(q));
  }, [accounts, search]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AuthAccountDto | null>(null);

  // Menüler listesini dokümandaki API ile çek
  const [menus, setMenus] = useState<PortalMenuDto[]>([]);
  
  const fetchMenus = async () => {
    try {
      console.log('Menüler yükleniyor...');
      const list = await listPortalMenus();
      console.log('Menüler yüklendi:', list);
      setMenus(list);
    } catch (error: any) {
      console.error('Menüler alınamadı:', error);
      showErrorToast(`Menüler alınamadı: ${error?.message ?? 'Bilinmeyen hata'}`);
    }
  };
  
  useEffect(() => {
    void fetchMenus();
  }, []);

  useEffect(() => {
    if (!createOpen) createForm.resetFields();
  }, [createOpen, createForm]);

  useEffect(() => {
    if (!editOpen) updateForm.resetFields();
  }, [editOpen, updateForm]);


  const adminDealerOptions = useMemo(
    () =>
      dealers
        .filter((dealer) => dealer && !dealer.isCustomer)
        .map((dealer) => ({
          label: dealer.title?.trim() || dealer.dealerCode?.trim() || dealer.taxIdentifierNumber,
          value: dealer.id,
        })),
    [dealers],
  );

  const dealerSelectOptions = useMemo(() => {
    return adminDealerOptions;
  }, [adminDealerOptions]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      
      // Bayi seçimi kontrolü
      if (!values.dealerId || values.dealerId.trim() === '') {
        showErrorToast('Bayi seçimi zorunludur. Lütfen bir bayi seçin.');
        return;
      }
      
      const menuIds = (createForm.getFieldValue('menuIds') as string[] | undefined) ?? [];
      
      // Dokümantasyona göre RegisterRequest interface'ini kullan
      const request: RegisterRequest = {
        username: values.username,
        password: values.password,
        menuIds: menuIds.length > 0 ? menuIds : undefined,
        dealerId: values.dealerId,
      };
      
      await portalRegister(request);
      showSuccessToast('Portal hesabı oluşturuldu.');
      setCreateOpen(false);
      void refetch();
    } catch (err: any) {
      console.log('Form validation failed:', err);
      showErrorToast(err?.message ?? 'Lütfen tüm zorunlu alanları doldurun.');
    }
  };

  const openEdit = async (record: PortalAccountListItemDto) => {
    try {
      const id = record.id;
      if (!id) {
        showErrorToast('İşlem için id gerekiyor.');
        return;
      }
      const acc = await getPortalAccount(id);
      setEditing(acc);
      setEditOpen(true);
      try {
        // Mevcut menüleri çek ve form'a set et
        const assigned = await getPortalAccountMenus(acc.id);
        updateForm.setFieldsValue({
          isActive: acc.isActive,
          password: undefined,
          menuIds: assigned.map((m) => m.id),
          ownedDealerId: undefined, // Bu bilgi getPortalAccount'tan gelmiyor, gerekirse ayrı endpoint
        });
      } catch {
        updateForm.setFieldsValue({ 
          isActive: acc.isActive, 
          password: undefined,
          ownedDealerId: undefined,
        });
      }
    } catch (e: any) {
      showErrorToast(e?.message ?? 'Hesap bilgisi alınamadı.');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editing) return;
      const values = await updateForm.validateFields();
      const payload: UpdateFormValues = {};
      if (values.password && values.password.trim() !== '') payload.password = values.password;
      if (typeof values.isActive === 'boolean') payload.isActive = values.isActive;

      const selectedMenus = updateForm.getFieldValue('menuIds') as string[] | undefined;
      const menusTouched = updateForm.isFieldTouched('menuIds');
      if (selectedMenus !== undefined) {
        payload.menuIds = selectedMenus ?? [];
      }

      const ownedDealerTouched = updateForm.isFieldTouched('ownedDealerId');
      const ownedDealerId = updateForm.getFieldValue('ownedDealerId') as string | undefined;
      if (isAdmin) {
        if (ownedDealerTouched) {
          payload.ownedDealerId = ownedDealerId ?? null;
        }
      }

      if (!('password' in payload) && !('isActive' in payload) && !('menuIds' in payload) && !('ownedDealerId' in payload)) {
        showErrorToast('Güncellenecek bir alan seçiniz.');
        return;
      }

      await updatePortalAccount(editing.id, payload);
      setEditOpen(false);
      setEditing(null);
      void refetch();

      // Eğer kendi hesabını güncelliyorsa ve menüler değiştiyse, auth context'i güncelle
      if (authUser && authUser.id === editing.id && menusTouched) {
        const newMenus = menus.filter((m) => (selectedMenus ?? []).includes(m.id));
        authLogin({ 
          id: authUser.id, 
          name: authUser.name, 
          email: authUser.email, 
          menus: newMenus, 
          isAdmin: authUser.isAdmin,
          dealerCode: authUser.dealerCode // dealerCode korunur
        });
      }
    } catch (e: any) {
      showErrorToast(e?.message ?? 'Güncelleme başarısız');
    }
  };

  const handleDelete = async (record: PortalAccountListItemDto) => {
    try {
      const id = record.id;
      if (!id) {
        showErrorToast('İşlem için id gerekiyor.');
        return;
      }
      const acc = await getPortalAccount(id);
      modal.confirm({
        title: `${acc.username} hesabını pasife almak istiyor musunuz?`,
        okText: 'Pasife Al',
        okType: 'danger',
        cancelText: 'Vazgeç',
        centered: true,
        onOk: async () => {
          await deletePortalAccount(acc.id);
          void refetch();
        },
      });
    } catch (e: any) {
      showErrorToast(e?.message ?? 'Hesap bilgisi alınamadı.');
    }
  };

  const columns: ColumnsType<PortalAccountListItemDto> = [
    { title: 'Kullanıcı Adı', dataIndex: 'username' },
    { title: 'Oluşturma Tarihi', dataIndex: 'createdDate', render: (v: string) => formatDateTime(v) },
    { title: 'Aktif mi?', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Evet' : 'Hayır'}</Tag>, width: 120 },
    { title: 'Bayi Kodu', dataIndex: 'dealerCode', render: (v?: string | null) => v ?? '-', width: 120 },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button icon={<EditOutlined />} onClick={() => void openEdit(record)} />
          </Tooltip>
          <Tooltip title="Pasife Al">
            <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Genel Ayarlar"
        description="Portal kullanıcı hesaplarını yönetin. Her hesap bir bayiye bağlanmalıdır."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Yeni Hesap
          </Button>
        }
      />

      <SurfaceCard>
        <TableFilterBar value={search} onChange={setSearch} />
        <Table<PortalAccountListItemDto>
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 7 }}
          loading={loading}
        />
      </SurfaceCard>

      <Modal
        title="Yeni Hesap Oluştur"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Oluştur"
        cancelText="Vazgeç"
        width={500}
      >
        <Form<CreateFormValues> form={createForm} layout="vertical">
          <Form.Item label="Kullanıcı Adı" name="username" rules={[{ required: true, message: 'Kullanıcı adı zorunludur.' }]}> 
            <Input placeholder="kullanıcı adı" />
          </Form.Item>
          <Form.Item label="Şifre" name="password" rules={[{ required: true, message: 'Şifre zorunludur.' }]}> 
            <Input.Password placeholder="şifre" />
          </Form.Item>
          <Form.Item label="Menü yetkileri" name="menuIds">
            <Select mode="multiple" allowClear options={menus.map((m) => ({ label: m.menuName, value: m.id }))} placeholder="Yetkili menüleri seçin" />
          </Form.Item>
          <Form.Item
            label="Bağlı Bayi"
            name="dealerId"
            rules={[{ required: true, message: 'Bayi seçimi zorunludur.' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={dealerSelectOptions}
              placeholder="Bayi seçin"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Hesabı Güncelle"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onOk={handleUpdate}
        okText="Güncelle"
        cancelText="Vazgeç"
        width={520}
      >
        <Form<UpdateFormValues> form={updateForm} layout="vertical">
          <Form.Item label="Kullanıcı Adı">
            <Input value={editing?.username} disabled />
          </Form.Item>
          <Form.Item label="Yeni Şifre" name="password">
            <Input.Password placeholder="Boş bırakılırsa değişmez" />
          </Form.Item>
          <Form.Item label="Aktiflik" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
          </Form.Item>
          <Form.Item label="Menü Yetkileri" name="menuIds">
            <Select 
              mode="multiple" 
              allowClear 
              options={menus.map((m) => ({ label: m.menuName, value: m.id }))} 
              placeholder="Yetkili menüleri seçin"
            />
          </Form.Item>
          <Form.Item label="Bağlı Bayi" name="ownedDealerId">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={dealerSelectOptions}
              placeholder="Bu hesabı hangi bayiye bağlamak istersiniz?"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
