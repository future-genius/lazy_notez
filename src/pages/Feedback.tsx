import React, { useState } from 'react';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      setTimeout(() => setSuccess(''), 3000);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Feedback</h2>
      {success && <div className="mb-4 text-green-400">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </form>
    </div>
  )
}
