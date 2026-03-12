import React, { useEffect, useMemo, useState } from 'react';
import { Camera, ExternalLink, Pencil, Trash2, Upload } from 'lucide-react';
import { getStoredCurrentUser, setStoredCurrentUser } from '../utils/authSession';
import { DEPARTMENTS, SEMESTERS, getDepartmentLabel, getSubjectOptions } from '../utils/academics';
import { useResources } from '../hooks/useResources';
import { createResource, deleteResource, updateResource } from '../utils/localDb';
import { getApiBase } from '../utils/apiBase';
import { deleteUserSubmission, fetchMyResources, submitUserResource, updateUserSubmission } from '../utils/userResourcesApi';

type NoteDraft = {
  title: string;
  departmentCode: string;
  semester: string;
  subject: string;
  driveLink: string;
};

const emptyDraft = (): NoteDraft => ({
  title: '',
  departmentCode: '',
  semester: '',
  subject: '',
  driveLink: ''
});

export default function Profile() {
  const user = getStoredCurrentUser();
  const apiBase = getApiBase();
  const { items: allResources, source } = useResources();
  const [myApiNotes, setMyApiNotes] = useState<any[]>([]);
  const [myApiError, setMyApiError] = useState('');
  const [profileEdit, setProfileEdit] = useState({
    department: user?.department || '',
    semester: (user as any)?.semester || ''
  });

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!(source === 'api' && apiBase)) return;
    let cancelled = false;
    setMyApiError('');
    fetchMyResources({ userId: user.id, email: user.email })
      .then((data) => {
        if (!cancelled) setMyApiNotes(data.resources || []);
      })
      .catch((e) => {
        if (!cancelled) setMyApiError(e?.message || 'Failed to load my notes');
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, source, user.email, user.id]);

  const myNotes = useMemo(() => {
    if (source === 'api' && apiBase) {
      return (myApiNotes || []).map((r) => ({
        id: r._id,
        title: r.title,
        department: r.department,
        semester: r.semester,
        subject: r.subject,
        driveLink: r.googleDriveUrl,
        uploadedBy: r.uploadedByName,
        uploadedByEmail: r.uploadedByEmail,
        uploadedAt: r.uploadDate || r.createdAt,
        downloadCount: r.downloadCount || 0,
        approved: typeof r.approved === 'boolean' ? r.approved : true
      }));
    }

    const email = (user?.email || '').toLowerCase();
    return allResources
      .filter((r) => (r.uploadedByEmail || '').toLowerCase() === email)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [allResources, apiBase, myApiNotes, source, user?.email]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100 flex items-center justify-center text-slate-600">
        Loading profile...
      </div>
    );
  }

  const handleAvatar = async (file: File) => {
    setAvatarBusy(true);
    try {
      const url = await fileToDataUrl(file);
      const next = { ...user, avatar: url };
      setStoredCurrentUser(next);
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveProfile = () => {
    const next = {
      ...user,
      department: profileEdit.department || undefined,
      semester: profileEdit.semester || undefined
    };
    setStoredCurrentUser(next as any);
  };

  const subjectOptions = useMemo(() => {
    return getSubjectOptions(draft.departmentCode, draft.semester);
  }, [draft.departmentCode, draft.semester]);

  const submit = async () => {
    const department = getDepartmentLabel(draft.departmentCode);
    if (!draft.title.trim() || !draft.departmentCode || !draft.semester || !draft.driveLink.trim()) return;
    const subject = draft.subject.trim();

    if (source === 'api' && apiBase) {
      if (editId) {
        await updateUserSubmission(editId, {
          title: draft.title,
          department,
          semester: draft.semester,
          subject,
          driveLink: draft.driveLink
        }, { userId: user.id, email: user.email });
      } else {
        await submitUserResource(
          {
            title: draft.title,
            department,
            semester: draft.semester,
            subject,
            driveLink: draft.driveLink
          },
          { userId: user.id, name: user.name, email: user.email }
        );
      }
    } else {
      if (editId) {
        updateResource(
          editId,
          {
            title: draft.title,
            category: 'notes',
            department,
            semester: draft.semester,
            subject,
            driveLink: draft.driveLink,
            uploadedBy: user.name,
            uploadedByEmail: user.email
          },
          user.email
        );
      } else {
        createResource({
          title: draft.title,
          category: 'notes',
          department,
          semester: draft.semester,
          subject,
          driveLink: draft.driveLink,
          uploadedBy: user.name,
          uploadedByEmail: user.email
        });
      }
    }

    setShowUpload(false);
    setEditId(null);
    setDraft(emptyDraft());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center overflow-hidden shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 rounded-xl bg-white/90 border border-slate-200 p-2 shadow-sm cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatar(file);
                      e.currentTarget.value = '';
                    }}
                    disabled={avatarBusy}
                  />
                  <Camera size={16} className="text-slate-700" />
                </label>
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Profile</h1>
                <p className="text-sm text-slate-600 mt-1">{user.name}</p>
              </div>
            </div>

            <div className="text-sm text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="Email" value={user.email} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Department</span>
                <select
                  value={profileEdit.department}
                  onChange={(e) => setProfileEdit((prev) => ({ ...prev, department: e.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white/60 px-2 py-1 text-sm text-slate-900"
                >
                  <option value="">—</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.code} value={d.label}>{d.code} — {d.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Semester</span>
                <select
                  value={profileEdit.semester}
                  onChange={(e) => setProfileEdit((prev) => ({ ...prev, semester: e.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white/60 px-2 py-1 text-sm text-slate-900"
                >
                  <option value="">—</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          </div>
          {avatarBusy && <p className="text-xs text-slate-600 mt-3">Updating profile photo…</p>}
          <div className="mt-4 flex justify-end">
            <button onClick={saveProfile} className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">
              Save Profile
            </button>
          </div>
          {source === 'api' && (
            <p className="text-xs text-slate-600 mt-3">
              Note: profile photo is stored locally in your browser in this build. Notes upload uses the centralized database.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">My Uploaded Notes</h2>
              <p className="text-sm text-slate-600 mt-1">Notes you uploaded appear here. Admin may approve before public listing.</p>
            </div>
            <button
              onClick={() => {
                setShowUpload(true);
                setEditId(null);
                setDraft(emptyDraft());
              }}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <Upload size={16} /> Upload New Note
            </button>
          </div>

          {myNotes.length === 0 ? (
            <div className="rounded-xl bg-white/50 p-6 text-sm text-slate-600">
              {myApiError ? myApiError : 'No notes uploaded yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-700">
                    <th className="py-2">Title</th>
                    <th>Subject</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myNotes.map((note) => (
                    <tr key={note.id} className="border-b border-slate-100 text-slate-700">
                      <td className="py-3 font-medium text-slate-900">{note.title}</td>
                      <td>{note.subject}</td>
                      <td>{note.department}</td>
                      <td>{note.semester}</td>
                      <td className="text-xs">
                        {(note as any).approved === false ? (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 font-semibold">Pending</span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-semibold">Approved</span>
                        )}
                      </td>
                      <td>{new Date(note.uploadedAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => window.open(note.driveLink, '_blank', 'noopener,noreferrer')}
                            className="px-2 py-1 rounded bg-white/70 border border-slate-200 inline-flex items-center gap-1"
                          >
                            <ExternalLink size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              setShowUpload(true);
                              setEditId(note.id);
                              setDraft({
                                title: note.title,
                                departmentCode: DEPARTMENTS.find((d) => d.label === note.department)?.code || note.department,
                                semester: note.semester,
                                subject: note.subject,
                                driveLink: note.driveLink
                              });
                            }}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-800 inline-flex items-center gap-1"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              (async () => {
                                if (!confirm('Delete this note?')) return;
                                if (source === 'api' && apiBase) {
                                  await deleteUserSubmission(note.id, { userId: user.id, email: user.email });
                                  return;
                                }
                                deleteResource(note.id, user.email);
                              })();
                            }}
                            className="px-2 py-1 rounded bg-red-100 text-red-700 inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showUpload && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Note' : 'Upload New Note'}</h3>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
                  onClick={() => {
                    setShowUpload(false);
                    setEditId(null);
                    setDraft(emptyDraft());
                  }}
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., DSP Notes Unit 1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={draft.departmentCode}
                    onChange={(e) => setDraft({ ...draft, departmentCode: e.target.value, semester: '', subject: '' })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="">Select</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.code} value={d.code}>{d.code} — {d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={draft.semester}
                    onChange={(e) => setDraft({ ...draft, semester: e.target.value, subject: '' })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    disabled={!draft.departmentCode}
                  >
                    <option value="">{draft.departmentCode ? 'Select' : 'Select department first'}</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  {subjectOptions.length > 0 ? (
                    <select
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      disabled={!draft.departmentCode || !draft.semester}
                    >
                      <option value="">{draft.departmentCode && draft.semester ? 'Select' : 'Select department & semester'}</option>
                      {subjectOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      placeholder="Type subject"
                      disabled={!draft.departmentCode || !draft.semester}
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Link</label>
                  <input
                    value={draft.driveLink}
                    onChange={(e) => setDraft({ ...draft, driveLink: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setEditId(null);
                    setDraft(emptyDraft());
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm"
                >
                  {editId ? 'Save Changes' : 'Submit Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

async function fileToDataUrl(file: File) {
  const maxBytes = 2.5 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error('Image too large');

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
