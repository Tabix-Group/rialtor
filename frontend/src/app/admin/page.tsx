'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, MessageSquare, Settings, TrendingUp, BarChart3, Shield, Percent, File, Tag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import UserManagement from '../../components/UserManagement'
import NewsManagement from '../../components/NewsManagement'
import CategoryManagement from '../../components/CategoryManagement'
import FileManagement from '../../components/FileManagement'
import { authenticatedFetch } from '@/utils/api'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ReactNode
}

import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'

// Función auxiliar para verificar permisos sin usar hooks
function checkPermission(user: { roles?: { permissions?: string[] }[] }, permission: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => role.permissions?.includes(permission));
}


export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasAdminPerm, setHasAdminPerm] = useState(false);
  const [hasUserMgmtPerm, setHasUserMgmtPerm] = useState(false);
  const [permsLoading, setPermsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  // Dashboard stats
  const [statsData, setStatsData] = useState<{ 
    totalUsers: number; 
    publishedArticles: number; 
    chatQueries: number; 
    documentsUploaded: number;
    activityData?: { name: string; actividad: number }[];
    userStatusData?: { name: string; value: number }[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [documentsCount, setDocumentsCount] = useState<number | null>(null);
  // Recent users state
  const [recentUsersData, setRecentUsersData] = useState<{ id: string; name: string; email: string; roles: { id: string; name: string }[]; isActive: boolean }[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Bank rates state
  const [bankRates, setBankRates] = useState<{ id: string; bankName: string; interestRate: number; termMonths?: number }[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newTermMonths, setNewTermMonths] = useState('');

  // Economic indices state
  const [economicIndices, setEconomicIndices] = useState<{ id: string; indicator: string; value: number; date: string; description?: string }[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(false);
  const [newIndicator, setNewIndicator] = useState('');
  const [newIndexValue, setNewIndexValue] = useState('');
  const [newIndexDate, setNewIndexDate] = useState('');
  const [newIndexDescription, setNewIndexDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterIndicator, setFilterIndicator] = useState('');

  // Verificar permisos solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const adminPerm = checkPermission(user, 'view_admin');
      const userMgmtPerm = checkPermission(user, 'manage_users');
      setHasAdminPerm(adminPerm);
      setHasUserMgmtPerm(userMgmtPerm);
      setPermsLoading(false);
    }
  }, [user]);

  // Proteger ruta: si no está logueado, redirigir a login
  useEffect(() => {
    if (!loading && !permsLoading && (!user || !hasAdminPerm)) {
      router.replace('/auth/login');
    }
  }, [user, loading, hasAdminPerm, permsLoading, router]);

  // Fetch dashboard stats
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    setStatsLoading(true);
    authenticatedFetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStatsData(data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));

    // Obtener el total real de documentos subidos
    authenticatedFetch('/api/documents?countOnly=1')
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') setDocumentsCount(data.count);
      })
      .catch(() => setDocumentsCount(null));
  }, []);

  // Fetch recent users
  useEffect(() => {
    const fetchRecentUsers = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      setRecentLoading(true);
      try {
        const res = await authenticatedFetch('/api/users');
        const data = await res.json();
        setRecentUsersData(data.users || []);
      } catch (error) {
        console.error(error);
      } finally {
        setRecentLoading(false);
      }
    };
    fetchRecentUsers();
  }, []);

  // Fetch bank rates
  useEffect(() => {
    const fetchBankRates = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      setRatesLoading(true);
      try {
        const res = await authenticatedFetch('/api/admin/rates');
        const data = await res.json();
        if (data && data.success) {
          setBankRates(data.data);
        } else {
          // Try test endpoint
          const res2 = await authenticatedFetch('/api/admin/rates-test');
          const data2 = await res2.json();
          if (data2 && data2.success) setBankRates(data2.data);
        }
      } catch (error) {
        console.error('Error fetching bank rates:', error);
        // Try rates-test as last resort
        try {
          const res = await authenticatedFetch('/api/admin/rates-test');
          const data = await res.json();
          if (data && data.success) setBankRates(data.data);
        } catch (e) {
          console.error('rates-test also failed:', e);
        }
      } finally {
        setRatesLoading(false);
      }
    };
    fetchBankRates();
  }, []);

  // Fetch economic indices
  useEffect(() => {
    const fetchEconomicIndices = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      setIndicesLoading(true);
      try {
        const res = await authenticatedFetch('/api/admin/economic-indices');
        const data = await res.json();
        if (data && data.success) {
          setEconomicIndices(data.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (error) {
        console.error('Error fetching economic indices:', error);
      } finally {
        setIndicesLoading(false);
      }
    };
    fetchEconomicIndices();
  }, []);

  // Delete bank rate
  const deleteBankRate = async (rateId: string, bankName: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar la tasa del banco "${bankName}"?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/admin/rates/${rateId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setBankRates(prev => prev.filter(rate => rate.id !== rateId));
        alert('Tasa eliminada exitosamente');
      } else {
        alert('Error al eliminar la tasa');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la tasa');
    }
  };

  // Save bank rate
  const saveBankRate = async () => {
    if (!newBankName.trim() || !newRate.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      const res = await authenticatedFetch('/api/admin/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: newBankName.trim(),
          interestRate: parseFloat(newRate),
          termMonths: newTermMonths ? parseInt(newTermMonths) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setBankRates(prev => {
          const existing = prev.find(r => r.bankName === newBankName.trim());
          if (existing) {
            return prev.map(r => r.id === existing.id ? data.data : r);
          } else {
            return [...prev, data.data];
          }
        });
        setNewBankName('');
        setNewRate('');
        setNewTermMonths('');
        alert('Tasa guardada exitosamente');
      } else {
        alert('Error al guardar la tasa');
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar la tasa');
    }
  };

  // Delete economic index
  const deleteEconomicIndex = async (indexId: string, indicator: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el índice "${indicator}"?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/admin/economic-indices/${indexId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setEconomicIndices(prev => {
          const updated = prev.filter(idx => idx.id !== indexId);
          // Check if we need to adjust current page
          const totalPages = Math.ceil(updated.length / itemsPerPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }
          return updated;
        });
        alert('Índice eliminado exitosamente');
      } else {
        alert('Error al eliminar el índice');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el índice');
    }
  };

  // Save economic index
  const saveEconomicIndex = async () => {
    if (!newIndicator.trim() || !newIndexValue.trim() || !newIndexDate.trim()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const res = await authenticatedFetch('/api/admin/economic-indices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicator: newIndicator.trim(),
          value: parseFloat(newIndexValue),
          date: newIndexDate,
          description: newIndexDescription.trim() || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setEconomicIndices(prev => [...prev, data.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setNewIndicator('');
        setNewIndexValue('');
        setNewIndexDate('');
        setNewIndexDescription('');
        setCurrentPage(1); // Reset to first page when adding new item
        alert('Índice guardado exitosamente');
      } else {
        alert(data.error || 'Error al guardar el índice');
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar el índice');
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading || permsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado o no tiene permisos, no renderizar nada
  if (!user || !hasAdminPerm) {
    return null;
  }

  // Prepare stats cards
  const stats: StatCard[] = statsLoading || !statsData
    ? []
    : [
      { title: 'Total Usuarios', value: statsData.totalUsers.toString(), change: '', changeType: 'increase', icon: <Users className="w-6 h-6" /> },
      { title: 'Artículos Publicados', value: statsData.publishedArticles.toString(), change: '', changeType: 'increase', icon: <FileText className="w-6 h-6" /> },
      { title: 'Consultas Chat', value: statsData.chatQueries.toString(), change: '', changeType: 'increase', icon: <MessageSquare className="w-6 h-6" /> },
      { title: 'Documentos Subidos', value: (documentsCount !== null ? documentsCount.toString() : statsData.documentsUploaded.toString()), change: '', changeType: 'increase', icon: <FileText className="w-6 h-6" /> }
    ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-blue-600">{stat.icon}</div>
            </div>
            <div className="mt-4">
              {stat.change && (
                <>
                  <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-orange-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Mensual</h3>
          <div className="h-64">
            {statsData?.activityData && statsData.activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="actividad" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actividad Total" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded">
                <BarChart3 className="w-16 h-16 text-gray-400" />
                <p className="text-gray-500 mt-2">Cargando datos de actividad...</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Activos</h3>
          <div className="h-64">
            {statsData?.userStatusData && statsData.userStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.userStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" /> {/* Activos - Verde */}
                    <Cell fill="#ef4444" /> {/* Inactivos - Rojo */}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded">
                <TrendingUp className="w-16 h-16 text-gray-400" />
                <p className="text-gray-500 mt-2">Cargando datos de usuarios...</p>
              </div>
            )}
            {statsData?.userStatusData && (
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">Activos ({statsData.userStatusData[0]?.value})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Inactivos ({statsData.userStatusData[1]?.value})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Usuarios Recientes</h3>
        </div>
        {recentLoading ? (
          <div className="text-center py-8 text-gray-500">Cargando usuarios recientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsersData.slice(0, 10).map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span key={role.id} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-1 mb-1">{role.name}</span>
                        ))
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500">Sin rol</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const renderUsers = () => {
    if (!hasUserMgmtPerm) {
      return <div className="p-6 text-center text-blue-500">No autorizado</div>;
    }
    return (
      <div className="bg-white rounded-lg shadow">
        <UserManagement token={typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''} />
      </div>
    );
  }

  const renderContent = () => (
    <div className="space-y-6">
      {/* News Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Noticias</h3>
        </div>
        <div className="p-6">
          <NewsManagement />
        </div>
      </div>
    </div>
  )

  const renderCategories = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Categorías</h3>
      </div>
      <div className="p-6">
        <CategoryManagement />
      </div>
    </div>
  )

  const renderFiles = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Archivos</h3>
      </div>
      <div className="p-6">
        <FileManagement />
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h3>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Configuración del sistema en desarrollo</p>
        </div>
      </div>
    </div>
  )

  const renderRates = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Tasas Bancarias</h3>
      </div>
      <div className="p-6">
        {/* Formulario para agregar/editar tasas */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Agregar/Editar Tasa</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
              <input
                type="text"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="Nombre del banco"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés (%)</label>
              <input
                type="number"
                step="0.01"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Ej: 8.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (meses)</label>
              <input
                type="number"
                value={newTermMonths}
                onChange={(e) => setNewTermMonths(e.target.value)}
                placeholder="Ej: 360"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={saveBankRate}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Guardar Tasa
              </button>
            </div>
          </div>
        </div>

        {/* Lista de tasas */}
        <div className="mt-10">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h4 className="text-xl font-extrabold text-blue-900 leading-tight">Tasas de Interés Vigentes</h4>
            <p className="text-gray-500 text-sm mt-1">Configuración de tasas de referencia para el cálculo de hipotecas y créditos</p>
          </div>
          {ratesLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando tasas...</div>
          ) : bankRates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay tasas configuradas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Banco
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de Interés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plazo (meses)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bankRates.map((rate) => (
                    <tr key={rate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rate.bankName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{rate.interestRate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{rate.termMonths ? `${rate.termMonths} meses` : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            setNewBankName(rate.bankName);
                            setNewRate(rate.interestRate.toString());
                            setNewTermMonths(rate.termMonths ? rate.termMonths.toString() : '');
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteBankRate(rate.id, rate.bankName)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderIndices = () => {
    const filteredIndices = filterIndicator ? economicIndices.filter(idx => idx.indicator === filterIndicator) : economicIndices;
    // Pagination logic
    const totalItems = filteredIndices.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredIndices.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    // Get page numbers to display
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      start = Math.max(1, end - maxVisible + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Índices Económicos</h3>
        </div>
        <div className="p-6">
          {/* Formulario para agregar índices */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Agregar Índice Económico</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indicador *</label>
                <select
                  value={newIndicator}
                  onChange={(e) => {
                    setNewIndicator(e.target.value);
                    setFilterIndicator(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <optgroup label="Índices Económicos">
                    <option value="ipc">IPC (Inflación)</option>
                    <option value="cacGeneral">CAC General</option>
                    <option value="cacMateriales">CAC Materiales</option>
                    <option value="cacManoObra">CAC Mano de Obra</option>
                    <option value="is">IS (Salarios)</option>
                  </optgroup>
                  <optgroup label="Cotizaciones del Dólar">
                    <option value="dolarOficialCompra">Dólar Oficial Compra</option>
                    <option value="dolarOficialVenta">Dólar Oficial Venta</option>
                    <option value="dolarBlueCompra">Dólar Blue Compra</option>
                    <option value="dolarBlueVenta">Dólar Blue Venta</option>
                    <option value="dolarTarjetaCompra">Dólar Tarjeta Compra</option>
                    <option value="dolarTarjetaVenta">Dólar Tarjeta Venta</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newIndexValue}
                  onChange={(e) => setNewIndexValue(e.target.value)}
                  placeholder="Ej: 1524.50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={newIndexDate}
                  onChange={(e) => setNewIndexDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newIndexDescription}
                  onChange={(e) => setNewIndexDescription(e.target.value)}
                  placeholder="Descripción opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={saveEconomicIndex}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Guardar Índice
              </button>
            </div>
          </div>

          {/* Lista de índices */}
          <div className="mt-10">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-8 border-b border-gray-100 pb-6">
              <div>
                <h4 className="text-xl font-extrabold text-blue-900 leading-tight">Historial de Índices Registrados</h4>
                <p className="text-gray-500 text-sm mt-1">Evolución de costos e indicadores económicos clave</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrar por Indicador</label>
                  <select
                    value={filterIndicator}
                    onChange={(e) => {
                      setFilterIndicator(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Todos los indicadores</option>
                    <optgroup label="Índices Económicos">
                      <option value="ipc">IPC (Inflación)</option>
                      <option value="cacGeneral">CAC General</option>
                      <option value="cacMateriales">CAC Materiales</option>
                      <option value="cacManoObra">CAC Mano de Obra</option>
                      <option value="is">IS (Salarios)</option>
                    </optgroup>
                    <optgroup label="Cotizaciones del Dólar">
                      <option value="dolarOficialCompra">Dólar Oficial Compra</option>
                      <option value="dolarOficialVenta">Dólar Oficial Venta</option>
                      <option value="dolarBlueCompra">Dólar Blue Compra</option>
                      <option value="dolarBlueVenta">Dólar Blue Venta</option>
                      <option value="dolarTarjetaCompra">Dólar Tarjeta Compra</option>
                      <option value="dolarTarjetaVenta">Dólar Tarjeta Venta</option>
                    </optgroup>
                  </select>
                </div>
                <div className="text-sm font-medium text-gray-400 pb-2">
                  {totalItems} total
                </div>
              </div>
            </div>
            {indicesLoading ? (
              <div className="text-center py-8 text-gray-500">Cargando índices...</div>
            ) : economicIndices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay índices registrados</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Indicador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((index) => (
                        <tr key={index.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {index.indicator === 'ipc' ? 'IPC' :
                               index.indicator === 'cacGeneral' ? 'CAC General' :
                               index.indicator === 'cacMateriales' ? 'CAC Materiales' :
                               index.indicator === 'cacManoObra' ? 'CAC Mano de Obra' :
                               index.indicator === 'is' ? 'IS' :
                               index.indicator === 'dolarOficialCompra' ? 'Dólar Oficial Compra' :
                               index.indicator === 'dolarOficialVenta' ? 'Dólar Oficial Venta' :
                               index.indicator === 'dolarBlueCompra' ? 'Dólar Blue Compra' :
                               index.indicator === 'dolarBlueVenta' ? 'Dólar Blue Venta' :
                               index.indicator === 'dolarTarjetaCompra' ? 'Dólar Tarjeta Compra' :
                               index.indicator === 'dolarTarjetaVenta' ? 'Dólar Tarjeta Venta' :
                               index.indicator}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{index.value}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{new Date(index.date).toLocaleDateString('es-AR')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{index.description || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => deleteEconomicIndex(index.id, index.indicator)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      
                      <div className="flex gap-1">
                        {getPageNumbers().map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Siguiente
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Página {currentPage} de {totalPages}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Horizontal Navigation - Lowered z-index to not cover main menu button */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          {/* Added padding-left for mobile menu button visibility */}
          <div className="pl-16 pr-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 md:p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-xl md:text-3xl font-black tracking-tight leading-none">Rialtor Admin</h1>
                <p className="text-blue-100/80 text-xs md:text-base font-medium">Gestión integral de la plataforma</p>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation - Scrollable on mobile */}
          <div className="px-4 md:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/10 py-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'users', label: 'Usuarios', icon: <Users className="w-4 h-4 md:w-5 md:h-5" />, permission: 'manage_users' },
                { id: 'content', label: 'Contenido', icon: <FileText className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'categories', label: 'Categorías', icon: <Tag className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'files', label: 'Archivos', icon: <File className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'rates', label: 'Tasas', icon: <Percent className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'indices', label: 'Índices', icon: <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4 md:w-5 md:h-5" /> },
              ].map((tab) => {
                if (tab.permission && !hasUserMgmtPerm) return null;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 md:px-5 py-3 md:py-4 text-xs md:text-sm font-bold whitespace-nowrap transition-all border-b-4 ${
                      isActive 
                        ? 'border-white text-white bg-white/10' 
                        : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="w-full">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'files' && renderFiles()}
          {activeTab === 'rates' && renderRates()}
          {activeTab === 'indices' && renderIndices()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  )
}
