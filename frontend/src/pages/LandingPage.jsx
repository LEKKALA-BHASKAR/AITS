import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Zap,
  ChevronRight,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Layout from '../components/Layout';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Multi-Role Management',
      description: 'Separate dashboards for Admin, Teachers, and Students with role-based access control'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics and reporting for performance tracking and insights'
    },
    {
      icon: BookOpen,
      title: 'Academic Management',
      description: 'Complete attendance, results, and achievement management in one place'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with JWT authentication and encrypted data storage'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant notifications and real-time data synchronization across the platform'
    },
    {
      icon: CheckCircle,
      title: 'Easy to Use',
      description: 'Intuitive interface designed for seamless user experience and efficiency'
    }
  ];

  const benefits = [
    'Streamline student data management',
    'Track attendance and academic performance',
    'Manage departments, sections, and teachers',
    'Generate comprehensive reports and analytics',
    'Support ticket system for issue resolution',
    'Certificate and achievement tracking'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-10 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full opacity-5 blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* Header */}
          <header className={`flex justify-between items-center mb-16 sm:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-2 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                AITS CSMS
              </h1>
            </div>
            <Link to="/login">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </header>

          {/* Hero Content */}
          <div className="text-center mb-16 sm:mb-24">
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Centralized Student
                </span>
                <br />
                <span className="text-gray-800 dark:text-gray-100">Management System</span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                A comprehensive, enterprise-grade platform for managing student data, 
                tracking performance, and streamlining academic operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/login">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Login to Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-lg px-8 py-6 transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className={`bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-10">
              <h3 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Why Choose AITS CSMS?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Built with modern technology and designed for educational institutions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 group cursor-default"
                >
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-2 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className={`text-center mt-16 sm:mt-24 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Ready to get started?
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students, teachers, and administrators using AITS CSMS
            </p>
            <Link to="/login">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 text-white text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Access Your Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-20 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 AITS CSMS. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Made with ❤️ by the AITS Development Team
          </p>
        </div>
      </footer>
    </div>
  );
}
