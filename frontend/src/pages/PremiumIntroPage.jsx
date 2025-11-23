import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Eye,
  BarChart3,
  Users,
  Bell,
  TrendingUp,
  CheckCircle2,
  Star,
  Crown,
  Target,
  Lock,
  ChartBar,
  UserCheck,
  AlertTriangle,
  Rocket
} from 'lucide-react';

export default function PremiumIntroPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Eye,
      title: 'Real-Time Monitoring',
      description: 'Advanced AI-powered tracking with instant alerts and comprehensive student activity monitoring across all platforms',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '24/7 Tracking'
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      description: 'Beautiful data visualization with machine learning insights and performance trend predictions',
      gradient: 'from-purple-500 to-pink-500',
      stats: '98% Accuracy'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption with role-based access control and complete audit trails',
      gradient: 'from-emerald-500 to-teal-500',
      stats: '256-bit AES'
    },
    {
      icon: Zap,
      title: 'Lightning Performance',
      description: 'Optimized performance with real-time synchronization and instant notification delivery',
      gradient: 'from-orange-500 to-red-500',
      stats: '< 100ms'
    },
    {
      icon: Users,
      title: 'Multi-Role System',
      description: 'Seamless experience for admins, teachers, and students with custom dashboards',
      gradient: 'from-indigo-500 to-purple-500',
      stats: '3 Roles'
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'AI-driven recommendations and automated risk detection for student success',
      gradient: 'from-pink-500 to-rose-500',
      stats: 'AI Powered'
    }
  ];

  const highlights = [
    { icon: Crown, text: 'Admin Super Dashboard' },
    { icon: Target, text: 'Teacher Analytics Hub' },
    { icon: UserCheck, text: 'Student Progress Tracker' },
    { icon: ChartBar, text: 'Real-time Reports' },
    { icon: Lock, text: 'Secure Data Encryption' },
    { icon: AlertTriangle, text: 'Early Warning System' }
  ];

  const stats = [
    { number: '99.9%', label: 'System Uptime', icon: Zap },
    { number: '256-bit', label: 'Encryption', icon: Lock },
    { number: '< 100ms', label: 'Response Time', icon: Rocket },
    { number: '24/7', label: 'Support', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AITS
                </span>
                <div className="text-xs text-gray-400">Extreme Monitoring</div>
              </div>
            </div>
            
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl px-8 py-6 rounded-xl font-semibold">
                <span className="flex items-center gap-2">
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-semibold text-white">Next Generation Student Monitoring</span>
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              AITS
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Extreme
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              Monitoring
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            The world's most advanced student monitoring platform. 
            <span className="text-white font-semibold"> Powered by AI</span>, 
            designed for <span className="text-white font-semibold"> educational excellence</span>, 
            built for <span className="text-white font-semibold"> tomorrow's institutions</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-blue-500/30 px-12 py-8 text-xl rounded-2xl font-bold transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  Explore Platform
                  <Rocket className="h-6 w-6" />
                </span>
              </Button>
            </Link>
            
            <Button 
              size="lg"
              className="w-full sm:w-auto backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 shadow-xl px-12 py-8 text-xl rounded-2xl font-bold transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                View Demo
                <Eye className="h-6 w-6" />
              </span>
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mb-16">
            {highlights.map((item, index) => (
              <div 
                key={index}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300"
              >
                <item.icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-300">{item.text}</div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Enterprise Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools designed for modern educational institutions
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border rounded-3xl p-8 transition-all duration-500 hover:scale-105 cursor-pointer ${
                  activeFeature === index 
                    ? 'border-blue-400/50 bg-blue-500/10' 
                    : 'border-white/20 hover:border-white/30'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Feature Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Feature Stats */}
                <div className="absolute top-6 right-6">
                  <div className="bg-black/30 rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-blue-400">{feature.stats}</span>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                {/* Learn More */}
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 rounded-[3rem] p-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Three Powerful Roles
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Tailored experiences for every user in your institution
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Admin Role */}
              <div className="text-center backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Administrator</h3>
                <p className="text-gray-400 mb-6">
                  Complete system control with advanced analytics and institution-wide oversight
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• System Management</div>
                  <div>• Advanced Analytics</div>
                  <div>• User Management</div>
                  <div>• Report Generation</div>
                </div>
              </div>

              {/* Teacher Role */}
              <div className="text-center backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Teacher</h3>
                <p className="text-gray-400 mb-6">
                  Classroom management with student analytics and performance tracking
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• Student Analytics</div>
                  <div>• Grade Management</div>
                  <div>• Attendance Tracking</div>
                  <div>• Progress Reports</div>
                </div>
              </div>

              {/* Student Role */}
              <div className="text-center backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Student</h3>
                <p className="text-gray-400 mb-6">
                  Personal dashboard with progress tracking and performance insights
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• Progress Tracking</div>
                  <div>• Grade Access</div>
                  <div>• Performance Insights</div>
                  <div>• Achievement Tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[3rem] p-16 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
            
            <div className="relative z-10">
              <Star className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform?
              </h2>
              <p className="text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join leading educational institutions using AITS to deliver exceptional student experiences
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-blue-500/50 px-14 py-8 text-xl rounded-2xl font-bold transition-all duration-300"
                  >
                    <span className="flex items-center gap-3">
                      Start Monitoring Now
                      <CheckCircle2 className="h-6 w-6" />
                    </span>
                  </Button>
                </Link>
                
                <Button 
                  size="lg"
                  className="w-full sm:w-auto backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 shadow-xl px-14 py-8 text-xl rounded-2xl font-bold transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    Book Demo
                    <Eye className="h-6 w-6" />
                  </span>
                </Button>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">10K+</div>
                  <div className="text-gray-400 font-medium">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-gray-400 font-medium">Institutions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-gray-400 font-medium">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">AITS</span>
                <div className="text-sm text-gray-400">Extreme Student Monitoring</div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-sm">
                © 2024 AITS Monitoring System. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Designed for educational excellence
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
