import React from 'react'
import { useAppSelector } from '../store/hooks'
import { useNavigate } from 'react-router-dom'
import { FileText, BookOpen, Users, BarChart3 } from 'lucide-react'

const Dashboard: React.FC = () => {
  const auth = useAppSelector(s => s.auth)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {auth.user?.name}! 👋</h1>
          <p className="text-gray-600">Role: <span className="font-semibold capitalize">{auth.user?.role}</span></p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/notes')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex flex-col items-center gap-3 group"
          >
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">My Notes</h3>
              <p className="text-sm text-gray-600">Create & manage notes</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/resources')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex flex-col items-center gap-3 group"
          >
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition">
              <BookOpen className="text-green-600" size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">Resources</h3>
              <p className="text-sm text-gray-600">Study materials</p>
            </div>
          </button>

          {auth.user?.role === 'admin' && (
            <>
              <button
                onClick={() => navigate('/admin')}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex flex-col items-center gap-3 group"
              >
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-600">Manage users</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin')}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex flex-col items-center gap-3 group"
              >
                <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition">
                  <BarChart3 className="text-orange-600" size={24} />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Activity logs</p>
                </div>
              </button>
            </>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Get Started!</h2>
          <p className="mb-4">Here's what you can do on LazyNotez:</p>
          <ul className="space-y-2">
            <li>✓ Create and organize your study notes</li>
            <li>✓ Access shared learning resources</li>
            {auth.user?.role === 'faculty' && <li>✓ Upload and manage study materials</li>}
            {auth.user?.role === 'admin' && <li>✓ Manage users and system settings</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
