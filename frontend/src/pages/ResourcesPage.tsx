import React, { useState, useEffect } from 'react'
import { useAppSelector } from '../store/hooks'
import api from '../lib/api'
import { Alert, LoadingSpinner } from '../components/Common'
import { Trash2, Edit2, Plus, ExternalLink } from 'lucide-react'

interface ResourceType {
  _id: string
  title: string
  description: string
  url: string
  uploadedBy: { name: string }
  tags: string[]
  createdAt: string
}

const ResourcesPage: React.FC = () => {
  const auth = useAppSelector(s => s.auth)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resources, setResources] = useState<ResourceType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTag, setSearchTag] = useState('')
  
  const [formData, setFormData] = useState({ title: '', description: '', url: '', tags: '' })
  const [submitting, setSubmitting] = useState(false)

  const canCreate = auth.user?.role === 'faculty' || auth.user?.role === 'admin'

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await api.get('/resources')
      setResources(response.data.resources)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.url.trim()) {
      setError('Title and URL are required')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      }

      if (editingId) {
        const response = await api.put(`/resources/${editingId}`, payload)
        setResources(resources.map(r => r._id === editingId ? response.data.resource : r))
        setSuccess('Resource updated successfully')
      } else {
        const response = await api.post('/resources', payload)
        setResources([...resources, response.data.resource])
        setSuccess('Resource created successfully')
      }

      setFormData({ title: '', description: '', url: '', tags: '' })
      setShowForm(false)
      setEditingId(null)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save resource')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (resource: ResourceType) => {
    setFormData({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      tags: resource.tags.join(', '),
    })
    setEditingId(resource._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource? This cannot be undone.')) return

    try {
      await api.delete(`/resources/${id}`)
      setResources(resources.filter(r => r._id !== id))
      setSuccess('Resource deleted successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete resource')
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', description: '', url: '', tags: '' })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const filteredResources = searchTag
    ? resources.filter(r => r.tags.some(t => t.toLowerCase().includes(searchTag.toLowerCase())))
    : resources

  const allTags = Array.from(new Set(resources.flatMap(r => r.tags)))

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Learning Resources</h1>
          {canCreate && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={20} /> Upload Resource
            </button>
          )}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Resource' : 'Upload New Resource'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Resource title"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Describe this resource..."
                  rows={3}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/resource"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Separate tags with commas (e.g., mathematics, calculus)"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save Resource'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {allTags.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Filter by tag:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchTag('')}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  searchTag === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchTag(tag)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    searchTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              {searchTag ? 'No resources with this tag' : 'No resources available yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map(resource => (
              <div key={resource._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex-1 line-clamp-2">{resource.description}</p>
                  
                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.map(tag => (
                        <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mb-3">
                    By {resource.uploadedBy.name} • {new Date(resource.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                    >
                      <ExternalLink size={16} /> Open
                    </a>
                    {(auth.user?.role === 'admin' || auth.user?._id === (resource.uploadedBy as any)._id) && (
                      <>
                        <button
                          onClick={() => handleEdit(resource)}
                          className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(resource._id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
