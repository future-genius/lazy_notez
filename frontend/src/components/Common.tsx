import React from 'react'
import { X } from 'lucide-react'

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

export const Alert: React.FC<{ type: 'success' | 'error' | 'warning'; message: string; onClose?: () => void }> = ({ type, message, onClose }) => {
  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  }
  return (
    <div className={`p-4 border rounded-lg ${colors[type]} flex justify-between items-start mb-4`}>
      <p>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-75"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
