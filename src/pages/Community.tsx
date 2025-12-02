import React from 'react';
import CommunityCard from '../components/ui/CommunityCard';
import Sidebar from '../components/Sidebar';
import FAB from '../components/ui/FAB';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen flex bg-surface-default">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onNavigate={(path) => navigate(path)} />

      <main className="flex-1 p-6 lg:p-10 ml-0 lg:ml-72 fade-in">
        <div className="container">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">Official WhatsApp groups and community channels — join to collaborate.</p>
          </header>

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
