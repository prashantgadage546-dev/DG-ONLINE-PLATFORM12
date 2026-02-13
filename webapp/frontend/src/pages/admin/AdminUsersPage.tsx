'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Shield, Trash2, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student';
  created_at: string;
  enrolled_courses: number;
  completed_lessons: number;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: {
          q: search || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
        },
      });
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const admins = users.filter((u) => u.role === 'admin').length;
    const students = users.filter((u) => u.role === 'student').length;
    const totalCompleted = users.reduce((sum, u) => sum + Number(u.completed_lessons || 0), 0);
    return { admins, students, totalCompleted };
  }, [users]);

  const handleChangeRole = async (user: UserItem) => {
    const nextRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      await api.put(`/users/${user.id}/role`, { role: nextRole });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (!confirm(`Delete ${user.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="flex h-screen navy-gradient">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
              <p className="text-gray-400">Manage learners and admin permissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Total Admins</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-white">{summary.admins}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-white">{summary.students}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Lessons Completed</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-white">{summary.totalCompleted}</p></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <CardTitle>All Users</CardTitle>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-9"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') fetchUsers();
                        }}
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'student')}
                      className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="student">Student</option>
                    </select>
                    <Button variant="outline" onClick={fetchUsers}>Apply</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-400 py-10 text-center">Loading users...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-navy-700 text-left text-gray-400">
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Enrolled</th>
                          <th className="pb-3">Completed</th>
                          <th className="pb-3">Joined</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-navy-700/50">
                            <td className="py-3 text-white">{user.name}</td>
                            <td className="py-3 text-gray-300">{user.email}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-blue-600/20 text-blue-300' : 'bg-zinc-700 text-zinc-200'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 text-gray-300">{user.enrolled_courses}</td>
                            <td className="py-3 text-gray-300">{user.completed_lessons}</td>
                            <td className="py-3 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleChangeRole(user)}>
                                  {user.role === 'admin' ? <UserCog className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(user)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
