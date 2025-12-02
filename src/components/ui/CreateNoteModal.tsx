import React, { useState, useEffect } from 'react';

type NoteForm = {
  id?: string;
  title: string;
  body: string;
  tags: string;
};

type Props = {
  initial?: Partial<NoteForm>;
  open: boolean;
  onClose: () => void;
  onSave: (payload: { id?: string; title: string; body: string; tags: string[] }) => void;
};

export default function CreateNoteModal({ initial, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<NoteForm>({ title: '', body: '', tags: '' });

  useEffect(() => {
    if (initial) {
      setForm({ title: initial.title || '', body: initial.body || '', tags: initial.tags || '' });
    }
  }, [initial]);

  useEffect(() => {
    if (!open) setForm({ title: '', body: '', tags: '' });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-card-lg">
        <h3 className="text-xl font-semibold mb-4">{initial?.id ? 'Edit Note' : 'Create Note'}</h3>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            placeholder="Title"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />

          <textarea
            value={form.body}
            onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
            placeholder="Write your note..."
            rows={6}
            className="w-full border border-gray-200 rounded px-3 py-2"
          />

          <input
            value={form.tags}
            onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
            placeholder="Tags (comma separated)"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          <button
            onClick={() => {
              const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
              onSave({ id: initial?.id, title: form.title, body: form.body, tags });
            }}
            className="px-4 py-2 btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
