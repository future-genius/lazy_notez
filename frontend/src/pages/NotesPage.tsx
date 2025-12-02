import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setNotes, addNote, updateNote, removeNote } from '../store/slices/notesSlice'
import api from '../lib/api'
import { Alert, LoadingSpinner } from '../components/Common'
import { Trash2, Edit2, Plus, X } from 'lucide-react'

interface NoteType {
  _id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const NotesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const notes = useAppSelector(s => s.notes.list)
  const auth = useAppSelector(s => s.auth)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/notes')
      dispatch(setNotes(response.data.notes))
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      }

      if (editingId) {
        const response = await api.put(`/notes/${editingId}`, payload)
        dispatch(updateNote(response.data.note))
        setSuccess('Note updated successfully')
      } else {
        const response = await api.post('/notes', payload)
        dispatch(addNote(response.data.note))
        setSuccess('Note created successfully')
      }

      setFormData({ title: '', content: '', tags: '' })
      setShowForm(false)
      setEditingId(null)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (note: NoteType) => {
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
    })
    setEditingId(note._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return

    try {
      await api.delete(`/notes/${id}`)
      dispatch(removeNote(id))
      setSuccess('Note deleted successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note')
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', content: '', tags: '' })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Notes</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={20} /> New Note
            </button>
          )}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Note' : 'Create New Note'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Note title"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Write your note..."
                  rows={6}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Separate tags with commas (e.g., math, chapter-5)"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save Note'}
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

        {loading ? (
          <LoadingSpinner />
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No notes yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
              <div key={note._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{note.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{note.content}</p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
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

export default NotesPage
