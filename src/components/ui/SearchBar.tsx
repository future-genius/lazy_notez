import React from 'react';
import { Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = 'Search notes...' }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg w-full">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-sm"
        />
      </div>
    </div>
  );
}
