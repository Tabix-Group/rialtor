'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, MessageSquare, Settings, TrendingUp, BarChart3, UserPlus, Shield } from 'lucide-react'
import UserManagement from '../../components/UserManagement'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ReactNode
}

import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'


export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: si no está logueado, redirigir a login
  // Solo ejecutar en el cliente y evitar doble render
  if (typeof window !== 'undefined' && !loading && !user) {
    router.replace('/auth/login');
    return null;
  }

  const [activeTab, setActiveTab] = useState('dashboard')
  // Dashboard stats
  const [statsData, setStatsData] = useState<{ totalUsers: number; publishedArticles: number; chatQueries: number; documentsUploaded: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  // Fetch dashboard stats
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    setStatsLoading(true);
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setStatsData(data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
  }, []);

  // Recent users state
  const [recentUsersData, setRecentUsersData] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  useEffect(() => {
    const fetchRecentUsers = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      setRecentLoading(true);
      try {
        const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
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

  // Prepare stats cards
  const stats: StatCard[] = statsLoading || !statsData
    ? []
    : [
        { title: 'Total Usuarios', value: statsData.totalUsers.toString(), change: '', changeType: 'increase', icon: <Users className="w-6 h-6" /> },
        { title: 'Artículos Publicados', value: statsData.publishedArticles.toString(), change: '', changeType: 'increase', icon: <FileText className="w-6 h-6" /> },
        { title: 'Consultas Chat', value: statsData.chatQueries.toString(), change: '', changeType: 'increase', icon: <MessageSquare className="w-6 h-6" /> },
        { title: 'Documentos Subidos', value: statsData.documentsUploaded.toString(), change: '', changeType: 'increase', icon: <FileText className="w-6 h-6" /> }
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
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
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
                {recentUsersData.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{user.role}</span>
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
    if (user?.role !== 'ADMIN') {
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-red-100">Gestión y control de la plataforma RE/MAX</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow p-4">
              {/* Sidebar navigation: hide Users tab for non-admins */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </button>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'users' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    Usuarios
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('content')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'content' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Contenido
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'settings' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
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
