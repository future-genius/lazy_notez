import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, MessageSquare, Settings, LogOut, Bell, Search, Menu, Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  password: string;
  college?: string;
  department?: string;
  univRegNo?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminUser>>({});

  useEffect(() => {
    loadUsers();
    // verify currentUser is admin; if not, redirect. This avoids showing incorrect UI on back navigation.
    const currentUserRaw = localStorage.getItem('currentUser');
    if (!currentUserRaw) {
      navigate('/');
      return;
    }
    try {
      const cu = JSON.parse(currentUserRaw);
      if (!cu || cu.role !== 'admin') {
        navigate('/');
        return;
      }
      setIsAuthChecked(true);
    } catch (e) {
      localStorage.removeItem('currentUser');
      navigate('/');
      return;
    }
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Verifying credentials...</div>
      </div>
    );
  }

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ role: 'user', status: 'active' });
    setShowForm(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData(user);
    setShowForm(true);
  };

  const handleSaveUser = () => {
    if (!formData.username || !formData.password || !formData.name) {
      alert('Please fill all required fields');
      return;
    }

    let updatedUsers = [...users];
    if (editingUser) {
      updatedUsers = updatedUsers.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
    } else {
      const newUser: AdminUser = {
        id: Date.now().toString(),
        ...formData as AdminUser,
        createdAt: new Date().toISOString(),
      };
      updatedUsers.push(newUser);
    }
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
    setShowForm(false);
    setFormData({});
    alert('User saved successfully!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      loadUsers();
      alert('User deleted successfully!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'communities', label: 'Communities', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab users={users} />;
      case 'users':
        return (
          <UsersTab 
            users={users} 
            searchQuery={searchQuery}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            showForm={showForm}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveUser}
            onCancel={() => { setShowForm(false); setFormData({}); }}
          />
        );
      case 'resources':
        return <ResourcesTab />;
      case 'communities':
        return <CommunitiesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-black/40 border-r border-white/10 backdrop-blur-md flex flex-col fixed h-screen`}>
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
                onClick={() => setActiveTab(item.id)}
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

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-black/30 border-b border-white/10 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {}}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-white/10 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-sm">
                <p className="font-semibold">Admin User</p>
                <p className="text-gray-400 text-xs">Super Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function DashboardTab({ users }: { users: AdminUser[] }) {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to the Lazy Notez Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-semibold">Total Users</p>
              <p className="text-4xl font-bold mt-3">{totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-semibold">Active Users</p>
              <p className="text-4xl font-bold mt-3">{activeUsers}</p>
            </div>
            <Eye className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-semibold">Administrators</p>
              <p className="text-4xl font-bold mt-3">{adminUsers}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-semibold">Regular Users</p>
              <p className="text-4xl font-bold mt-3">{regularUsers}</p>
            </div>
            <Users className="w-12 h-12 text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-gray-300">Database</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">Operational</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-gray-300">Authentication</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Storage</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">Operational</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4">Admin Credentials</h3>
          <div className="space-y-3 bg-black/30 p-4 rounded-lg">
            <div>
              <p className="text-gray-400 text-sm">Username:</p>
              <p className="font-mono text-lg text-primary-400">admin</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Password:</p>
              <p className="font-mono text-lg text-primary-400">admin123</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">Keep these credentials secure. Change password in settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UsersTabProps {
  users: AdminUser[];
  searchQuery: string;
  onAddUser: () => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (id: string) => void;
  showForm: boolean;
  formData: Partial<AdminUser>;
  setFormData: (data: Partial<AdminUser>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function UsersTab({ users, searchQuery, onAddUser, onEditUser, onDeleteUser, showForm, formData, setFormData, onSave, onCancel }: UsersTabProps) {
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">User Management</h1>
          <p className="text-gray-400 mt-2">Total Users: {users.length}</p>
        </div>
        <button onClick={onAddUser} className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg transition font-semibold flex items-center gap-2">
          <Plus size={20} /> Add New User
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6">{formData.id ? 'Edit User' : 'Create New User'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 font-semibold">Full Name *</label>
              <input type="text" placeholder="Enter full name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Username *</label>
              <input type="text" placeholder="Enter username" value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Password *</label>
              <input type="password" placeholder="Enter password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Email</label>
              <input type="email" placeholder="Enter email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">College</label>
              <input type="text" placeholder="Enter college name" value={formData.college || ''} onChange={(e) => setFormData({ ...formData, college: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Univ Reg No</label>
              <input type="text" placeholder="e.g., REG123456" value={formData.univRegNo || ''} onChange={(e) => setFormData({ ...formData, univRegNo: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Department</label>
              <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500">
                <option value="">Select Department</option>
                <option value="Agricultural Engineering">Agricultural Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                <option value="Electronics and Instrumentation Engineering">Electronics and Instrumentation Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Medical Electronics">Medical Electronics</option>
                <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                <option value="Structural Engineering">Structural Engineering</option>
                <option value="Communication Systems">Communication Systems</option>
                <option value="Power Systems Engineering">Power Systems Engineering</option>
                <option value="Control and Instrumentation Engineering">Control and Instrumentation Engineering</option>
                <option value="Industrial Safety Engineering">Industrial Safety Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Computer Applications">Computer Applications</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Role</label>
              <select value={formData.role || 'user'} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Status</label>
              <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })} className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={onSave} className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition font-semibold">Save User</button>
            <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-sm bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-left font-bold text-gray-200">Name</th>
              <th className="px-6 py-4 text-left font-bold text-gray-200">Username</th>
              <th className="px-6 py-4 text-left font-bold text-gray-200">Email</th>
              <th className="px-6 py-4 text-left font-bold text-gray-200">Department</th>
              <th className="px-6 py-4 text-left font-bold text-gray-200">Role</th>
              <th className="px-6 py-4 text-left font-bold text-gray-200">Status</th>
              <th className="px-6 py-4 text-left font-bold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/10 transition">
                <td className="px-6 py-4 font-semibold">{user.name}</td>
                <td className="px-6 py-4 text-gray-400">{user.username}</td>
                <td className="px-6 py-4 text-gray-400">{user.email || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-400">{user.department || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => onEditUser(user)} className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition flex items-center gap-1">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => onDeleteUser(user.id)} className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center gap-1">
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

function ResourcesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Resources Manager</h1>
        <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg transition font-semibold flex items-center gap-2">
          <Plus size={20} /> Upload Resource
        </button>
      </div>

      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400">No resources uploaded yet</p>
      </div>
    </div>
  );
}

function CommunitiesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Communities Manager</h1>
        <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg transition font-semibold flex items-center gap-2">
          <Plus size={20} /> Add Community
        </button>
      </div>

      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400">No communities created yet</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">System Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 font-semibold">Platform Name</label>
              <input type="text" defaultValue="Lazy Notez" className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Support Email</label>
              <input type="email" defaultValue="support@lazynotez.com" className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Max File Upload Size (MB)</label>
              <input type="number" defaultValue="50" className="w-full mt-2 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <p className="font-semibold">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Enable 2FA for admin accounts</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <p className="font-semibold">Session Timeout</p>
                <p className="text-sm text-gray-400">Auto logout after inactivity</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none">
                <option>30 min</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg transition font-semibold">
        Save Settings
      </button>
    </div>
  );
}
