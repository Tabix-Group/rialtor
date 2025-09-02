'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, MessageSquare, Settings, TrendingUp, BarChart3, Shield } from 'lucide-react'
import UserManagement from '../../components/UserManagement'
import { authenticatedFetch } from '../../utils/api'

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
  const [statsData, setStatsData] = useState<{ totalUsers: number; publishedArticles: number; chatQueries: number; documentsUploaded: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [documentsCount, setDocumentsCount] = useState<number | null>(null);
  // Recent users state
  const [recentUsersData, setRecentUsersData] = useState<{ id: string; name: string; email: string; roles: { id: string; name: string }[]; isActive: boolean }[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Verificar permisos solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      setHasAdminPerm(checkPermission(user, 'view_admin'));
      setHasUserMgmtPerm(checkPermission(user, 'manage_users'));
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

  // Mostrar loading mientras se verifica la autenticación
  if (loading || permsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
              <div className="text-red-600">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Mensual</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <BarChart3 className="w-16 h-16 text-gray-400" />
            <p className="text-gray-500 ml-4">Gráfico de actividad mensual</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Activos</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <TrendingUp className="w-16 h-16 text-gray-400" />
            <p className="text-gray-500 ml-4">Gráfico de usuarios activos</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsersData.map((user) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-red-600 hover:text-red-900">Editar</button>
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
      return <div className="p-6 text-center text-red-500">No autorizado</div>;
    }
    return (
      <div className="bg-white rounded-lg shadow">
        <UserManagement token={typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''} />
      </div>
    );
  }

  const renderContent = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Contenido</h3>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Funcionalidad de gestión de contenido en desarrollo</p>
        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-5">
          <span className="inline-flex items-center justify-center bg-white/20 rounded-full p-3 shadow">
            <Shield className="w-10 h-10 text-white/90" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Panel de Administración</h1>
            <p className="text-red-100 text-lg">Gestión y control de la plataforma Rialtor</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <div className="lg:w-72">
            <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-6 sticky top-8">
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-lg text-left font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-red-100 text-red-700 shadow' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <BarChart3 className="w-6 h-6" />
                  Dashboard
                </button>
                {hasUserMgmtPerm && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-lg text-left font-semibold transition-all ${activeTab === 'users' ? 'bg-red-100 text-red-700 shadow' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Users className="w-6 h-6" />
                    Usuarios
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('content')}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-lg text-left font-semibold transition-all ${activeTab === 'content' ? 'bg-red-100 text-red-700 shadow' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <FileText className="w-6 h-6" />
                  Contenido
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-lg text-left font-semibold transition-all ${activeTab === 'settings' ? 'bg-red-100 text-red-700 shadow' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Settings className="w-6 h-6" />
                  Configuración
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'content' && renderContent()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  )
}
