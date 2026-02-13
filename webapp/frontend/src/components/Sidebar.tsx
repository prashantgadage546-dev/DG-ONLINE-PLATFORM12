'use client';

import { Link, useLocation } from 'react-router-dom';
import {
  Home, 
  BookOpen, 
  GraduationCap,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';

interface SidebarProps {
  role: 'admin' | 'student';
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/courses', label: 'My Courses', icon: BookOpen },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-effect shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-navy-900/95 backdrop-blur-md border-r border-navy-700 transition-transform duration-300 z-40 shadow-2xl",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-navy-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DreamsGuider</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20"
                      : "text-gray-300 hover:bg-navy-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-navy-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-300 hover:bg-blue-500/10 hover:text-white w-full transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}


