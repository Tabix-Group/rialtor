import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, X, Check } from 'lucide-react';

export default function UserManagement({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    office: '',
    role: 'USER',
    password: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  // Fetch users
  useEffect(() => {
    setLoading(true);
    fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
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
    setForm({ name: '', email: '', phone: '', office: '', role: 'USER', password: '', isActive: true });
    setModalType('create');
    setShowModal(true);
  };
  const openEditModal = (user: any) => {
    setForm({ ...user, password: '' });
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
  const handleSave = async () => {
    setSaving(true);
    const method = modalType === 'create' ? 'POST' : 'PUT';
    // use query parameter for proxy
    const url = modalType === 'create'
      ? '/api/users'
      : `/api/users?id=${selectedUser.id}`;
    // Build request payload, omit empty password if editing
    let payload: any;
    if (modalType === 'create' || form.password) {
      payload = { ...form };
    } else {
      const { password, ...rest } = form;
      payload = rest;
    }
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error');
      // Refresh users
      const updated = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await updated.json();
      setUsers(data.users || []);
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
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error');
      setUsers(users.filter(u => u.id !== user.id));
    } catch {
      setError('Error al eliminar usuario');
    }
    setSaving(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <button onClick={openCreateModal} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors">
          <UserPlus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oficina</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.office}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
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
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select className="w-full border rounded px-3 py-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Admin</option>
                  <option value="BROKER">Broker</option>
                  <option value="AGENTE">Agente</option>
                </select>
              </div>
              {modalType === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                <label htmlFor="isActive" className="text-sm">Activo</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
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
