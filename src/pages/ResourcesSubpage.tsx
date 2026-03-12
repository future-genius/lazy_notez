import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getStoredCurrentUser } from '../utils/authSession';
import { AppResource, incrementDownload } from '../utils/localDb';
import { useResources } from '../hooks/useResources';
import { trackDownload } from '../utils/resourcesApi';
import SearchBar from '../components/ui/SearchBar';

type SortOption = 'name' | 'date' | 'most_downloaded';
type CategoryOption = '' | 'notes' | 'question_paper' | 'study_material';

const CATEGORY_LABELS: Record<Exclude<CategoryOption, ''>, string> = {
  notes: 'Notes',
  question_paper: 'Question Papers',
  study_material: 'Study Materials'
};

function ResourcesSubpage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryOption>(() => (searchParams.get('category') as CategoryOption) || '');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const { items: resourceList, source, error, loading } = useResources();

  useEffect(() => {
    const fromUrl = (searchParams.get('category') as CategoryOption) || '';
    setCategory(fromUrl);
  }, [searchParams]);

  const user = getStoredCurrentUser();
  const resources = resourceList;

  const departments = useMemo(() => Array.from(new Set(resources.map((item) => item.department))).sort(), [resources]);

  const semesters = useMemo(() => {
    return Array.from(new Set(resources.filter((item) => !department || item.department === department).map((item) => item.semester))).sort();
  }, [resources, department]);

  const subjects = useMemo(() => {
    return Array.from(
      new Set(
        resources
          .filter((item) => (!department || item.department === department) && (!semester || item.semester === semester))
          .map((item) => item.subject)
      )
    ).sort();
  }, [resources, department, semester]);

  const filteredResources = useMemo(() => {
    const filtered = resources.filter(
      (item) =>
        (!category || (item.category || 'study_material') === category) &&
        (!department || item.department === department) &&
        (!semester || item.semester === semester) &&
        (!subject || item.subject === subject) &&
        (!query ||
          `${item.title} ${item.department} ${item.semester} ${item.subject}`.toLowerCase().includes(query.toLowerCase().trim()))
    );

    const sorted = [...filtered];
    if (sortBy === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'most_downloaded') sorted.sort((a, b) => b.downloadCount - a.downloadCount);
    if (sortBy === 'date') sorted.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return sorted;
  }, [resources, department, semester, subject, sortBy]);

  const handleView = (resource: AppResource) => {
    if (source === 'api') {
      trackDownload(resource.id).catch(() => undefined);
    } else {
      incrementDownload(resource.id, user?.email);
    }
    window.open(resource.driveLink, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (resource: AppResource) => {
    if (source === 'api') {
      trackDownload(resource.id).catch(() => undefined);
    } else {
      incrementDownload(resource.id, user?.email);
    }
    window.open(resource.driveLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <section className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-5 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Resources{category ? ` • ${CATEGORY_LABELS[category]}` : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <div className="md:col-span-2 xl:col-span-2">
              <SearchBar value={query} onChange={setQuery} placeholder="Search by title, subject, department..." />
            </div>

            <select
              value={category}
              onChange={(e) => {
                const next = e.target.value as CategoryOption;
                setCategory(next);
                setSearchParams((prev) => {
                  const updated = new URLSearchParams(prev);
                  if (next) updated.set('category', next);
                  else updated.delete('category');
                  return updated;
                });
              }}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="question_paper">Question Papers</option>
              <option value="study_material">Study Materials</option>
            </select>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setSemester('');
                setSubject('');
              }}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            >
              <option value="">Department</option>
              {departments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setSubject('');
              }}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            >
              <option value="">Semester</option>
              {semesters.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            >
              <option value="">Subject</option>
              {subjects.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
            >
              <option value="name">Sort by: Name</option>
              <option value="date">Sort by: Date</option>
              <option value="most_downloaded">Sort by: Most Downloaded</option>
            </select>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-6 text-slate-700">
            <p className="font-semibold text-slate-900">Resources unavailable</p>
            <p className="text-sm text-slate-600 mt-1">{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-6 text-slate-600">
            Loading resources...
          </div>
        )}

        {!error && !loading && filteredResources.length === 0 && (
          <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-8 text-center text-slate-600">
            No resources found for selected filters.
          </div>
        )}

        {!error && !loading && filteredResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <article key={resource.id} className="rounded-2xl border border-white/30 bg-white/25 backdrop-blur-xl p-5 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                <p className="text-sm text-slate-600 mt-2">Uploader: {resource.uploadedBy}</p>
                <p className="text-sm text-slate-600">Upload Date: {new Date(resource.uploadedAt).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 mt-1">Downloads: {resource.downloadCount}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDownload(resource)}
                    className="flex-1 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm inline-flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Download
                  </button>
                  <button
                    onClick={() => handleView(resource)}
                    className="flex-1 rounded-lg border border-slate-300 text-slate-700 px-3 py-2 text-sm inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} /> View
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourcesSubpage;
