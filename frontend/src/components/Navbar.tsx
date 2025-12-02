import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearCredentials } from '../store/slices/authSlice'
import api from '../lib/api'
import { Menu, X } from 'lucide-react'

const Navbar: React.FC = () => {
  const auth = useAppSelector(s => s.auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error(err)
    }
    dispatch(clearCredentials())
    navigate('/login')
  }

  if (!auth.accessToken) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">LazyNotez</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Register
            </button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">LazyNotez</h1>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/notes')}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Notes
            </button>
            <button
              onClick={() => navigate('/resources')}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Resources
            </button>
            {auth.user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Admin
              </button>
            )}
            <div className="flex items-center space-x-3 pl-6 border-l">
              <span className="text-sm text-gray-600">{auth.user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <button
              onClick={() => {
                navigate('/dashboard')
                setMobileOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate('/notes')
                setMobileOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
            >
              Notes
            </button>
            <button
              onClick={() => {
                navigate('/resources')
                setMobileOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
            >
              Resources
            </button>
            {auth.user?.role === 'admin' && (
              <button
                onClick={() => {
                  navigate('/admin')
                  setMobileOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
