import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  onRegister: (userData: any) => void;
}

function Register({ onRegister }: RegisterProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    college: '',
    univRegNo: '',
    department: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    // Try backend registration first
    const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api';
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        universityRegisterNumber: formData.univRegNo,
        department: formData.department
      })
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        const current = { ...data.user, accessToken: data.accessToken };
        // store lightweight user locally for legacy flows
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({ id: current.id || current._id || Date.now().toString(), name: formData.name, username: formData.username, email: formData.email, college: formData.college, department: formData.department, univRegNo: formData.univRegNo, role: current.role || formData.role, password: formData.password, status: 'active', createdAt: new Date().toISOString() });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(current));
        onRegister(current);
        navigate('/home');
      } else {
        const err = await res.json().catch(() => null);
        // fallback to localStorage registration if backend rejects
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some((user: any) => user.username === formData.username)) {
          alert(err?.message || 'Username already exists!');
          return;
        }
        const userRole = formData.role === 'administrator' ? 'admin' : 'user';
        const userData = {
          ...formData,
          id: Date.now().toString(),
          role: userRole,
          status: 'active',
          createdAt: new Date().toISOString(),
          recentActivity: []
        };
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(userData));
        onRegister(userData);
        navigate('/home');
      }
    }).catch(() => {
      // network error -> fallback to local
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((user: any) => user.username === formData.username)) {
        alert('Username already exists!');
        return;
      }
      const userRole = formData.role === 'administrator' ? 'admin' : 'user';
      const userData = {
        ...formData,
        id: Date.now().toString(),
        role: userRole,
        status: 'active',
        createdAt: new Date().toISOString(),
        recentActivity: []
      };
      users.push(userData);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(userData));
      onRegister(userData);
      navigate('/home');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
              <input
                id="college"
                name="college"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Your College Name"
                value={formData.college}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="univRegNo" className="block text-sm font-medium text-gray-700">Univ Reg No</label>
              <input
                id="univRegNo"
                name="univRegNo"
                type="text"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="e.g., REG123456"
                value={formData.univRegNo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <select
                id="department"
                name="department"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="Agricultural Engineering">Agricultural Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                <option value="Electronics and Instrumentation Engineering">Electronics and Instrumentation Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Medical Electronics">Medical Electronics</option>
                <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                <option value="Structural Engineering">Structural Engineering</option>
                <option value="Communication Systems">Communication Systems</option>
                <option value="Power Systems Engineering">Power Systems Engineering</option>
                <option value="Control and Instrumentation Engineering">Control and Instrumentation Engineering</option>
                <option value="Industrial Safety Engineering">Industrial Safety Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Computer Applications">Computer Applications</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
