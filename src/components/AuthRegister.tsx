import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { createManualUser } from '../utils/localDb';
import { setStoredCurrentUser } from '../utils/authSession';

type Props = {
  onRegister: (userData: any) => void;
};

export default function AuthRegister({ onRegister }: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    college: '',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const user = createManualUser({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        department: formData.department,
        college: formData.college
      });

      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        createdAt: user.createdAt,
        username: user.username,
        avatar: user.avatar,
        lastLoginAt: new Date().toISOString()
      };

      setStoredCurrentUser(sessionUser);
      onRegister(sessionUser);
      navigate(sessionUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full name</label>
        <input name="name" value={formData.name} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input name="username" value={formData.username} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">College</label>
          <input name="college" value={formData.college} onChange={handleChange} className="block w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input name="department" value={formData.department} onChange={handleChange} className="block w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm</label>
          <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button className="btn-primary w-full inline-flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          Register
        </button>
      </div>
    </form>
  );
}
