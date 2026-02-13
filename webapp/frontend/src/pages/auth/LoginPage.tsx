'use client';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen navy-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">LearnHub</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your learning journey</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign up
                </Link>
              </div>

              {/* Demo Credentials */}
              <div className="border-t border-navy-700 pt-5 mt-5">
                <p className="text-xs text-gray-500 text-center mb-3 font-medium">Demo Credentials:</p>
                <div className="space-y-2">
                  <div className="glass-effect p-3 rounded-xl">
                    <p className="text-xs text-gray-400">
                      <span className="text-blue-400 font-medium">Admin:</span> admin@example.com / admin123
                    </p>
                  </div>
                  <div className="glass-effect p-3 rounded-xl">
                    <p className="text-xs text-gray-400">
                      <span className="text-blue-400 font-medium">Student:</span> john@example.com / admin123
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
