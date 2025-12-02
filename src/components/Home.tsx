import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Bookmark, Brain, Rocket, ChevronRight, Menu, User, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#111111] text-center mb-4">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}

function SubjectCard({ icon, title, count }: { icon: React.ReactNode; title: string; count: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow border border-gray-100 cursor-pointer group">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#111111]">{title}</h3>
          <p className="text-gray-500 text-sm">{count}</p>
        </div>
      </div>
    </div>
  );
}
export { default } from '../pages/Home';