import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Bell, FileText, LogOut, Menu, MessageSquare, Plus, RefreshCw, Search, Settings, Trash2, Upload, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Feedback from './Feedback';
import { authorizedFetch, clearStoredAuth, getAccessToken } from '../utils/authSession';

type AdminTab = 'dashboard' | 'users' | 'resources' | 'communities' | 'feedback' | 'settings';

interface AdminDashboardProps {
  initialTab?: AdminTab;
}

type AdminUser = {
  _id: string;
  userId?: string;
  name: string;
  username: string;
  email: string;
  loginMethod?: 'google' | 'manual';
  role: 'super_admin' | 'admin' | 'faculty' | 'student' | 'user';
  status: 'active' | 'inactive';
  lastLogin?: string;
  registrationDate?: string;
  department?: string;
};

type Resource = {
  _id: string;
  department: string;
  semester: string;
  subject: string;
  title: string;
  googleDriveUrl: string;
  uploadedByName: string;
  downloadCount: number;
};

const API_BASE = (window as any).__API_BASE__ || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

const isAuthenticatedAdmin = () => {
  if (localStorage.getItem('lazyNotezAdmin') !== 'true') return false;
  const raw = localStorage.getItem('currentUser');
  if (!raw) return false;
  try {
    const user = JSON.parse(raw);
    return user?.role === 'admin' || user?.role === 'super_admin';
  } catch {
    return false;
  }
};

export default function AdminDashboard({ initialTab = 'dashboard' }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    department: '',
    semester: '',
    subject: '',
    title: '',
    googleDriveUrl: '',
    uploadedByName: ''
  });

  const authHeaders = useMemo(() => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [isAuthChecked]);

  const loadUsers = async () => {
    const res = await authorizedFetch(`${API_BASE}/users`, { headers: authHeaders });
    if (!res.ok) throw new Error('Unable to load users');
    const data = await res.json();
    setUsers(data.users || []);
  };

  const loadResources = async () => {
    const res = await fetch(`${API_BASE}/resources?limit=200&sortBy=recent`);
    if (!res.ok) throw new Error('Unable to load resources');
    const data = await res.json();
    setResources(data.resources || []);
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await authorizedFetch(`${API_BASE}/admin/stats`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => setActiveTab(initialTab), [initialTab]);

  useEffect(() => {
    if (!isAuthenticatedAdmin()) {
      navigate('/auth', { replace: true });
      return;
    }

    setIsAuthChecked(true);
    loadUsers().catch(() => {});
    loadResources().catch(() => {});
    loadStats().catch(() => {});
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authorizedFetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders
      });
    } catch {}
    clearStoredAuth();
    navigate('/', { replace: true });
  };

  const handleResyncUsers = async () => {
    await authorizedFetch(`${API_BASE}/admin/resync-users`, {
      method: 'POST',
      headers: authHeaders
    });
    await Promise.all([loadUsers(), loadStats()]);
  };

  const handleUserUpdate = async (userId: string, updates: Partial<AdminUser>) => {
    const res = await authorizedFetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.message || 'Failed to update user');
      return;
    }
    await Promise.all([loadUsers(), loadStats()]);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    const res = await authorizedFetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.message || 'Failed to delete user');
      return;
    }
    await Promise.all([loadUsers(), loadStats()]);
  };

  const handleCreateResource = async () => {
    if (!resourceForm.department || !resourceForm.semester || !resourceForm.subject || !resourceForm.title || !resourceForm.googleDriveUrl) {
      alert('Please fill all required resource fields');
      return;
    }
    const current = localStorage.getItem('currentUser');
    const currentUser = current ? JSON.parse(current) : null;
    const payload = {
      ...resourceForm,
      uploadedByName: resourceForm.uploadedByName || currentUser?.name || 'Admin'
    };
    const res = await authorizedFetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.message || 'Failed to upload resource');
      return;
    }
    setResourceForm({
      department: '',
      semester: '',
      subject: '',
      title: '',
      googleDriveUrl: '',
      uploadedByName: ''
    });
    await Promise.all([loadResources(), loadStats()]);
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;
    const res = await authorizedFetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.message || 'Failed to delete resource');
      return;
    }
    await Promise.all([loadResources(), loadStats()]);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Verifying credentials...</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'communities', label: 'Communities', icon: MessageSquare },
    { id: 'feedback', label: 'Feedback', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <DashboardTab
          users={users}
          stats={stats}
          loading={loadingStats}
          onRefresh={async () => {
            await Promise.all([loadStats(), loadUsers(), loadResources()]);
          }}
        />
      );
    }

    if (activeTab === 'users') {
      return (
        <UsersTab
          users={filteredUsers}
          onPromote={(id) => handleUserUpdate(id, { role: 'admin' })}
          onDisable={(id) => handleUserUpdate(id, { status: 'inactive' })}
          onEnable={(id) => handleUserUpdate(id, { status: 'active' })}
          onDelete={handleDeleteUser}
        />
      );
    }

    if (activeTab === 'resources') {
      return (
        <ResourcesTab
          form={resourceForm}
          setForm={setResourceForm}
          resources={resources}
          onCreate={handleCreateResource}
          onDelete={handleDeleteResource}
        />
      );
    }

    if (activeTab === 'feedback') return <Feedback />;
    if (activeTab === 'communities') return <CommunitiesTab />;
    return <SettingsTab />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-black/40 border-r border-white/10 backdrop-blur-md flex flex-col fixed h-screen z-40`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  navigate(`/admin/${item.id === 'dashboard' ? 'dashboard' : item.id}`, { replace: true });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 transition font-medium">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-20 md:ml-64 flex flex-col overflow-hidden">
        <header className="h-20 bg-black/30 border-b border-white/10 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
            />
          </div>

          <button
            onClick={handleResyncUsers}
            title="Resync users from database"
            className="relative p-2 hover:bg-white/10 rounded-lg transition"
          >
            <RefreshCw size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function DashboardTab({ users, stats, loading, onRefresh }: { users: AdminUser[]; stats: any; loading: boolean; onRefresh: () => void; }) {
  const fallbackTotalUsers = users.length;
  const fallbackActiveUsers = users.filter((u) => u.status === 'active').length;
  const fallbackAdmins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? fallbackTotalUsers, className: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
    { label: 'Active Users', value: stats?.activeUsers ?? fallbackActiveUsers, className: 'from-green-500/20 to-green-600/10 border-green-500/30' },
    { label: 'Admin Users', value: stats?.adminCount ?? fallbackAdmins, className: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
    { label: 'Total Downloads', value: stats?.totalDownloads ?? 0, className: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
    { label: 'Resources', value: stats?.totalResources ?? 0, className: 'from-teal-500/20 to-teal-600/10 border-teal-500/30' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-2">System activity and admin monitoring overview</p>
        </div>
        <button onClick={onRefresh} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">Refresh</button>
      </div>

      {loading && <p className="text-gray-400">Loading analytics...</p>}

      <div className="grid md:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.label} className={`p-6 rounded-2xl bg-gradient-to-br border backdrop-blur-sm ${card.className}`}>
            <p className="text-gray-300 text-sm font-semibold">{card.label}</p>
            <p className="text-4xl font-bold mt-3">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-4">Recent Logins</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-white/10">
                <th className="py-2">User</th>
                <th className="py-2">Email</th>
                <th className="py-2">Method</th>
                <th className="py-2">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentLogins || []).map((entry: any, i: number) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2">{entry?.user?.name || entry?.user?.username || 'Unknown'}</td>
                  <td className="py-2">{entry?.user?.email || 'N/A'}</td>
                  <td className="py-2 capitalize">{entry?.meta?.loginMethod || 'manual'}</td>
                  <td className="py-2">{new Date(entry?.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab({
  users,
  onPromote,
  onDisable,
  onEnable,
  onDelete
}: {
  users: AdminUser[];
  onPromote: (id: string) => void;
  onDisable: (id: string) => void;
  onEnable: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">User Management</h1>
        <p className="text-gray-400 mt-2">Manage roles, status, and account access.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-sm bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-4 text-left font-bold text-gray-200">Name</th>
              <th className="px-4 py-4 text-left font-bold text-gray-200">Email</th>
              <th className="px-4 py-4 text-left font-bold text-gray-200">Method</th>
              <th className="px-4 py-4 text-left font-bold text-gray-200">Role</th>
              <th className="px-4 py-4 text-left font-bold text-gray-200">Last Login</th>
              <th className="px-4 py-4 text-left font-bold text-gray-200">Status</th>
              <th className="px-4 py-4 text-left font-bold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-white/5 hover:bg-white/10 transition">
                <td className="px-4 py-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </td>
                <td className="px-4 py-4 text-gray-300">{user.email}</td>
                <td className="px-4 py-4 capitalize">{user.loginMethod || 'manual'}</td>
                <td className="px-4 py-4 capitalize">{user.role}</td>
                <td className="px-4 py-4 text-gray-300">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                <td className="px-4 py-4 capitalize">{user.status}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {user.role !== 'admin' && user.role !== 'super_admin' && (
                      <button onClick={() => onPromote(user._id)} className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition">
                        Promote
                      </button>
                    )}
                    {user.status === 'active' ? (
                      <button onClick={() => onDisable(user._id)} className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition">
                        Disable
                      </button>
                    ) : (
                      <button onClick={() => onEnable(user._id)} className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-300 hover:bg-green-500/30 transition">
                        Enable
                      </button>
                    )}
                    <button onClick={() => onDelete(user._id)} className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResourcesTab({
  form,
  setForm,
  resources,
  onCreate,
  onDelete
}: {
  form: any;
  setForm: (next: any) => void;
  resources: Resource[];
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Resource Management</h1>
        <p className="text-gray-400 mt-2">Upload and manage resources by department, semester, and subject.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload size={20} /> Upload Resource</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <input className="bg-white/5 border border-white/10 rounded px-4 py-2" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded px-4 py-2" placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded px-4 py-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded px-4 py-2" placeholder="Resource Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded px-4 py-2" placeholder="Google Drive URL" value={form.googleDriveUrl} onChange={(e) => setForm({ ...form, googleDriveUrl: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded px-4 py-2" placeholder="Uploaded By" value={form.uploadedByName} onChange={(e) => setForm({ ...form, uploadedByName: e.target.value })} />
        </div>
        <button onClick={onCreate} className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg transition font-semibold flex items-center gap-2">
          <Plus size={18} /> Submit Resource
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-sm bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-4 text-left">Title</th>
              <th className="px-4 py-4 text-left">Department</th>
              <th className="px-4 py-4 text-left">Semester</th>
              <th className="px-4 py-4 text-left">Subject</th>
              <th className="px-4 py-4 text-left">Downloads</th>
              <th className="px-4 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource._id} className="border-b border-white/5 hover:bg-white/10 transition">
                <td className="px-4 py-4">{resource.title}</td>
                <td className="px-4 py-4">{resource.department}</td>
                <td className="px-4 py-4">{resource.semester}</td>
                <td className="px-4 py-4">{resource.subject}</td>
                <td className="px-4 py-4">{resource.downloadCount || 0}</td>
                <td className="px-4 py-4">
                  <button onClick={() => onDelete(resource._id)} className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center gap-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommunitiesTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Communities Manager</h1>
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400">Community management remains available in existing modules.</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">System Settings</h1>
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <p className="text-gray-300">Security controls are active: protected admin routes, token-verified APIs, role-based access, and logout hardening.</p>
      </div>
    </div>
  );
}
