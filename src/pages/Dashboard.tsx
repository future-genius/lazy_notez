import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Clock, FileText, Settings, Home, Upload, Camera, Download } from 'lucide-react';
import FAB from '../components/ui/FAB';
import NoteCard from '../components/ui/NoteCard';
import CreateNoteModal from '../components/ui/CreateNoteModal';
import SearchBar from '../components/ui/SearchBar';
// lightweight id generator to avoid extra dependency
const generateId = () => 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);

interface User {
  name: string;
  username: string;
  college: string;
  department: string;
  createdAt: string;
  profilePicture?: string;
  interests?: string[];
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const interestAvatars = {
  'Computer Science': 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Cyber Security': 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Electronics': 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Civil Engineering': 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Mechanical': 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Agriculture': 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Electrical': 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'AI & Data Science': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Information Technology': 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Gaming': 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Music': 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Art': 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Sports': 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Reading': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Travel': 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'Photography': 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
};

function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [currentUser, setCurrentUser] = useState(user);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [notes, setNotes] = useState<Array<any>>([]);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [allowedOrigin, setAllowedOrigin] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setEditedName(user.name);
      setProfilePicture(user.profilePicture || '');
      setSelectedInterests(user.interests || []);
    }
  }, [user]);

  // Load notes and determine allowed origin/port for full features
  useEffect(() => {
    try {
      const host = window.location.hostname;
      const port = window.location.port;
      const protocol = window.location.protocol;
      const isProdHost = host === 'lazy-notez.netlify.app' && protocol.startsWith('https');
      const isLocalDev = host === 'localhost' && port === '3000';
      setAllowedOrigin(isProdHost || isLocalDev);
    } catch (e) {
      setAllowedOrigin(false);
    }

    const raw = localStorage.getItem('lazy_notes_v1');
    if (raw) {
      try { setNotes(JSON.parse(raw)); } catch { setNotes([]); }
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('lazy_notes_v1', JSON.stringify(notes)); } catch {}
  }, [notes]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const getDefaultAvatar = () => {
    const departmentMap: { [key: string]: string } = {
      'CSE': 'Computer Science',
      'CYS': 'Cyber Security',
      'ECE': 'Electronics',
      'CIVIL': 'Civil Engineering',
      'MECH': 'Mechanical',
      'AGRI': 'Agriculture',
      'EEE': 'Electrical',
      'IT': 'Information Technology',
      'AIDS': 'AI & Data Science'
    };

    const departmentInterest = departmentMap[currentUser.department];
    if (departmentInterest && interestAvatars[departmentInterest]) {
      return interestAvatars[departmentInterest];
    }

    if (selectedInterests.length > 0 && interestAvatars[selectedInterests[0]]) {
      return interestAvatars[selectedInterests[0]];
    }

    return null;
  };

  const handleSaveProfile = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) => {
      if (u.username === currentUser.username) {
        return { ...u, name: editedName, profilePicture, interests: selectedInterests };
      }
      return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    const updatedUser = { ...currentUser, name: editedName, profilePicture, interests: selectedInterests };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setIsEditing(false);
    setShowAvatarSelector(false);
    
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedName(currentUser.name);
    setProfilePicture(currentUser.profilePicture || '');
    setSelectedInterests(currentUser.interests || []);
    setIsEditing(false);
    setShowAvatarSelector(false);
  };

  // Notes handlers
  const handleCreate = (payload: { id?: string; title: string; body: string; tags: string[] }) => {
    if (!allowedOrigin) {
      alert('Creating notes is disabled on this host. Full features available on https://lazy-notez.netlify.app or localhost:3000');
      setModalOpen(false);
      return;
    }

    if (payload.id) {
      setNotes((prev) => prev.map((n) => (n.id === payload.id ? { ...n, title: payload.title, body: payload.body, tags: payload.tags, updatedAt: new Date().toISOString() } : n)));
    } else {
      const newNote = { id: generateId(), title: payload.title, body: payload.body, tags: payload.tags, createdAt: new Date().toISOString() };
      setNotes((prev) => [newNote, ...prev]);
    }

    setModalOpen(false);
    setEditingNote(null);
  };

  const handleDelete = (id: string) => {
    if (!allowedOrigin) return alert('Delete disabled on this host');
    if (!confirm('Delete this note?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleEdit = (note: any) => {
    setEditingNote({ id: note.id, title: note.title, body: note.body, tags: (note.tags || []).join(', ') });
    setModalOpen(true);
  };

  const handleShare = (note: any) => {
    const text = `${note.title}\n\n${note.body}`;
    if ((navigator as any).share) {
      (navigator as any).share({ title: note.title, text }).catch(() => alert('Share failed'));
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Note copied to clipboard'));
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lazy_notes_export_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.body.toLowerCase().includes(query.toLowerCase()) || (n.tags || []).join(' ').toLowerCase().includes(query.toLowerCase()));

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const defaultAvatar = getDefaultAvatar();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </button>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {isEditing ? (
                <div className="flex flex-col space-y-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : defaultAvatar ? (
                      <img src={defaultAvatar} alt="Default Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Choose Avatar
                    </button>
                    
                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : defaultAvatar ? (
                    <img src={defaultAvatar} alt="Default Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-blue-600">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
              )}
              <p className="text-gray-600">@{currentUser.username}</p>
              <p className="text-gray-600">{currentUser.college} - {currentUser.department}</p>
              
              {isEditing && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Interests</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(interestAvatars).map((interest) => (
                      <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest)}
                          onChange={() => handleInterestToggle(interest)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {!isEditing && selectedInterests.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Interests:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedInterests.map((interest) => (
                      <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {isEditing ? (
                <div className="space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {showAvatarSelector && isEditing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose an Avatar</h3>
              <div className="grid grid-cols-6 gap-4">
                {Object.entries(interestAvatars).map(([interest, avatarUrl]) => (
                  <div
                    key={interest}
                    onClick={() => {
                      setProfilePicture(avatarUrl);
                      setShowAvatarSelector(false);
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                      <img src={avatarUrl} alt={interest} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-600">{interest}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={() => navigate('/resources')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">Resources</h3>
                <p className="text-gray-600">Access study materials</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                <p className="text-gray-600">View your recent actions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">Notes</h3>
                <p className="text-gray-600">Manage your notes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-orange-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">Settings</h3>
                <p className="text-gray-600">Customize your experience</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Notes</h2>
            <div className="flex items-center gap-2">
              <SearchBar value={query} onChange={setQuery} />
              <button onClick={handleExport} title="Export notes" className="p-2 rounded-md hover:bg-gray-100">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {!allowedOrigin && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded">Full create/edit/delete features are only enabled on <strong>https://lazy-notez.netlify.app</strong> or on <strong>localhost:3000</strong>.</div>
          )}

          <div className="grid-responsive">
            {filtered.length === 0 && <div className="text-gray-500 p-6">No notes yet — create one using the + button.</div>}
            {filtered.map((n) => (
              <NoteCard key={n.id} note={n} onEdit={handleEdit} onDelete={handleDelete} onShare={handleShare} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-gray-700">Account created</p>
              <p className="text-gray-500 text-sm">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isEditing && (
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">Profile editing in progress</p>
                <p className="text-gray-500 text-sm">Now</p>
              </div>
            )}
            {profilePicture && (
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-gray-700">Profile picture updated</p>
                <p className="text-gray-500 text-sm">Recently</p>
              </div>
            )}
          </div>
        </div>
        <CreateNoteModal open={modalOpen} initial={editingNote || undefined} onClose={() => { setModalOpen(false); setEditingNote(null); }} onSave={handleCreate} />
        <FAB onClick={() => { setEditingNote(null); setModalOpen(true); }} title="Create Note" />
      </div>
    </div>
  );
}

export default Dashboard;
