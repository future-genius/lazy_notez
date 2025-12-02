import React from 'react';
import { Users, Link2 } from 'lucide-react';

type CommunityCardProps = {
  title: string;
  description: string;
  href: string;
  platform?: string;
};

export default function CommunityCard({ title, description, href, platform }: CommunityCardProps) {
  return (
    <div className="card hover:shadow-card-lg transition-shadow fade-in">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-surface-muted rounded-lg">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">{platform || 'WhatsApp'}</div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btn-primary inline-flex items-center gap-2"
          aria-label={`Join ${title}`}
        >
          <Link2 className="w-4 h-4" />
          Join Group
        </a>
      </div>
    </div>
  );
}
