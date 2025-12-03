import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

type Props = {
  onRegister: (userData: any) => void;
};

export default function AuthRegister({ onRegister }: Props) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    college: '',
    univRegNo: '',
    department: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u: any) => u.username === formData.username)) {
      alert('Username already exists!');
      return;
    }

    // Map role to admin/user: only administrator role becomes admin, others are users
    const userRole = formData.role === 'administrator' ? 'admin' : 'user';

    const userData = { 
      ...formData, 
      role: userRole,
      status: 'active',
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(), 
      recentActivity: [] 
    };
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    onRegister(userData);
    navigate('/home');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full name</label>
        <input name="name" value={formData.name} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input name="username" value={formData.username} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select name="role" value={formData.role} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg">
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="administrator">Administrator</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">College</label>
          <input name="college" value={formData.college} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Univ Reg No</label>
          <input name="univRegNo" value={formData.univRegNo} onChange={handleChange} placeholder="e.g., REG123456" className="block w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select name="department" value={formData.department} onChange={handleChange} required className="block w-full px-3 py-2 border rounded-lg">
            <option value="">Select</option>
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

      <div>
        <button className="btn-primary w-full inline-flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          Register
        </button>
      </div>
    </form>
  );
}
