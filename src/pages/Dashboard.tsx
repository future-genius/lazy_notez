import React, { useMemo } from 'react';
import { Bell, BookOpen, Download, Megaphone, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyDownloadCount, getRecentActivities, getResources } from '../utils/localDb';

interface User {
  id?: string;
  name: string;
  email?: string;
  username?: string;
  avatar?: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => Promise<void> | void;
}

const announcements = [
  'New semester resources are now available in CSE and ECE tracks.',
  'Admin team is validating fresh uploads daily.',
  'Use department and semester filters for faster navigation.'
];

function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  const resources = getResources();
  const latestUploads = [...resources].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 4);
  const activity = getRecentActivities(12);

  const metrics = useMemo(() => {
    const myDownloads = getMyDownloadCount(user?.email);
    return {
      myDownloads,
      availableResources: resources.length,
      latestUploads: latestUploads.length,
      announcements: announcements.length
    };
  }, [resources.length, latestUploads.length, user?.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <header className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={async () => {
                await onLogout();
                navigate('/', { replace: true });
              }}
              className="rounded-lg border border-red-200 text-red-700 bg-white/60 px-3 py-2 text-sm hover:bg-white/80 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="My Downloads" value={metrics.myDownloads} icon={<Download size={18} />} gradient="from-blue-500 to-cyan-500" />
          <MetricCard title="Available Resources" value={metrics.availableResources} icon={<BookOpen size={18} />} gradient="from-indigo-500 to-violet-500" />
          <MetricCard title="Latest Uploads" value={metrics.latestUploads} icon={<UploadCloud size={18} />} gradient="from-emerald-500 to-teal-500" />
          <MetricCard title="Announcements" value={metrics.announcements} icon={<Megaphone size={18} />} gradient="from-amber-500 to-orange-500" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Latest Uploads</h2>
            <div className="space-y-3">
              {latestUploads.map((resource) => (
                <div key={resource.id} className="rounded-xl bg-white/60 px-4 py-3 flex flex-wrap items-center justify-between gap-2 hover:bg-white/80 transition">
                  <div>
                    <p className="font-medium text-slate-800">{resource.title}</p>
                    <p className="text-xs text-slate-500">{resource.department} | {resource.semester} | {resource.subject}</p>
                  </div>
                  <button onClick={() => navigate('/resources')} className="text-sm rounded-lg bg-slate-900 text-white px-3 py-1.5">Open</button>
                </div>
              ))}
              {latestUploads.length === 0 && <p className="text-sm text-slate-500">No uploads yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center gap-2"><Bell size={16} /> Announcements</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              {announcements.map((item) => (
                <li key={item} className="rounded-lg bg-white/60 p-3">{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {activity.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-xl bg-white/60 px-3 py-2 text-sm text-slate-700 flex flex-wrap justify-between gap-2">
                <span>{item.message}</span>
                <span className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {activity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, gradient }: { title: string; value: number; icon: React.ReactNode; gradient: string }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-4 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-700">{title}</p>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold text-slate-900 mt-3">{value}</p>
    </div>
  );
}

export default Dashboard;
