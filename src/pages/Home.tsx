import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Bookmark, Brain, Rocket, ChevronRight, Menu, User, LogOut, Zap, Target, Award, Code, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FAB from '../components/ui/FAB';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-center mb-6 w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl mx-auto">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
}

function SubjectCard({ icon, title, count }: { icon: React.ReactNode; title: string; count: string }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group hover:scale-105">
      <div className="flex items-center space-x-4">
        <div className="p-4 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl group-hover:from-primary-200 group-hover:to-primary-100 transition-all">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-primary-600 text-sm font-semibold">{count}</p>
        </div>
      </div>
    </div>
  );
}

interface HomeProps {
  isLoggedIn: boolean;
  onLogin: (userData: any) => void;
  user?: any;
  onLogout: () => void;
}

export default function Home({ isLoggedIn, onLogin, user, onLogout }: HomeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Show sidebar only when logged in */}
      {isLoggedIn && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onNavigate={(p) => navigate(p)} />}

      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        {/* Show menu button only when logged in */}
        {isLoggedIn && (
          <button onClick={toggleSidebar} className="p-2 focus:outline-none bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition">
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
        )}
        {!isLoggedIn && <div className="w-10" />}

        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Lazy Notez</h1>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigate('/auth')} className="px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition font-semibold shadow-md hover:shadow-lg">
                Sign In
              </button>
              <button onClick={() => navigate('/auth')} className="px-5 py-2 rounded-lg border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition font-semibold">
                Register
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700 font-semibold">Hello, {user?.name || user?.username}</span>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold">
                Dashboard
              </button>
              <button onClick={onLogout} className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition font-semibold">
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6 flex items-center gap-4">
                  <img src="/images/lazy-notez.png" alt="Lazy Notez Logo" className="w-16 h-16 rounded-lg shadow-md object-cover" />
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Lazy Notez</h2>
                </div>
                <h3 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  The Future of <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Learning</span>, Simplified
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Access premium study materials, future-ready notes, and connect with thousands of learners. Your journey to academic excellence starts here.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button onClick={() => isLoggedIn ? navigate('/resources') : navigate('/auth')} className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg">
                    Get Started <ChevronRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate('/about')} className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:border-gray-400 transition">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-primary-100 rounded-3xl blur-3xl opacity-40"></div>
                <img 
                  src="/images/lazy-notez.png" 
                  alt="Lazy Notez" 
                  className="relative rounded-3xl shadow-2xl w-full object-cover" 
                  onError={(e) => { 
                    (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800"; 
                  }} 
                />
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-gray-700 font-semibold">Active Users</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
              <p className="text-gray-700 font-semibold">Study Materials</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">200+</div>
              <p className="text-gray-700 font-semibold">Study Groups</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">4.9★</div>
              <p className="text-gray-700 font-semibold">User Rating</p>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Lazy Notez?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to excel in your studies, in one place</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<BookOpen className="w-8 h-8 text-primary-600" />} 
                title="Comprehensive Notes" 
                description="Access detailed, well-structured notes covering all major topics and courses" 
              />
              <FeatureCard 
                icon={<Brain className="w-8 h-8 text-primary-600" />} 
                title="AI-Powered Learning" 
                description="Smart suggestions and personalized learning paths based on your progress" 
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8 text-primary-600" />} 
                title="Study Communities" 
                description="Connect with peers, join study groups, and collaborate on projects" 
              />
              <FeatureCard 
                icon={<Zap className="w-8 h-8 text-primary-600" />} 
                title="Real-Time Updates" 
                description="Get the latest resources and stay updated with the newest study materials" 
              />
            </div>
          </section>

          {/* Subjects Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
              <p className="text-xl text-gray-600">Explore subjects with hundreds of resources</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SubjectCard icon={<Code className="w-6 h-6 text-primary-600" />} title="Computer Science" count="240+ Resources" />
              <SubjectCard icon={<Target className="w-6 h-6 text-primary-600" />} title="Mathematics" count="180+ Resources" />
              <SubjectCard icon={<Award className="w-6 h-6 text-primary-600" />} title="Physics" count="150+ Resources" />
              <SubjectCard icon={<Rocket className="w-6 h-6 text-primary-600" />} title="AI & Machine Learning" count="120+ Resources" />
            </div>
          </section>

          {/* Benefits Section */}
          {!isLoggedIn && (
            <section className="mb-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-12 text-white shadow-2xl">
              <h2 className="text-4xl font-bold mb-12 text-center">Unlock Your Learning Potential</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20">✓</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Access Curated Notes</h3>
                    <p className="text-white/90">Get comprehensive, well-organized study materials from verified sources and expert educators</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20">✓</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Join Study Communities</h3>
                    <p className="text-white/90">Connect with peers, form study groups, and get support from the community</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20">✓</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Collaborate & Share</h3>
                    <p className="text-white/90">Create, edit, and share notes seamlessly with study partners and classmates</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20">✓</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Export & Backup</h3>
                    <p className="text-white/90">Download your notes, create backups, and access them offline anytime</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-12">
                <button 
                  onClick={() => navigate('/auth')} 
                  className="px-10 py-4 bg-white text-primary-600 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 text-lg"
                >
                  Start Your Free Account Today
                </button>
              </div>
            </section>
          )}

          {/* Contact Section */}
          <section className="mb-20 py-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you. Connect with us on social media or reach out directly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Email */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-600" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-4">Contact us directly via email</p>
                <a href="mailto:support@lazynotez.com" className="text-blue-600 hover:text-blue-700 font-semibold">support@lazynotez.com</a>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="text-green-600" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600 mb-4">Call us during business hours</p>
                <a href="tel:+919876543210" className="text-green-600 hover:text-green-700 font-semibold">+91 9876543210</a>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="text-red-600" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600 mb-4">Visit our office</p>
                <p className="text-gray-700 font-semibold">India</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Follow Us</h3>
              <div className="flex justify-center gap-6 flex-wrap">
                <a 
                  href="https://instagram.com/lazynotez" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="Instagram"
                >
                  <Instagram size={24} />
                </a>
                <a 
                  href="https://linkedin.com/company/lazynotez" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
                <a 
                  href="https://twitter.com/lazynotez" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 10-1 10-6.5 0-.14-.04-.28-.1-.42A7.8 7.8 0 0023 3z"/></svg>
                </a>
                <a 
                  href="https://facebook.com/lazynotez" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z"/></svg>
                </a>
                <a 
                  href="https://youtube.com/@lazynotez" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all"
                  title="YouTube"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </a>
              </div>
              <p className="text-gray-600 text-sm mt-6">Don't forget to follow us for updates, tips, and announcements!</p>
            </div>
          </section>
          <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-12 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">Lazy Notez</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Empowering education through technology, innovation, and community collaboration.</p>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-lg">Quick Links</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="/" className="hover:text-white transition font-semibold">Home</a></li>
                  <li><a href="/about" className="hover:text-white transition font-semibold">About Us</a></li>
                  <li><a href="/community" className="hover:text-white transition font-semibold">Community</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-lg">Resources</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="/resources" className="hover:text-white transition font-semibold">Study Materials</a></li>
                  <li><a href="/dashboard" className="hover:text-white transition font-semibold">Dashboard</a></li>
                  <li><a href="#" className="hover:text-white transition font-semibold">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-lg">Support</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition font-semibold">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition font-semibold">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition font-semibold">Report Issue</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 Lazy Notez. All rights reserved. | Privacy Policy | Terms of Service</p>
            </div>
          </footer>
        </div>
      </div>

      {isLoggedIn && <FAB onClick={() => navigate('/dashboard')} title="Dashboard" />}
    </div>
  );
}
