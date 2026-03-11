import React from 'react';
import CommunityCard from '../components/ui/CommunityCard';
import FAB from '../components/ui/FAB';

export default function Community() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <main className="fade-in">
        <div className="container py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Community</h1>
            <p className="text-sm text-slate-600 mt-1">Official groups and channels — join to collaborate.</p>
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

