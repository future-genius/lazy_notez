import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthRegister from '../components/AuthRegister';

interface RegisterProps {
  onRegister: (userData: any) => void;
}

function Register({ onRegister }: RegisterProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <AuthRegister onRegister={onRegister} />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth')}
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
