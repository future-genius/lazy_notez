import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminFeedbacks, setAdminFeedbacks] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const currentUserRaw = localStorage.getItem('currentUser');
    try {
      const cu = JSON.parse(currentUserRaw || 'null');
      setIsAdmin(cu && cu.role === 'admin');
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);

  // Load feedbacks if admin
  useEffect(() => {
    if (isAdmin) {
      loadFeedbacks();
    }
  }, [isAdmin]);

  const loadFeedbacks = async () => {
    const currentUserRaw = localStorage.getItem('currentUser');
    let cu: any = null;
    try { cu = JSON.parse(currentUserRaw || 'null'); } catch (e) { cu = null }

    if (!cu || !cu.accessToken) {
      // fallback to localStorage
      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      setAdminFeedbacks(feedbacks);
      return;
    }

    setAdminLoading(true);
    const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api';
    try {
      const res = await fetch(`${API_BASE}/admin/feedback`, {
        headers: { Authorization: `Bearer ${cu.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminFeedbacks(data.feedbacks || []);
      } else {
        // fallback to localStorage
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        setAdminFeedbacks(feedbacks);
      }
    } catch (err) {
      // fallback to localStorage
      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      setAdminFeedbacks(feedbacks);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Delete this feedback?')) return;

    const currentUserRaw = localStorage.getItem('currentUser');
    let cu: any = null;
    try { cu = JSON.parse(currentUserRaw || 'null'); } catch (e) { cu = null }

    if (!cu || !cu.accessToken) {
      // Remove from localStorage
      const feedbacks = adminFeedbacks.filter(f => f.id !== feedbackId);
      setAdminFeedbacks(feedbacks);
      localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
      return;
    }

    const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api';
    try {
      const res = await fetch(`${API_BASE}/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${cu.accessToken}` }
      });
      if (res.ok) {
        setAdminFeedbacks(adminFeedbacks.filter(f => f._id !== feedbackId));
        alert('Feedback deleted');
      } else {
        alert('Failed to delete feedback');
      }
    } catch (err) {
      alert('Error deleting feedback');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter feedback message');
      return;
    }

    setLoading(true);
    const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api';
    const currentUserRaw = localStorage.getItem('currentUser');
    let cu: any = null;
    try { cu = JSON.parse(currentUserRaw || 'null'); } catch (e) { cu = null }

    // Try backend first if user has accessToken
    if (cu && cu.accessToken) {
      fetch(`${API_BASE}/admin/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cu.accessToken}` },
        body: JSON.stringify({ name, email, message })
      }).then(async res => {
        if (res.ok) {
          setName('');
          setEmail('');
          setMessage('');
          setSuccess('Thanks — your feedback was submitted');
          if (isAdmin) loadFeedbacks();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const err = await res.json().catch(() => null);
          alert(err?.message || 'Failed to submit feedback');
        }
      }).catch(() => {
        // fallback to local storage
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        feedbacks.push({ id: Date.now().toString(), name, email, message, createdAt: new Date().toISOString() });
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
        setName('');
        setEmail('');
        setMessage('');
        setSuccess('Thanks — your feedback was submitted (offline)');
        if (isAdmin) {
          setAdminFeedbacks(feedbacks);
        }
        setTimeout(() => setSuccess(''), 3000);
      }).finally(() => setLoading(false));
    } else {
      // fallback to local storage
      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      feedbacks.push({ id: Date.now().toString(), name, email, message, createdAt: new Date().toISOString() });
      localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
      setName('');
      setEmail('');
      setMessage('');
      setSuccess('Thanks — your feedback was submitted');
      if (isAdmin) {
        setAdminFeedbacks(feedbacks);
      }
      setTimeout(() => setSuccess(''), 3000);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Feedback</h2>
      
      {/* Feedback Submission Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Submit Your Feedback</h3>
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-gray-50 p-6 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition font-medium">
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Feedback List */}
      {isAdmin && (
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">All Feedback ({adminFeedbacks.length})</h3>
          {adminLoading ? (
            <div className="text-gray-500">Loading feedbacks...</div>
          ) : adminFeedbacks.length === 0 ? (
            <div className="text-gray-500">No feedback yet</div>
          ) : (
            <div className="space-y-4">
              {adminFeedbacks.map((fb: any) => (
                <div key={fb._id || fb.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {fb.name && <span className="font-semibold text-gray-900">{fb.name}</span>}
                        {fb.email && <span className="text-sm text-gray-500">{fb.email}</span>}
                      </div>
                      <p className="text-gray-700 mb-2">{fb.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {fb.user && <span>By: {fb.user.name || 'Unknown'}</span>}
                        <span>{new Date(fb.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFeedback(fb._id || fb.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded transition"
                      title="Delete feedback"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
