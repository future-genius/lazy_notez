import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Zap, Code, Users, Rocket, Mail, Github, Linkedin, Twitter } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ['Home', 'About Us', 'Services', 'Who We Are', 'Contact'];

  return (
    <div className="min-h-screen bg-gradient-dark text-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">Lazy Notez</div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-primary-400 transition text-sm font-medium">
                {item}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-lg bg-gradient-neon text-white hover:shadow-lg transition">
              Create Account
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/50 backdrop-blur-md border-t border-white/10 p-4">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="block py-2 hover:text-primary-400">
                {item}
              </a>
            ))}
            <div className="mt-4 space-y-2">
              <button onClick={() => navigate('/')} className="w-full px-4 py-2 rounded-lg hover:bg-white/10 border border-white/20">Sign In</button>
              <button onClick={() => navigate('/register')} className="w-full px-4 py-2 rounded-lg bg-gradient-neon text-white">Create Account</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-in">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              The Future of <span className="bg-gradient-neon bg-clip-text text-transparent">Learning</span>, Simplified
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Access premium study materials, collaborate with peers, and master your subjects with Lazy Notez—the ultimate learning platform for the modern student.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => navigate('/register')} className="px-8 py-3 rounded-lg bg-gradient-neon text-white font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                Get Started <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/')} className="px-8 py-3 rounded-lg border border-primary-500 text-primary-400 font-semibold hover:bg-primary-500/10 transition">
                Sign In
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden md:block">
            <div className="w-full aspect-square bg-gradient-accent rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Rocket size={120} className="text-primary-400 opacity-80" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="relative px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">About Lazy Notez</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
            <Zap className="text-primary-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-3">Fast & Intuitive</h3>
            <p className="text-gray-300">Quickly find the resources you need with our smart search and categorization system.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
            <Users className="text-primary-400 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
            <p className="text-gray-300">Connect with thousands of students, share notes, and learn together in vibrant communities.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Services We Provide</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Code, title: 'Rich Notes', desc: 'Well-formatted, comprehensive study notes from verified educators.' },
            { icon: Zap, title: 'Instant Access', desc: 'Download and access all materials offline, anytime, anywhere.' },
            { icon: Users, title: 'Study Groups', desc: 'Join WhatsApp and Telegram groups to collaborate with peers.' },
            { icon: Rocket, title: 'Fast Updates', desc: 'Get the latest syllabus updates and trending topics delivered weekly.' },
          ].map((service, i) => (
            <div key={i} className="p-8 rounded-2xl bg-gradient-accent border border-primary-500/20 backdrop-blur-sm hover:border-primary-500/50 hover:bg-white/10 transition group">
              <service.icon className="text-primary-400 mb-4 group-hover:scale-110 transition" size={36} />
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-300">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who We Are Section */}
      <section id="who-we-are" className="relative px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Who We Are</h2>
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center max-w-2xl mx-auto">
          <p className="text-gray-300 leading-relaxed mb-4">
            Lazy Notez is a passionate team of educators and technologists committed to revolutionizing how students learn and collaborate. We believe that quality education should be accessible, affordable, and engaging.
          </p>
          <p className="text-primary-400 font-semibold">Join thousands of students transforming their academic journey.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative px-6 py-16 max-w-7xl mx-auto">
        <div className="p-12 rounded-2xl bg-gradient-accent border border-primary-500/30 backdrop-blur-sm text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Create your account today and unlock unlimited access to premium study materials and a vibrant learning community.</p>
          <button onClick={() => navigate('/register')} className="px-8 py-3 rounded-lg bg-gradient-neon text-white font-semibold hover:shadow-lg transition inline-flex items-center gap-2">
            Start Free Today <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12 mt-20 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4">Lazy Notez</h4>
              <p className="text-sm text-gray-400">Empowering students through modern learning solutions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#home" className="hover:text-white transition">Features</a></li>
                <li><a href="#services" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#about-us" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#who-we-are" className="hover:text-white transition">About</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary-400 transition"><Twitter size={20} /></a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary-400 transition"><Github size={20} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary-400 transition"><Linkedin size={20} /></a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-white/10">
            <p>&copy; 2024 Lazy Notez. All rights reserved. | <a href="#" className="hover:text-primary-400 transition">Privacy</a> | <a href="#" className="hover:text-primary-400 transition">Terms</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
