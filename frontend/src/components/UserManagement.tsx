import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, X, Check, CreditCard, DollarSign, Ban } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

export default function UserManagement({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [subscriptionUser, setSubscriptionUser] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [cancelImmediately, setCancelImmediately] = useState(false);
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
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setSaving(true);
    try {
      const res = await authenticatedFetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error');
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch {
      setError('Error al eliminar usuario');
    }
    setSaving(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleToggleActive = async (user: any) => {
    // Solo permitir activación/desactivación manual si NO requiere suscripción
    if (user.requiresSubscription && user.subscriptionStatus) {
      setError('Este usuario tiene suscripción activa. Usa los controles de suscripción.');
      return;
    }
    
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

  const openCancelSubscriptionModal = (user: any) => {
    setSubscriptionUser(user);
    setCancelImmediately(false);
    setShowCancelSubscriptionModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionUser) return;
    setSaving(true);
    try {
      const res = await authenticatedFetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: subscriptionUser.id,
          immediately: cancelImmediately
        })
      });
      if (!res.ok) throw new Error('Error al cancelar suscripción');
      
      // Refrescar lista de usuarios
      const usersRes = await authenticatedFetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
      
      setShowCancelSubscriptionModal(false);
      setSubscriptionUser(null);
    } catch (err: any) {
      setError(err.message || 'Error al cancelar suscripción');
    }
    setSaving(false);
  };

  const openRefundModal = (user: any) => {
    setSubscriptionUser(user);
    setRefundAmount('');
    setRefundReason('requested_by_customer');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (!subscriptionUser) return;
    setSaving(true);
    try {
      const payload: any = {
        userId: subscriptionUser.id,
        reason: refundReason
      };
      if (refundAmount) {
        payload.amount = parseFloat(refundAmount);
      }
      
      const res = await authenticatedFetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al procesar reembolso');
      }
      
      // Refrescar lista de usuarios
      const usersRes = await authenticatedFetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
      
      setShowRefundModal(false);
      setSubscriptionUser(null);
    } catch (err: any) {
      setError(err.message || 'Error al procesar reembolso');
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Email</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Roles</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Suscripción</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Renovación</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{user.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">{user.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {user.roles?.map((role: any) => (
                      <span key={role.id} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-1 mb-1">{role.name}</span>
                    ))}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {user.requiresSubscription ? (
                      user.subscriptionStatus ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                          user.subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-800' :
                          user.subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.subscriptionStatus === 'active' ? 'Activo' :
                           user.subscriptionStatus === 'trialing' ? 'Prueba' :
                           user.subscriptionStatus === 'past_due' ? 'Pago Atrasado' :
                           user.subscriptionStatus === 'canceled' ? 'Cancelado' : user.subscriptionStatus}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Pendiente
                        </span>
                      )
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Legacy/Admin
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {user.subscriptionPlanType ? (
                      <span className="text-xs">
                        {user.subscriptionPlanType === 'monthly' ? '$25/mes' : '$240/año'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {user.currentPeriodEnd ? (
                      <>
                        {new Date(user.currentPeriodEnd).toLocaleDateString()}
                        {user.cancelAtPeriodEnd && (
                          <div className="text-red-600 font-semibold">Cancela</div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900" title="Editar"><Edit className="w-4 h-4" /></button>
                      
                      {/* Mostrar controles de suscripción solo si el usuario tiene suscripción activa */}
                      {user.requiresSubscription && user.subscriptionStatus && ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus) && (
                        <>
                          <button 
                            onClick={() => openCancelSubscriptionModal(user)} 
                            className="text-orange-600 hover:text-orange-900" 
                            title="Cancelar Suscripción"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openRefundModal(user)} 
                            className="text-purple-600 hover:text-purple-900" 
                            title="Reembolso"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Solo mostrar toggle activo/inactivo para usuarios sin suscripción */}
                      {!user.requiresSubscription && (
                        user.isActive ? (
                          <button onClick={() => handleToggleActive(user)} className="text-orange-600 hover:text-orange-900" title="Desactivar">
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleToggleActive(user)} className="text-green-600 hover:text-green-900" title="Activar">
                            <Check className="w-4 h-4" />
                          </button>
                        )
                      )}
                      
                      <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
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

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative border-l-4 border-red-600">
            <button onClick={cancelDelete} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X /></button>
            <h3 className="text-lg font-semibold mb-2 text-red-600">⚠️ Eliminar Usuario</h3>
            <p className="text-gray-700 mb-4">
              Estás a punto de eliminar a <strong>{userToDelete.name}</strong> ({userToDelete.email}).
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-700 font-medium mb-2">Esta acción es IRREVERSIBLE y eliminará:</p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                <li>Todos los artículos creados</li>
                <li>Todas las sesiones de chat</li>
                <li>Solicitudes y plantillas de documentos</li>
                <li>Historial de calculadoras</li>
                <li>Placas de propiedades</li>
                <li>Archivos subidos</li>
                <li>Transacciones financieras</li>
                <li>Todos los datos asociados</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={cancelDelete} disabled={saving} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={saving} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> {saving ? 'Eliminando...' : 'Sí, eliminar usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelación de Suscripción */}
      {showCancelSubscriptionModal && subscriptionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowCancelSubscriptionModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X /></button>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-orange-600" />
              Cancelar Suscripción
            </h3>
            <p className="text-gray-700 mb-4">
              Usuario: <strong>{subscriptionUser.name}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Plan actual: <strong>{subscriptionUser.subscriptionPlanType === 'monthly' ? '$25/mes' : '$240/año'}</strong>
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Selecciona cuándo cancelar la suscripción:
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="cancelOption"
                  checked={!cancelImmediately}
                  onChange={() => setCancelImmediately(false)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Al final del período actual</div>
                  <div className="text-sm text-gray-600">
                    El usuario mantendrá acceso hasta {subscriptionUser.currentPeriodEnd ? new Date(subscriptionUser.currentPeriodEnd).toLocaleDateString() : 'el final del período'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="cancelOption"
                  checked={cancelImmediately}
                  onChange={() => setCancelImmediately(true)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-red-600">Inmediatamente</div>
                  <div className="text-sm text-gray-600">
                    El usuario perderá acceso de inmediato
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowCancelSubscriptionModal(false)} 
                disabled={saving}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCancelSubscription} 
                disabled={saving}
                className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
              >
                <Ban className="w-4 h-4" /> {saving ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reembolso */}
      {showRefundModal && subscriptionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowRefundModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X /></button>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Procesar Reembolso
            </h3>
            <p className="text-gray-700 mb-4">
              Usuario: <strong>{subscriptionUser.name}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Plan: <strong>{subscriptionUser.subscriptionPlanType === 'monthly' ? '$25/mes' : '$240/año'}</strong>
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
              <p className="text-sm text-purple-800 font-medium mb-2">
                ⚠️ Un reembolso completo cancelará la suscripción automáticamente
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto del reembolso (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Dejar vacío para reembolso completo"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dejar vacío para reembolsar el último pago completo
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="requested_by_customer">Solicitado por el cliente</option>
                  <option value="duplicate">Pago duplicado</option>
                  <option value="fraudulent">Fraudulento</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowRefundModal(false)} 
                disabled={saving}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={handleProcessRefund} 
                disabled={saving}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> {saving ? 'Procesando...' : 'Procesar Reembolso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
