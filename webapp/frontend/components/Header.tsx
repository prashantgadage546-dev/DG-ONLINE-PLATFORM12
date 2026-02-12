'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-navy-900/80 backdrop-blur-md border-b border-navy-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          <button className="relative p-2 hover:bg-navy-800 rounded-xl transition-colors">
            <Bell className="h-6 w-6 text-gray-300" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-navy-700">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
