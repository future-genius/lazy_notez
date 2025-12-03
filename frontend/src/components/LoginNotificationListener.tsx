import React, { useEffect, useState } from 'react'
import { io as createSocket } from 'socket.io-client'

interface LoginNotification {
  id: string
  username: string
  name: string
  timestamp: Date
}

export default function LoginNotificationListener() {
  const [notifications, setNotifications] = useState<LoginNotification[]>([])

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE || 'http://localhost:4000/api').replace(/\/api\/?$/i, '')
    const socket = createSocket(apiBase, { withCredentials: true })

    socket.on('user.login', (data: any) => {
      const notification: LoginNotification = {
        id: Math.random().toString(36),
        username: data.username,
        name: data.name,
        timestamp: new Date()
      }
      setNotifications(prev => [notification, ...prev])

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 5000)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-slideIn"
        >
          <p className="text-sm font-medium text-green-800">
            🔔 <strong>{notif.name || notif.username}</strong> just logged in
          </p>
        </div>
      ))}
    </div>
  )
}
