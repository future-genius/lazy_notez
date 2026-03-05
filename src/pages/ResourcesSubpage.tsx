import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authorizedFetch, getAccessToken } from '../utils/authSession';

type Resource = {
  _id: string;
  department: string;
  semester: string;
  subject: string;
  title: string;
  googleDriveUrl: string;
  uploadedByName: string;
  downloadCount: number;
  createdAt: string;
};

const API_BASE = (window as any).__API_BASE__ || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

function ResourcesSubpage() {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'most_downloaded' | 'recent'>('recent');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (selectedDepartment) params.set('department', selectedDepartment);
      if (selectedSemester) params.set('semester', selectedSemester);
      if (selectedSubject) params.set('subject', selectedSubject);
      if (search) params.set('search', search);
      params.set('sortBy', sortBy);
      params.set('limit', '200');

      const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedDepartment, selectedSemester, selectedSubject, search, sortBy]);

  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    resources.forEach((resource) => {
      if (!selectedDepartment || resource.department === selectedDepartment) {
        if (!selectedSemester || resource.semester === selectedSemester) {
          subjectSet.add(resource.subject);
        }
      }
    });
    return Array.from(subjectSet).sort();
  }, [resources, selectedDepartment, selectedSemester]);

  const grouped = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Resource[]>>> = {};
    resources.forEach((resource) => {
      if (!tree[resource.department]) tree[resource.department] = {};
      if (!tree[resource.department][resource.semester]) tree[resource.department][resource.semester] = {};
      if (!tree[resource.department][resource.semester][resource.subject]) tree[resource.department][resource.semester][resource.subject] = [];
      tree[resource.department][resource.semester][resource.subject].push(resource);
    });
    return tree;
  }, [resources]);

  const handleDownload = async (resource: Resource) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        alert('Please login to download resources');
        navigate('/login');
        return;
      }

      const res = await authorizedFetch(`${API_BASE}/resources/${resource._id}/download`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Download failed');

      const data = await res.json();
      window.open(data.googleDriveUrl || resource.googleDriveUrl, '_blank');

      setResources((prev) =>
        prev.map((item) => (item._id === resource._id ? { ...item, downloadCount: data.downloadCount } : item))
      );
    } catch {
      window.open(resource.googleDriveUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 sm:mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedSubject('');
              }}
            >
              <option value="">All Departments</option>
              {Array.from(new Set(resources.map((r) => r.department))).sort().map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>

            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedSubject('');
              }}
            >
              <option value="">All Semesters</option>
              {Array.from(new Set(resources.map((r) => r.semester))).sort().map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Search by resource title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent">Recently Added</option>
              <option value="most_downloaded">Most Downloaded</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center text-gray-600 py-8">Loading resources...</div>}
        {error && <div className="text-center text-red-600 py-8">{error}</div>}
        {!loading && !error && resources.length === 0 && (
          <div className="text-center text-gray-600 py-8 bg-white rounded-xl shadow">No resources found.</div>
        )}

        {!loading && !error && Object.keys(grouped).map((department) => (
          <div key={department} className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{department}</h3>
            {Object.keys(grouped[department]).map((semester) => (
              <div key={semester} className="mb-6">
                <h4 className="text-xl font-semibold text-gray-700 mb-3">{semester} Semester</h4>
                {Object.keys(grouped[department][semester]).map((subject) => (
                  <div key={subject} className="mb-4">
                    <h5 className="text-lg font-medium text-gray-700 mb-3">{subject}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[department][semester][subject].map((resource) => (
                        <div key={resource._id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
                          <h6 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h6>
                          <p className="text-sm text-gray-600 mb-1">Uploaded by: {resource.uploadedByName}</p>
                          <p className="text-sm text-gray-500 mb-4">Downloads: {resource.downloadCount || 0}</p>
                          <button
                            onClick={() => handleDownload(resource)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourcesSubpage;
