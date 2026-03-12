import React from 'react';
import { ArrowRight, BookOpen, FileText, Layers3, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncements } from '../hooks/useAnnouncements';

interface User {
  id?: string;
  name: string;
  email?: string;
  username?: string;
  avatar?: string;
}

interface DashboardProps {
  user: User;
}

function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  const { items: preview } = useAnnouncements(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <header className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Welcome back, {user?.name}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            icon={<BookOpen size={18} />}
            title="Study Notes"
            description="Access study notes shared by students."
            actionLabel="Open Notes"
            onClick={() => navigate('/resources?category=notes')}
          />
          <DashboardCard
            icon={<Layers3 size={18} />}
            title="Resources"
            description="Important academic resources for your semester and department."
            actionLabel="Explore"
            onClick={() => navigate('/resources')}
          />
          <DashboardCard
            icon={<FileText size={18} />}
            title="Question Papers"
            description="Previous university exam papers."
            actionLabel="View Papers"
            onClick={() => navigate('/resources?category=question_paper')}
          />
          <DashboardCard
            icon={<Megaphone size={18} />}
            title="Announcements"
            description="Updates and notices from admin."
            actionLabel="View Announcements"
            onClick={() => navigate('/announcements')}
          />
        </section>

        <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 hover:bg-slate-800 transition"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {preview.length === 0 ? (
            <p className="text-sm text-slate-600">No announcements yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {preview.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/30 bg-white/40 p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{new Date(item.date).toLocaleDateString()} • Posted by Admin</p>
                    </div>
                    {item.priority === 'important' && (
                      <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-semibold">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-3">{item.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  actionLabel,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-2">{description}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <button
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition"
      >
        {actionLabel} <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default Dashboard;
