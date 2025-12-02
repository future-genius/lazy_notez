import axios from 'axios'
import { store } from '../store'
import { setCredentials, clearCredentials } from '../store/slices/authSlice'

const api = axios.create({
  baseURL: process.env.VITE_API_BASE || 'http://localhost:4000/api',
  withCredentials: true
})

let isRefreshing = false
let pendingRequests: ((token: string) => void)[] = []

api.interceptors.request.use(config => {
  const state = store.getState() as any
  const token = state.auth.accessToken
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }
      isRefreshing = true
      try {
        const r = await axios.post(`${process.env.VITE_API_BASE || 'http://localhost:4000/api'}/auth/refresh`, {}, { withCredentials: true })
        const accessToken = r.data.accessToken
        store.dispatch(setCredentials({ accessToken, user: store.getState().auth.user }))
        pendingRequests.forEach(cb => cb(accessToken))
        pendingRequests = []
        return api(original)
      } catch (e) {
        store.dispatch(clearCredentials())
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
