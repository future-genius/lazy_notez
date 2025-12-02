import React from 'react';
import { Plus } from 'lucide-react';

type FABProps = {
  onClick?: () => void;
  title?: string;
};

export default function FAB({ onClick, title = 'Create' }: FABProps) {
  return (
    <button aria-label={title} onClick={onClick} className="fab" title={title}>
      <Plus className="w-6 h-6" />
    </button>
  );
}
