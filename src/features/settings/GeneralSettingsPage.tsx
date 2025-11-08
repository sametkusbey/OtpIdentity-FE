import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Table, Tag, Space, Tooltip, Switch, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { SurfaceCard } from '@/components/layout/SurfaceCard';
import { useAuth } from '@/features/auth/AuthContext';
import { TableFilterBar } from '@/components/table/TableFilterBar';
import { useCrudList } from '@/hooks/useCrud';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { PortalAccountListItemDto, AuthAccountDto, PortalMenuDto } from '@/types/portal';
import { portalRegister, getPortalAccount, updatePortalAccount, deactivatePortalAccount, listPortalMenus, getPortalAccountMenus } from '@/features/portalAuth/api';
import { formatDateTime } from '@/utils/formatters';

// Only username/password are required by create API; menuIds is read via getFieldValue
type CreateFormValues = { username: string; password: string };
// Update supports password/isActive/menuIds
type UpdateFormValues = { password?: string; isActive?: boolean; menuIds?: string[] };

export const GeneralSettingsPage = () => {
  const { user: authUser, login: authLogin } = useAuth();
  const { modal } = App.useApp();

  const [createForm] = Form.useForm<CreateFormValues>();
  const [updateForm] = Form.useForm<UpdateFormValues>();

  const { data: accounts, refetch } = useCrudList<PortalAccountListItemDto>('portalaccounts');

  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts ?? [];
    return (accounts ?? []).filter((a) => a.username.toLowerCase().includes(q));
  }, [accounts, search]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AuthAccountDto | null>(null);

  // Menu catalog
  const [menus, setMenus] = useState<PortalMenuDto[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const list = await listPortalMenus();
        setMenus(list);
      } catch {
        // ignore catalog load failure
      }
    })();
  }, []);

  useEffect(() => {
    if (!createOpen) createForm.resetFields();
  }, [createOpen, createForm]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const menuIds = (createForm.getFieldValue('menuIds') as string[] | undefined) ?? [];
      await portalRegister(values.username, values.password, menuIds);
      showSuccessToast('Hesap oluşturuldu.');
      setCreateOpen(false);
      void refetch();
    } catch (err: any) {
      showErrorToast(err?.message ?? 'Kayıt başarısız');
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
        const assigned = await getPortalAccountMenus(acc.id);
        updateForm.setFieldsValue({ isActive: acc.isActive, password: undefined, menuIds: assigned.map((m) => m.id) });
      } catch {
        updateForm.setFieldsValue({ isActive: acc.isActive, password: undefined });
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
      const fieldTouched = updateForm.isFieldTouched('menuIds');
      const selectedMenus = updateForm.getFieldValue('menuIds') as string[] | undefined;
      if (selectedMenus !== undefined) {
        payload.menuIds = selectedMenus ?? [];
      }
      if (!('password' in payload) && !('isActive' in payload) && !('menuIds' in payload)) {
        showErrorToast('Güncellenecek bir alan seçiniz.');
        return;
      }
      await updatePortalAccount(editing.id, payload);
      setEditOpen(false);
      setEditing(null);
      void refetch();
      // Reflect in navbar if current user updated own menus
      if (authUser && authUser.id === editing.id && fieldTouched) {
        const newMenus = menus.filter((m) => (selectedMenus ?? []).includes(m.id));
        authLogin({ id: authUser.id, name: authUser.name, email: authUser.email, menus: newMenus });
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
          await deactivatePortalAccount(acc.id);
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
    { title: 'Aktif Mi ?', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Evet' : 'Hayır'}</Tag>, width: 120 },
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
        description="Portal kullanıcı hesaplarını yönetin."
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
          pagination={{ pageSize: 8 }}
        />
      </SurfaceCard>

      <Modal
        title="Yeni Hesap Oluştur"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Oluştur"
        cancelText="Vazgeç"
        width={480}
      >
        <Form<CreateFormValues> form={createForm} layout="vertical">
          <Form.Item
            label="Kullanıcı Adı"
            name="username"
            rules={[{ required: true, message: 'Kullanıcı adı zorunludur.' }]}
          >
            <Input placeholder="kullanıcı adı" />
          </Form.Item>
          <Form.Item
            label="Şifre"
            name="password"
            rules={[{ required: true, message: 'Şifre zorunludur.' }]}
          >
            <Input.Password placeholder="Şifre" />
          </Form.Item>
          <Form.Item label="Menüler" name="menuIds">
            <Select mode="multiple" allowClear options={menus.map((m) => ({ label: m.menuName, value: m.id }))} placeholder="Yetkili menüleri seçin" />
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
            <Input.Password placeholder="Boş bırakılırsa değiştirilmez" />
          </Form.Item>
          <Form.Item label="Aktiflik" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
          </Form.Item>
          <Form.Item label="Menüler" name="menuIds">
            <Select mode="multiple" allowClear options={menus.map((m) => ({ label: m.menuName, value: m.id }))} placeholder="Yetkili menüleri güncelle (boş bırakırsa değişiklik yok)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};





