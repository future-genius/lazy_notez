import React, { useMemo } from 'react';
import { Activity, Megaphone, Upload, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../components/admin/AdminShell';
import { getResources, getStats, getUsers } from '../utils/localDb';

export default function AdminHome() {
  const navigate = useNavigate();

  const snapshot = useMemo(() => {
    const stats = getStats();
    const users = getUsers();
    const resources = getResources();
    const departments = Array.from(new Set(resources.map((r) => r.department))).filter(Boolean).length;
    const recentUploads = [...resources]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 5);
    const recentLogins = [...users]
      .filter((u) => u.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime())
      .slice(0, 5);

    return { stats, departments, recentUploads, recentLogins };
  }, []);

  return (
    <AdminShell
      title="Admin Home"
      subtitle="Overview and quick actions."
      actions={
        <div className="hidden sm:flex flex-wrap gap-2">
          <button onClick={() => navigate('/admin/resources')} className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm inline-flex items-center gap-2">
            <Upload size={16} /> Upload Resource
          </button>
          <button onClick={() => navigate('/admin/users')} className="rounded-lg border border-slate-300 bg-white/60 px-3 py-2 text-sm text-slate-800 inline-flex items-center gap-2">
            <Users size={16} /> Manage Users
          </button>
          <button onClick={() => navigate('/admin/announcements')} className="rounded-lg border border-slate-300 bg-white/60 px-3 py-2 text-sm text-slate-800 inline-flex items-center gap-2">
            <Megaphone size={16} /> Post Announcement
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminStat title="Total Users" value={snapshot.stats.totalUsers} />
          <AdminStat title="Total Resources" value={snapshot.stats.totalResources} />
          <AdminStat title="Departments" value={snapshot.departments} />
          <AdminStat title="Active Users (7d)" value={snapshot.stats.activeUsers} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center gap-2"><Activity size={18} /> Recent Uploads</h2>
            <div className="space-y-2">
              {snapshot.recentUploads.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/60 px-3 py-2 text-sm text-slate-700 flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-slate-500">{new Date(r.uploadedAt).toLocaleString()}</span>
                </div>
              ))}
              {snapshot.recentUploads.length === 0 && <p className="text-sm text-slate-600">No uploads yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center gap-2"><Users size={18} /> Recent Logins</h2>
            <div className="space-y-2">
              {snapshot.recentLogins.map((u) => (
                <div key={u.id} className="rounded-xl bg-white/60 px-3 py-2 text-sm text-slate-700 flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{u.email}</span>
                  <span className="text-slate-500">{new Date(u.lastLoginAt as string).toLocaleString()}</span>
                </div>
              ))}
              {snapshot.recentLogins.length === 0 && <p className="text-sm text-slate-600">No logins yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function AdminStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-2">{value}</p>
    </div>
  );
}
