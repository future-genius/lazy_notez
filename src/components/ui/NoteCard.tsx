import React from 'react';
import { Trash2, Edit, Share2 } from 'lucide-react';

type Note = {
  id: string;
  title: string;
  body: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
};

type NoteCardProps = {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
  onShare?: (note: Note) => void;
};

export default function NoteCard({ note, onEdit, onDelete, onShare }: NoteCardProps) {
  return (
    <article className="card hover:shadow-card-lg transition transform-gpu group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-4">{note.body}</p>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {note.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 bg-surface-muted rounded-full text-gray-600">{t}</span>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-400 mt-3">{new Date(note.createdAt).toLocaleString()}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button aria-label="Share" onClick={() => onShare && onShare(note)} className="p-2 rounded-md hover:bg-gray-100">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button aria-label="Edit" onClick={() => onEdit && onEdit(note)} className="p-2 rounded-md hover:bg-gray-100">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button aria-label="Delete" onClick={() => onDelete && onDelete(note.id)} className="p-2 rounded-md hover:bg-red-50">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </article>
  );
}
