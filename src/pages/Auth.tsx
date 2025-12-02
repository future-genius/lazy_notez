import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthSignIn from '../components/AuthSignIn';
import AuthRegister from '../components/AuthRegister';

interface AuthProps {
  onLogin: (userData: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState<'signIn' | 'register'>('signIn');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-primary-400 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="w-full max-w-md">
        {/* Auth Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lazy Notez</h1>
            <p className="text-gray-600">Welcome to your learning platform</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setAuthTab('signIn')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                authTab === 'signIn'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                authTab === 'register'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            {authTab === 'signIn' ? (
              <AuthSignIn onLogin={onLogin} />
            ) : (
              <AuthRegister onRegister={onLogin} />
            )}
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Continue as Guest */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Continue as Guest
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Why Choose Lazy Notez?</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span>
              <span>Access comprehensive study materials</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span>
              <span>Join study groups and communities</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span>
              <span>Collaborate and share notes with peers</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span>
              <span>Export and backup your notes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
