import { useState, useEffect, useRef, useMemo } from 'react';
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
  Star
} from 'lucide-react';

export default function PremiumIntroPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Generate particle positions once
  const particles = useMemo(() => 
    Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`
    })),
    []
  );

  useEffect(() => {
    setIsVisible(true);

    let scrollTimeout;
    let mouseTimeout;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        setScrollY(window.scrollY);
      }, 10); // Throttle to every 10ms
    };

    const handleMouseMove = (e) => {
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
      mouseTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 50); // Throttle to every 50ms
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (mouseTimeout) clearTimeout(mouseTimeout);
    };
  }, []);

  const features = [
    {
      icon: Eye,
      title: 'Real-Time Monitoring',
      description: 'Advanced AI-powered tracking with instant alerts and comprehensive student activity monitoring',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Beautiful data visualization with predictive insights and performance trends',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption with role-based access and complete audit trails',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with real-time sync and instant notifications',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Seamless experience for admins, teachers, and students with custom dashboards',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'AI-driven recommendations and automated risk detection for student success',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '< 100ms', label: 'Response Time' },
    { number: '256-bit', label: 'AES Encryption' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Blobs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(139,92,246,0.3) 50%, transparent 100%)',
            top: '10%',
            left: '10%',
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.15}px)`
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 100%)',
            top: '50%',
            right: '10%',
            transform: `translate(${-scrollY * 0.08}px, ${scrollY * 0.12}px)`
          }}
        />
        <div 
          className="absolute w-[700px] h-[700px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(249,115,22,0.3) 50%, transparent 100%)',
            bottom: '10%',
            left: '30%',
            transform: `translate(${scrollY * 0.05}px, ${-scrollY * 0.1}px)`
          }}
        />

        {/* Floating Particles */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }} />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Navigation */}
          <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    AITS
                  </span>
                </div>
                <Link to="/login">
                  <Button 
                    className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 px-6 rounded-xl"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = mousePosition.x - rect.left;
                      const y = mousePosition.y - rect.top;
                      e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                      e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/20 to-transparent" 
                      style={{
                        maskImage: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 20%, transparent 50%)'
                      }}
                    />
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center mt-24">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-5 py-2.5 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-200">Introducing AITS Next Generation</span>
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            </div>

            {/* Main Headline */}
            <h1 className={`text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                AITS
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Extreme Student
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                Monitoring System
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Experience the future of education management. 
              <span className="text-white font-medium"> Powered by AI</span>, designed for 
              <span className="text-white font-medium"> excellence</span>, built for 
              <span className="text-white font-medium"> tomorrow</span>.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link to="/login">
                <Button 
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 px-10 py-7 text-lg rounded-2xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Dashboard
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Button 
                size="lg"
                className="group relative overflow-hidden backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 shadow-xl transition-all duration-300 px-10 py-7 text-lg rounded-2xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Monitoring
                  <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </span>
              </Button>
            </div>

            {/* 3D Device Mockups Placeholder */}
            <div className={`relative max-w-6xl mx-auto transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {/* MacBook Pro Mockup */}
              <div 
                className="relative mx-auto transition-transform duration-700 hover:scale-105"
                style={{
                  transform: `perspective(1000px) rotateX(${scrollY * 0.02}deg) rotateY(${scrollY * 0.01}deg)`
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="relative backdrop-blur-2xl bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20 rounded-3xl p-8 shadow-2xl">
                  {/* Screen Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                  
                  {/* Screen Content */}
                  <div className="relative bg-gradient-to-br from-gray-950 to-black rounded-2xl overflow-hidden aspect-[16/10]">
                    {/* Top Bar */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-white/10 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex-1 text-center text-xs text-gray-400">AITS Dashboard</div>
                    </div>
                    
                    {/* Dashboard Preview */}
                    <div className="p-6 space-y-4">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-4">
                            <div className="h-2 w-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-2" />
                            <div className="h-4 w-20 bg-white/20 rounded-full" />
                          </div>
                        ))}
                      </div>
                      
                      {/* Chart Area */}
                      <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/10 rounded-xl p-6 h-40 flex items-end gap-2">
                        {[40, 70, 45, 80, 60, 90, 55, 75].map((height, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500"
                            style={{ 
                              height: `${height}%`,
                              opacity: isHovering ? 1 : 0.7
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Reflection */}
                  <div className="absolute -bottom-4 left-0 right-0 h-20 bg-gradient-to-b from-white/5 to-transparent rounded-b-3xl blur-sm" />
                </div>

                {/* Floating iPhone Mockup - Right */}
                <div 
                  className="absolute -right-16 top-20 w-48 backdrop-blur-2xl bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20 rounded-[2.5rem] p-3 shadow-2xl transition-all duration-700 hover:scale-110"
                  style={{
                    transform: `translateY(${Math.sin(scrollY * 0.01) * 20}px) rotate(${5 + Math.sin(scrollY * 0.02) * 5}deg)`
                  }}
                >
                  <div className="bg-black rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 h-full p-4 flex flex-col">
                      <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="backdrop-blur-xl bg-white/10 rounded-xl p-3 border border-white/10">
                            <div className="h-1.5 w-12 bg-white/40 rounded-full mb-2" />
                            <div className="h-1 w-16 bg-white/20 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating iPad Mockup - Left */}
                <div 
                  className="absolute -left-20 bottom-10 w-56 backdrop-blur-2xl bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20 rounded-3xl p-3 shadow-2xl transition-all duration-700 hover:scale-110"
                  style={{
                    transform: `translateY(${Math.sin(scrollY * 0.01 + Math.PI) * 15}px) rotate(${-8 + Math.sin(scrollY * 0.02) * 5}deg)`
                  }}
                >
                  <div className="bg-black rounded-2xl overflow-hidden aspect-[4/3]">
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 h-full p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="backdrop-blur-xl bg-white/10 rounded-lg aspect-square border border-white/10 flex items-center justify-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Built for Excellence
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every feature designed with precision, crafted for performance
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-fadeInUp"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                {/* Card Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-all duration-500`} />
                
                {/* Card */}
                <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 transition-all duration-500 group-hover:scale-105 group-hover:border-white/30 overflow-hidden">
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          
          <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[3rem] p-16">
            <Star className="h-12 w-12 text-yellow-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Education?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of institutions already using AITS to deliver exceptional student experiences
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button 
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 px-12 py-7 text-lg rounded-2xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Now
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                </Button>
              </Link>
              <Button 
                size="lg"
                className="backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 shadow-xl transition-all duration-300 px-12 py-7 text-lg rounded-2xl"
              >
                Schedule Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-16 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm text-gray-400">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-400">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-300">AITS</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 AITS Extreme Student Monitoring System. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Designed in California. Built for the future.
          </p>
        </div>
      </footer>
    </div>
  );
}
