import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, X, Check } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

export default function UserManagement({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    office: string;
    roles: string[];
    password: string;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    office: '',
    roles: [],
    password: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  // Fetch users
  useEffect(() => {
    setLoading(true);
    authenticatedFetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar usuarios');
        setLoading(false);
      });
  }, [token]);

  // Modal handlers
  const openCreateModal = () => {
    setForm({ name: '', email: '', phone: '', office: '', password: '', isActive: true, roles: [] });
    setModalType('create');
    setShowModal(true);
  };
  const openEditModal = (user: any) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      office: user.office,
      password: '',
      isActive: user.isActive,
      roles: user.roles?.map((r: any) => r.id) || [],
    });
    setSelectedUser(user);
    setModalType('edit');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType(null);
  };

  // CRUD actions
  const [roles, setRoles] = useState<any[]>([]);
  useEffect(() => {
    authenticatedFetch('/api/roles')
      .then(res => res.json())
      .then(data => setRoles(data || []));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    const method = modalType === 'create' ? 'POST' : 'PUT';
    const url = modalType === 'create'
      ? '/api/users'
      : `/api/users?id=${selectedUser.id}`;
    const payload: any = { ...form };
    if (!form.password) delete payload.password;
    try {
      // Guardar usuario (sin roles)
      const res = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error');
      const userData = await res.json();
      // Asignar roles
      if (form.roles && userData.user) {
        await Promise.all(
          roles.map((role: any) => {
            const hasRole = (form.roles as any[]).includes(role.id);
            const userHasRole = userData.user.roles.some((r: any) => r.id === role.id);
            if (hasRole && !userHasRole) {
              return authenticatedFetch(`/api/users/${userData.user.id}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roleId: role.id })
              });
            } else if (!hasRole && userHasRole) {
              return authenticatedFetch(`/api/users/${userData.user.id}/roles/${role.id}`, {
                method: 'DELETE'
              });
            }
            return null;
          })
        );
      }
      // Refrescar usuario editado para asegurar roles correctos
      if (modalType === 'edit' && selectedUser) {
        const updatedUserRes = await authenticatedFetch(`/api/users?id=${selectedUser.id}`);
        if (updatedUserRes.ok) {
          const updatedUserData = await updatedUserRes.json();
          setUsers(users => users.map(u => u.id === selectedUser.id ? updatedUserData.user : u));
        } else {
          // fallback: refrescar toda la lista
          const updated = await authenticatedFetch('/api/users');
          const data = await updated.json();
          setUsers(data.users || []);
        }
      } else {
        const updated = await authenticatedFetch('/api/users');
        const data = await updated.json();
        setUsers(data.users || []);
      }
      closeModal();
    } catch {
      setError('Error al guardar usuario');
    }
    setSaving(false);
  };

  const handleDelete = async (user: any) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setSaving(true);
    try {
      // use query parameter for delete
      const res = await authenticatedFetch(`/api/users?id=${user.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error');
      setUsers(users.filter(u => u.id !== user.id));
    } catch {
      setError('Error al eliminar usuario');
    }
    setSaving(false);
  };

  const handleToggleActive = async (user: any) => {
    setSaving(true);
    try {
      const res = await authenticatedFetch(`/api/users?id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      if (!res.ok) throw new Error('Error');
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === user.id ? updatedUser.user : u));
    } catch {
      setError('Error al cambiar estado del usuario');
    }
    setSaving(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <UserPlus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
      ) : error ? (
        <div className="text-center py-8 text-blue-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <colgroup>
              <col style={{ width: '16%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Email</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Oficina</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Roles</th>
                {/* <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Permisos</th> */}
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-3 py-2 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">{user.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">{user.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{user.phone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{user.office}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {user.roles?.map((role: any) => (
                      <span key={role.id} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-1 mb-1">{role.name}</span>
                    ))}
                  </td>
                  {/* Columna permisos eliminada */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                    <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900" title="Editar"><Edit className="w-4 h-4" /></button>
                    {user.isActive ? (
                      <button onClick={() => handleToggleActive(user)} className="text-orange-600 hover:text-orange-900" title="Desactivar">
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleToggleActive(user)} className="text-green-600 hover:text-green-900" title="Activar">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X /></button>
            <h3 className="text-lg font-semibold mb-4">{modalType === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h3>
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={modalType === 'edit'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Oficina</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={form.office} onChange={e => setForm(f => ({ ...f, office: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Roles</label>
                <select
                  multiple
                  className="w-full border rounded px-3 py-2 h-32 overflow-y-auto bg-white"
                  value={form.roles}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(o => o.value);
                    setForm(f => ({ ...f, roles: options }));
                  }}
                >
                  {roles.map((role: any) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              {modalType === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
              )}
              {modalType === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <input type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Dejar vacío para no cambiar" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                <label htmlFor="isActive" className="text-sm">Activo</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                  <Check className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
