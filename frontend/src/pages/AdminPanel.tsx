import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAppSelector } from '../store/hooks'
import { Alert, LoadingSpinner } from '../components/Common'
import { Trash2, Shield, Activity, FileText } from 'lucide-react'
import { io as createSocket } from 'socket.io-client'

interface User {
  _id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'faculty' | 'student' | 'user'
  status: 'active' | 'inactive'
  createdAt: string
}

interface ActivityLog {
  _id: string
  user: { name: string }
  action: string
  ip: string
  createdAt: string
}

interface SystemStats {
  totalUsers: number
  totalNotes: number
  totalResources: number
  recentActivity: number
}

const AdminPanel: React.FC = () => {
  const auth = useAppSelector(s => s.auth)

  // Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'logs' | 'about'>('dashboard')

  // Data states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [aboutContent, setAboutContent] = useState({ title: '', content: '' })
  
  const [editingAbout, setEditingAbout] = useState(false)
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null)
  const [editingRoleValue, setEditingRoleValue] = useState<'admin' | 'faculty' | 'student' | 'user'>('user')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  // Real-time updates: listen for newly created users
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE || 'http://localhost:4000/api').replace(/\/api\/?$/i, '')
    const socket = createSocket(apiBase, { withCredentials: true })

    socket.on('connect', () => {
      // console.log('Admin socket connected', socket.id)
    })

    socket.on('user.created', (newUser: any) => {
      // Prepend the user to the list and notify admin
      setUsers(prev => [newUser, ...prev])
      setSuccess('New user registered')
    })

    socket.on('disconnect', () => {
      // console.log('Admin socket disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes, logsRes, aboutRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/users'),
        api.get('/admin/activity'),
        api.get('/admin/about'),
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data.users)
      setLogs(logsRes.data.logs)
      setAboutContent(aboutRes.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return

    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter(u => u._id !== userId))
      setSuccess('User deleted successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleUpdateRole = async (userId: string) => {
    try {
      setSubmitting(true)
      const res = await api.put(`/users/${userId}`, { role: editingRoleValue })
      setUsers(users.map(u => u._id === userId ? res.data : u))
      setEditingRoleUserId(null)
      setSuccess('User role updated successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateAbout = async () => {
    if (!aboutContent.title.trim() || !aboutContent.content.trim()) {
      setError('Title and content are required')
      return
    }

    try {
      setSubmitting(true)
      await api.put('/admin/about', aboutContent)
      setEditingAbout(false)
      setSuccess('About page updated successfully')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update about page')
    } finally {
      setSubmitting(false)
    }
  }

  if (!auth.user || auth.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message="Access denied. Admin panel is only for administrators." onClose={() => {}} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === 'logs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity Logs
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              About Page
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <Shield className="text-blue-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Notes</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalNotes}</p>
                    </div>
                    <FileText className="text-green-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Resources</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
                    </div>
                    <FileText className="text-purple-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Recent Activity</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.recentActivity}</p>
                    </div>
                    <Activity className="text-orange-500" size={32} />
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">Users</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchAllData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Name</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Username</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Email</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Role</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Joined</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">{user.name}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{user.username}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-3 text-sm">
                            {editingRoleUserId === user._id ? (
                              <div className="flex gap-1">
                                <select
                                  value={editingRoleValue}
                                  onChange={e => setEditingRoleValue(e.target.value as 'admin' | 'faculty' | 'student' | 'user')}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={submitting}
                                >
                                  <option value="student">Student</option>
                                  <option value="faculty">Faculty</option>
                                  <option value="admin">Admin</option>
                                  <option value="user">User</option>
                                </select>
                                <button
                                  onClick={() => handleUpdateRole(user._id)}
                                  disabled={submitting}
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition disabled:bg-gray-400"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingRoleUserId(null)}
                                  disabled={submitting}
                                  className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400 transition disabled:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                  {user.role}
                                </span>
                                {user._id !== auth.user?._id && (
                                  <button
                                    onClick={() => {
                                      setEditingRoleUserId(user._id)
                                      setEditingRoleValue(user.role)
                                    }}
                                    className="text-blue-600 hover:text-blue-900 text-xs underline"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-sm">
                            {user._id !== auth.user?._id && (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.username)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Timestamp</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">User</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Action</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900">{log.user.name}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* About Page Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                {editingAbout ? (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={aboutContent.title}
                        onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        value={aboutContent.content}
                        onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={8}
                        disabled={submitting}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={handleUpdateAbout}
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
                      >
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAbout(false)}
                        disabled={submitting}
                        className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4">{aboutContent.title}</h2>
                    <p className="text-gray-600 whitespace-pre-wrap mb-6">{aboutContent.content}</p>
                    <button
                      onClick={() => setEditingAbout(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Edit About Page
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
