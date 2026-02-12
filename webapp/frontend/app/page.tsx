'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, TrendingUp, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen navy-gradient">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LearnHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Join 10,000+ learners worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master New Skills with
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> Expert-Led Courses</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Transform your career with high-quality online courses. Learn at your own pace,
            track your progress, and achieve your goals with LearnHub.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Start Learning Today
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg">
                Browse Courses
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">500+</p>
              <p className="text-gray-400">Courses</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">10K+</p>
              <p className="text-gray-400">Students</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">98%</p>
              <p className="text-gray-400">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose LearnHub?</h2>
          <p className="text-gray-400 text-lg">Everything you need to succeed in your learning journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Expert-Led Courses</h3>
            <p className="text-gray-400 leading-relaxed">
              Learn from industry professionals with years of real-world experience
            </p>
          </div>

          <div className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Global Community</h3>
            <p className="text-gray-400 leading-relaxed">
              Connect with learners from around the world and grow together
            </p>
          </div>

          <div className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Track Progress</h3>
            <p className="text-gray-400 leading-relaxed">
              Monitor your learning journey with detailed analytics and insights
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Get started in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Sign Up</h3>
            <p className="text-gray-400">Create your free account in seconds</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Choose Course</h3>
            <p className="text-gray-400">Browse and enroll in courses</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Start Learning</h3>
            <p className="text-gray-400">Watch videos and track progress</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass-effect rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of students already learning on LearnHub
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="gap-2">
              <CheckCircle className="h-5 w-5" />
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-700 py-8 mt-20">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2026 LearnHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
