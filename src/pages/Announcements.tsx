import React from 'react';
import { Megaphone } from 'lucide-react';
import { useAnnouncements } from '../hooks/useAnnouncements';

export default function Announcements() {
  const { items } = useAnnouncements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
            <Megaphone size={20} /> Announcements
          </h1>
          <p className="text-sm text-slate-600 mt-1">Latest updates posted by admin.</p>
        </header>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-8 text-center text-slate-600">
            No announcements yet.
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(item.date).toLocaleDateString()} • Posted by Admin
                      {item.department ? ` • ${item.department}` : ''}
                    </p>
                  </div>
                  {item.priority === 'important' && (
                    <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-semibold">
                      Important
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{item.description}</p>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
