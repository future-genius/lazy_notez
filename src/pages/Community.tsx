import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CommunityCard from '../components/ui/CommunityCard';
import FAB from '../components/ui/FAB';
import { useSidebarSwipe } from '../hooks/useSidebarSwipe';

export default function Community() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(min-width: 1024px)')?.matches) {
      setSidebarOpen(true);
    }
  }, []);

  useSidebarSwipe({
    isOpen: sidebarOpen,
    onOpen: () => setSidebarOpen(true),
    onClose: () => setSidebarOpen(false)
  });

  const sampleGroups = [
    {
      title: 'Official Lazy Notez - All Branches',
      description: 'Join the official campus resources & discussion group for all branches.',
      href: 'https://chat.whatsapp.com/example1'
    },
    {
      title: 'CSE - Resources & Doubts',
      description: 'Subject-wise resources, notes, and doubt-clearing for CSE students.',
      href: 'https://chat.whatsapp.com/example2'
    },
    {
      title: 'Final Year Project Collaborators',
      description: 'Find project partners, share ideas and team up for FYPs.',
      href: 'https://chat.whatsapp.com/example3'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onNavigate={(path) => navigate(path)} />

      <main className={`flex-1 fade-in ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        <header className="sticky top-0 z-30 border-b border-white/40 bg-white/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden rounded-lg border border-slate-300 p-2 text-slate-700"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Community</h1>
                <p className="text-sm text-slate-600">Official groups and channels — join to collaborate.</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-6">
          <section>
            <div className="grid-responsive">
              {sampleGroups.map((g) => (
                <CommunityCard key={g.title} title={g.title} description={g.description} href={g.href} platform="WhatsApp" />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Other platforms (coming soon)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card">Telegram groups placeholder</div>
              <div className="card">Discord communities placeholder</div>
            </div>
          </section>
        </div>

        <FAB onClick={() => alert('Create / Join flow coming soon')} title="Join or Create" />
      </main>
    </div>
  );
}

