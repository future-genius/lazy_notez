import React, { useState } from 'react';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter feedback message');
      return;
    }

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push({ id: Date.now().toString(), name, email, message, createdAt: new Date().toISOString() });
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    setName('');
    setEmail('');
    setMessage('');
    setSuccess('Thanks — your feedback was submitted')
    setTimeout(() => setSuccess(''), 3000);
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
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send Feedback</button>
        </div>
      </form>
    </div>
  )
}
