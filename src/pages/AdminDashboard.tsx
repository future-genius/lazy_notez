import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Plus, Trash2, Upload, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AdminShell from '../components/admin/AdminShell';
import { useToast } from '../components/ui/ToastProvider';
import { getStoredCurrentUser } from '../utils/authSession';
import {
  ADMIN_EMAIL,
  AppActivity,
  AppResource,
  AppUser,
  addUserByAdmin,
  createResource,
  deleteResource,
  deleteUser,
  getRecentActivities,
  getResources,
  getStats,
  getUsers,
  seedResourcesIfEmpty,
  updateUser,
  updateUserRole
} from '../utils/localDb';
import { subscribeActivities } from '../utils/activityBus';
import {
  AppAnnouncement,
  createAnnouncement,
  deleteAnnouncement as deleteLocalAnnouncement,
  getAnnouncements,
  seedAnnouncementsIfEmpty,
  setAnnouncementPublished,
  updateAnnouncement
} from '../utils/announcements';

type AdminTab = 'dashboard' | 'users' | 'resources' | 'announcements' | 'monitor' | 'communities' | 'feedback' | 'settings';

interface AdminDashboardProps {
  initialTab?: AdminTab;
}

const DEPARTMENTS: { code: string; label: string }[] = [
  { code: 'CSE', label: 'Computer Science and Engineering' },
  { code: 'ECE', label: 'Electronics and Communication Engineering' },
  { code: 'IT', label: 'Information Technology' },
  { code: 'AIDS', label: 'Artificial Intelligence and Data Science' },
  { code: 'MECH', label: 'Mechanical Engineering' },
  { code: 'CIVIL', label: 'Civil Engineering' },
  { code: 'EEE', label: 'Electrical and Electronics Engineering' },
  { code: 'EIE', label: 'Electronics and Instrumentation Engineering' },
  { code: 'AGRI', label: 'Agricultural Engineering' },
  { code: 'CYBERSECURITY', label: 'Cyber Security' },
  { code: 'MDE', label: 'Mechatronics and Design Engineering' }
];

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

const COMMON_SUBJECTS: Record<(typeof SEMESTERS)[number], string[]> = {
  I: ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Programming Fundamentals', 'Basic Electrical Engineering', 'Engineering Graphics'],
  II: ['Engineering Mathematics II', 'Physics for Computing', 'Environmental Science', 'Data Structures Basics', 'Digital Fundamentals', 'Professional Communication'],
  III: ['Engineering Mathematics III', 'Data Structures', 'Object Oriented Programming', 'Computer Organization', 'Discrete Mathematics'],
  IV: ['Probability & Statistics', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Design and Analysis of Algorithms'],
  V: ['Software Engineering', 'Web Technologies', 'Machine Learning', 'Professional Elective I'],
  VI: ['Cloud Computing', 'Distributed Systems', 'Compiler Design', 'Information Security', 'Professional Elective II'],
  VII: ['Mobile Application Development', 'Big Data Analytics', 'Cyber Security', 'Professional Elective III', 'Project Work I'],
  VIII: ['Project Work II', 'Internship / Seminar', 'Professional Elective IV']
};

const DEPARTMENT_SUBJECTS: Record<string, Partial<typeof COMMON_SUBJECTS>> = {
  CSE: {
    III: ['Data Structures', 'Discrete Mathematics', 'Digital Logic Design', 'Object Oriented Programming (Java)'],
    IV: ['Database Management Systems', 'Operating Systems', 'Computer Networks', 'Design and Analysis of Algorithms'],
    V: ['Software Engineering', 'Web Technologies', 'Machine Learning', 'Computer Graphics'],
    VI: ['Cloud Computing', 'Compiler Design', 'Distributed Systems', 'Information Security'],
    VII: ['Mobile Application Development', 'Big Data Analytics', 'Cyber Security', 'DevOps']
  },
  ECE: {
    III: ['Signals and Systems', 'Analog Circuits', 'Digital Electronics', 'Network Analysis'],
    IV: ['Communication Systems', 'Microprocessors', 'Electromagnetic Fields', 'Linear Integrated Circuits'],
    V: ['Digital Signal Processing', 'VLSI Design', 'Control Systems', 'Embedded Systems'],
    VI: ['Wireless Communication', 'Antenna and Wave Propagation', 'Digital Communication', 'IoT Systems'],
    VII: ['RF Engineering', 'Optical Communication', 'Satellite Communication', 'Project Work I']
  },
  IT: {
    III: ['Data Structures', 'Discrete Mathematics', 'Object Oriented Programming', 'Computer Organization'],
    IV: ['Database Management Systems', 'Operating Systems', 'Computer Networks', 'Algorithms'],
    V: ['Web Technologies', 'Software Engineering', 'Data Mining', 'Professional Elective I'],
    VI: ['Cloud Computing', 'Information Security', 'Distributed Systems', 'Professional Elective II'],
    VII: ['Mobile Application Development', 'Big Data Analytics', 'Project Work I', 'Professional Elective III']
  },
  AIDS: {
    III: ['Data Structures', 'Linear Algebra', 'Python for Data Science', 'Probability Basics'],
    IV: ['Machine Learning', 'Database Management Systems', 'Statistics for AI', 'Data Visualization'],
    V: ['Deep Learning', 'Natural Language Processing', 'Data Mining', 'Professional Elective I'],
    VI: ['Computer Vision', 'Big Data Analytics', 'Cloud Computing', 'Professional Elective II'],
    VII: ['MLOps', 'AI Ethics', 'Project Work I', 'Professional Elective III']
  }
};

function getSubjectOptions(departmentCode: string, semester: string) {
  const sem = semester as (typeof SEMESTERS)[number];
  if (!sem) return [];
  const dept = DEPARTMENT_SUBJECTS[departmentCode]?.[sem];
  const base = COMMON_SUBJECTS[sem] || [];
  return Array.from(new Set([...(dept || []), ...base]));
}

function isAdmin(user: any) {
  return user?.role === 'admin' && user?.email?.toLowerCase() === ADMIN_EMAIL;
}

export default function AdminDashboard({ initialTab = 'dashboard' }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [resources, setResources] = useState<AppResource[]>([]);
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [activity, setActivity] = useState<AppActivity[]>([]);
  const [search, setSearch] = useState('');
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'user', provider: 'manual' });
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'study_material',
    departmentCode: '',
    semester: '',
    subject: '',
    driveLink: ''
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    department: '',
    priority: 'normal' as 'normal' | 'important',
    published: true
  });
  const [editAnnouncementId, setEditAnnouncementId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: '', email: '', role: 'user' });

  const currentAdmin = getStoredCurrentUser();

  const refreshData = () => {
    setUsers(getUsers());
    setResources(getResources());
    setAnnouncements(getAnnouncements());
    setActivity(getRecentActivities(40));
  };

  useEffect(() => {
    seedResourcesIfEmpty();
    seedAnnouncementsIfEmpty();
    const currentUser = getStoredCurrentUser();
    if (!isAdmin(currentUser)) {
      navigate('/auth', { replace: true });
      return;
    }

    refreshData();
  }, [navigate]);

  useEffect(() => {
    return subscribeActivities((next) => {
      if (next.type === 'login') {
        toast({
          title: 'User login detected',
          description: `${next.actorEmail || 'Unknown user'} • ${next.meta?.source === 'google' ? 'Google' : 'Manual'}`,
          variant: 'info'
        });
      }
      if (next.type === 'register') {
        toast({
          title: 'New registration',
          description: `${next.actorEmail || 'Unknown user'} • ${next.meta?.source === 'google' ? 'Google' : 'Manual'}`,
          variant: 'success'
        });
      }

      setActivity((prev) => [next, ...prev].slice(0, 40));
    });
  }, [toast]);

  useEffect(() => {
    const socketUrl =
      (window as any).__SOCKET_URL__ ||
      (import.meta as any).env?.VITE_SOCKET_URL ||
      '';

    if (!socketUrl) return;

    const socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });

    socket.on('user.activity', (payload: any) => {
      const type = payload?.type === 'register' ? 'register' : 'login';
      const source = payload?.source === 'google' ? 'google' : 'manual';
      const email = payload?.email || payload?.username || 'Unknown user';
      const name = payload?.name || email;

      const next: AppActivity = {
        id: `realtime_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        actorEmail: email,
        message: type === 'register' ? `${name} registered` : `${name} logged in`,
        createdAt: new Date(payload?.timestamp || Date.now()).toISOString(),
        meta: { source }
      };

      toast({
        title: type === 'register' ? 'New registration' : 'User login detected',
        description: `${email} • ${source === 'google' ? 'Google' : 'Manual'}`,
        variant: type === 'register' ? 'success' : 'info'
      });

      setActivity((prev) => [next, ...prev].slice(0, 40));
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  useEffect(() => {
    if (['dashboard', 'users', 'resources', 'monitor', 'announcements'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const stats = useMemo(() => getStats(), [users, resources]);

  const filteredUsers = useMemo(() => {
    const needle = search.toLowerCase();
    if (!needle) return users;
    return users.filter((user) => `${user.name} ${user.email} ${user.provider} ${user.role}`.toLowerCase().includes(needle));
  }, [search, users]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addUserByAdmin(
        {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          role: userForm.role as 'user' | 'admin',
          provider: userForm.provider as 'manual' | 'google'
        },
        currentAdmin?.email
      );
      setUserForm({ name: '', email: '', role: 'user', provider: 'manual' });
      refreshData();
    } catch (error: any) {
      toast({ title: 'Unable to add user', description: error?.message || 'Please try again.', variant: 'error' });
    }
  };

  const handleDeleteUser = (user: AppUser) => {
    if (!confirm(`Delete ${user.name}?`)) return;
    try {
      deleteUser(user.id, currentAdmin?.email);
      refreshData();
    } catch (error: any) {
      toast({ title: 'Unable to delete user', description: error?.message || 'Please try again.', variant: 'error' });
    }
  };

  const handleSaveEdit = () => {
    if (!editUserId) return;
    updateUser(
      editUserId,
      {
        name: editDraft.name.trim(),
        email: editDraft.email.trim(),
        role: editDraft.role as 'user' | 'admin'
      },
      currentAdmin?.email
    );
    setEditUserId(null);
    refreshData();
  };

  const handleRoleToggle = (user: AppUser) => {
    const role = user.role === 'admin' ? 'user' : 'admin';
    updateUserRole(user.id, role, currentAdmin?.email);
    refreshData();
  };

  const handleResourceUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.departmentCode || !resourceForm.semester || !resourceForm.subject || !resourceForm.driveLink) {
      toast({ title: 'Missing fields', description: 'Please fill all resource fields.', variant: 'warning' });
      return;
    }

    const departmentLabel = DEPARTMENTS.find((d) => d.code === resourceForm.departmentCode)?.label || resourceForm.departmentCode;

    createResource({
      title: resourceForm.title,
      category: resourceForm.category as any,
      department: departmentLabel,
      semester: resourceForm.semester,
      subject: resourceForm.subject,
      driveLink: resourceForm.driveLink,
      uploadedBy: currentAdmin?.name || 'Admin',
      uploadedByEmail: currentAdmin?.email
    });

    setResourceForm({ title: '', category: 'study_material', departmentCode: '', semester: '', subject: '', driveLink: '' });
    refreshData();
  };

  const resetAnnouncementForm = () =>
    setAnnouncementForm({
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      department: '',
      priority: 'normal',
      published: true
    });

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.description.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill title and description.', variant: 'warning' });
      return;
    }

    const dateIso = new Date(`${announcementForm.date}T12:00:00`).toISOString();

    if (editAnnouncementId) {
      const updated = updateAnnouncement(editAnnouncementId, {
        title: announcementForm.title,
        description: announcementForm.description,
        date: dateIso,
        department: announcementForm.department || undefined,
        priority: announcementForm.priority,
        published: announcementForm.published
      });
      if (updated) toast({ title: 'Announcement updated', description: updated.title, variant: 'success' });
      setEditAnnouncementId(null);
    } else {
      const created = createAnnouncement({
        title: announcementForm.title,
        description: announcementForm.description,
        date: dateIso,
        department: announcementForm.department || undefined,
        priority: announcementForm.priority,
        published: announcementForm.published
      });
      toast({ title: 'Announcement created', description: created.title, variant: 'success' });
    }

    resetAnnouncementForm();
    refreshData();
  };

  const startEditAnnouncement = (item: AppAnnouncement) => {
    setEditAnnouncementId(item.id);
    setAnnouncementForm({
      title: item.title,
      description: item.description,
      date: item.date.slice(0, 10),
      department: item.department || '',
      priority: item.priority,
      published: item.published
    });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Resources" value={stats.totalResources} />
        <StatCard title="Active Users" value={stats.activeUsers} />
        <StatCard title="Recent Uploads" value={stats.recentUploads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ControlCard title="User Management" description="View, add, edit, delete and change user roles" onClick={() => navigate('/admin/users')} />
        <ControlCard title="Resource Management" description="Upload and maintain learning resources" onClick={() => navigate('/admin/resources')} />
        <ControlCard title="System Monitor" description="Track recent user/admin activity" onClick={() => navigate('/admin/monitor')} />
      </div>

      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Activity Feed</h3>
        <div className="space-y-2">
          {activity.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-xl bg-white/50 px-3 py-2 text-sm text-slate-700 flex justify-between gap-4">
              <span>{item.message}</span>
              <span className="text-slate-500 shrink-0">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {activity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
        </div>
      </section>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            placeholder="Name"
            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            required
          />
          <input
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            type="email"
            placeholder="Email"
            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            required
          />
          <select value={userForm.provider} onChange={(e) => setUserForm({ ...userForm, provider: e.target.value })} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
            <option value="manual">Manual</option>
            <option value="google">Google</option>
          </select>
          <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="rounded-lg bg-slate-900 text-white px-3 py-2 flex items-center justify-center gap-2 hover:bg-slate-800">
            <Plus size={16} /> Add
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 overflow-x-auto">
        <div className="flex flex-wrap justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm"
          />
        </div>
        <table className="w-full text-sm min-w-[780px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-700">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Provider</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 text-slate-700">
                <td className="py-3">{user.name}</td>
                <td>{user.email}</td>
                <td className="capitalize">{user.provider}</td>
                <td className="capitalize">{user.role}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditUserId(user.id);
                        setEditDraft({ name: user.name, email: user.email, role: user.role });
                      }}
                      className="px-2 py-1 rounded bg-blue-100 text-blue-700"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteUser(user)} className="px-2 py-1 rounded bg-red-100 text-red-700">
                      Delete
                    </button>
                    <button onClick={() => handleRoleToggle(user)} className="px-2 py-1 rounded bg-amber-100 text-amber-700">
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editUserId && (
        <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-800">Edit User</h3>
            <button onClick={() => setEditUserId(null)} className="text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2" />
            <input value={editDraft.email} onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2" />
            <select value={editDraft.role} onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleSaveEdit} className="rounded-lg bg-slate-900 text-white px-3 py-2">Save</button>
          </div>
        </section>
      )}
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Resource</h3>
        <form onSubmit={handleResourceUpload} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          <div className="md:col-span-2 xl:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title</label>
            <input
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              placeholder="e.g., Data Structures Unit 1 Notes"
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
            <select
              value={resourceForm.category}
              onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value as any })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
            >
              <option value="notes">Notes</option>
              <option value="question_paper">Question Papers</option>
              <option value="study_material">Study Materials</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={resourceForm.departmentCode}
              onChange={(e) => setResourceForm({ ...resourceForm, departmentCode: e.target.value, subject: '' })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
            >
              <option value="">Select</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} — {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
            <select
              value={resourceForm.semester}
              onChange={(e) => setResourceForm({ ...resourceForm, semester: e.target.value, subject: '' })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
            >
              <option value="">Select</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={resourceForm.subject}
              onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
              disabled={!resourceForm.departmentCode || !resourceForm.semester}
            >
              <option value="">{resourceForm.departmentCode && resourceForm.semester ? 'Select' : 'Select department & semester'}</option>
              {getSubjectOptions(resourceForm.departmentCode, resourceForm.semester).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Google Drive Link</label>
            <input
              value={resourceForm.driveLink}
              onChange={(e) => setResourceForm({ ...resourceForm, driveLink: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
            />
          </div>

          <button type="submit" className="md:col-span-2 xl:col-span-2 rounded-lg bg-slate-900 text-white px-3 py-2 flex items-center justify-center gap-2">
            <Upload size={16} /> Submit Resource
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-700">
              <th className="py-2">Title</th>
              <th>Type</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Subject</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id} className="border-b border-slate-100 text-slate-700">
                <td className="py-3">{resource.title}</td>
                <td className="text-xs font-semibold text-slate-600">
                  {(resource as any).category === 'notes' ? 'Notes' : (resource as any).category === 'question_paper' ? 'Question Papers' : 'Study Materials'}
                </td>
                <td>{resource.department}</td>
                <td>{resource.semester}</td>
                <td>{resource.subject}</td>
                <td>{resource.downloadCount}</td>
                <td>
                  <button
                    onClick={() => {
                      if (!confirm('Delete this resource?')) return;
                      deleteResource(resource.id, currentAdmin?.email);
                      refreshData();
                    }}
                    className="px-2 py-1 rounded bg-red-100 text-red-700 inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {editAnnouncementId ? 'Edit Announcement' : 'Create Announcement'}
          </h3>
          {editAnnouncementId && (
            <button
              onClick={() => {
                setEditAnnouncementId(null);
                setAnnouncementForm({
                  title: '',
                  description: '',
                  date: new Date().toISOString().slice(0, 10),
                  department: '',
                  priority: 'normal',
                  published: true
                });
              }}
              className="rounded-lg border border-slate-300 bg-white/60 px-3 py-2 text-sm text-slate-700"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleAnnouncementSubmit} className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              placeholder="Announcement title"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={announcementForm.date}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={announcementForm.priority}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department (optional)</label>
            <input
              value={announcementForm.department}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, department: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              placeholder="e.g., CSE"
            />
          </div>

          <div className="lg:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={announcementForm.description}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
              className="w-full min-h-[110px] rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
              placeholder="Write the announcement..."
              required
            />
          </div>

          <label className="lg:col-span-4 inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={announcementForm.published}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, published: e.target.checked })}
              className="rounded border-slate-300"
            />
            Publish immediately
          </label>

          <button type="submit" className="lg:col-span-2 rounded-lg bg-slate-900 text-white px-3 py-2 flex items-center justify-center gap-2">
            <Plus size={16} /> {editAnnouncementId ? 'Save Changes' : 'Create Announcement'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-700">
              <th className="py-2">Title</th>
              <th>Date</th>
              <th>Priority</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 text-slate-700 align-top">
                <td className="py-3">
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{item.description.slice(0, 140)}{item.description.length > 140 ? '…' : ''}</div>
                </td>
                <td className="py-3 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-3 whitespace-nowrap">
                  {item.priority === 'important' ? (
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-semibold">Important</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">Normal</span>
                  )}
                </td>
                <td className="py-3 whitespace-nowrap">{item.department || '—'}</td>
                <td className="py-3 whitespace-nowrap">
                  {item.published ? (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">Published</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">Draft</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEditAnnouncement(item)}
                      className="px-2 py-1 rounded bg-slate-100 text-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setAnnouncementPublished(item.id, !item.published);
                        refreshData();
                      }}
                      className="px-2 py-1 rounded bg-indigo-100 text-indigo-800"
                    >
                      {item.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm('Delete this announcement?')) return;
                        deleteLocalAnnouncement(item.id);
                        if (editAnnouncementId === item.id) {
                          setEditAnnouncementId(null);
                        }
                        refreshData();
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

        {announcements.length === 0 && <p className="text-sm text-slate-600 py-4">No announcements yet.</p>}
      </section>
    </div>
  );

  const renderMonitor = () => (
    <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">System Monitor</h3>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MonitorPanel title="Recent User Logins" items={activity.filter((item) => item.type === 'login')} />
        <MonitorPanel title="Recent Downloads" items={activity.filter((item) => item.type === 'download')} />
        <MonitorPanel title="New Registered Users" items={activity.filter((item) => item.type === 'register' || item.type === 'user_add')} />
        <MonitorPanel title="Upload Activity" items={activity.filter((item) => item.type === 'upload')} />
      </div>
    </section>
  );

  const renderContent = () => {
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'resources') return renderResources();
    if (activeTab === 'announcements') return renderAnnouncements();
    if (activeTab === 'monitor') return renderMonitor();
    return renderDashboard();
  };

  const headerTitle =
    activeTab === 'users'
      ? 'User Management'
      : activeTab === 'resources'
        ? 'Resource Management'
        : activeTab === 'monitor'
          ? 'System Monitor'
          : activeTab === 'announcements'
            ? 'Announcements'
            : 'Admin Dashboard';

  return (
    <AdminShell
      title={headerTitle}
      actions={
        <button onClick={refreshData} className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">
          Refresh
        </button>
      }
    >
      {renderContent()}
    </AdminShell>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function ControlCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5 hover:scale-[1.01] transition">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
    </button>
  );
}

function MonitorPanel({ title, items }: { title: string; items: AppActivity[] }) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/45 p-3">
      <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.slice(0, 6).map((item) => (
          <div key={item.id} className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700 flex flex-wrap justify-between gap-2">
            <span className="flex flex-wrap items-center gap-2">
              <span>{item.message}</span>
              {item.meta?.source && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {item.meta.source === 'google' ? 'Google' : 'Manual'}
                </span>
              )}
            </span>
            <span className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-500">No records yet.</p>}
      </div>
    </div>
  );
}
