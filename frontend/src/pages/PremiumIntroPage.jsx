import { useEffect, useMemo, useRef, useState } from 'react';
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
  TrendingUp,
  CheckCircle2,
  Star
} from 'lucide-react';

export default function PremiumIntroPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const heroRef = useRef(null);

  // Generate subtle floating particles (positions fixed after mount)
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        top: `${5 + Math.random() * 90}%`,
        size: 1 + Math.random() * 2,
        delay: `${Math.random() * 4}s`,
        duration: `${6 + Math.random() * 8}s`
      })),
    []
  );

  useEffect(() => {
    // mount anim
    const t = setTimeout(() => setIsMounted(true), 80);
    // light-weight mouse move to control button hover radial
    const handleMove = (e) => {
      // compute relative to hero area if exists
      const rect = heroRef.current?.getBoundingClientRect();
      if (rect) {
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        setMousePos({ x: `${x}px`, y: `${y}px` });
      } else {
        setMousePos({ x: `${e.clientX}px`, y: `${e.clientY}px` });
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  const features = [
    {
      icon: Eye,
      title: 'Real-Time Monitoring',
      description:
        'AI-driven, live student activity monitoring with customizable alerts and review timelines.',
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description:
        'Actionable insights, trend forecasting, and beautiful visualizations for administrators.',
      gradient: 'from-violet-500 to-pink-400'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Role-based access, full audit logs, and AES-level encryption across systems.',
      gradient: 'from-emerald-400 to-teal-400'
    },
    {
      icon: Zap,
      title: 'Instant Sync',
      description: 'Low-latency events and push updates — designed for scale and reliability.',
      gradient: 'from-orange-400 to-rose-400'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Tailored dashboards for admins, teachers, and students with permission controls.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description:
        'AI recommendations, risk detection, and suggested interventions to boost success rates.',
      gradient: 'from-pink-400 to-rose-400'
    }
  ];

  const stats = [
    { number: '99.99%', label: 'Uptime' },
    { number: '<100ms', label: 'Avg Response' },
    { number: 'AES-256', label: 'Encryption' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="relative min-h-screen bg-[#030307] text-white antialiased overflow-hidden">
      {/* Global custom styles for small helpers */}
      <style>{`
        @keyframes floatSlow { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px);} 100% { transform: translateY(0px);} }
        @keyframes glowPulse { 0%{ opacity: .6; transform: scale(.98);} 50%{ opacity: 1; transform: scale(1.02);} 100%{ opacity: .6; transform: scale(.98);} }
        .card-glass { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(10px); }
        .btn-mouse-radial { --mx: ${mousePos.x}; --my: ${mousePos.y}; }
        .shine { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%); transform: translateX(-120%); transition: transform .9s cubic-bezier(.2,.9,.2,1); }
        .group:hover .shine { transform: translateX(120%); }
        .soft-glow { box-shadow: 0 8px 40px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.02); }
      `}</style>

      {/* Ambient gradient blobs */}
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            width: 720,
            height: 720,
            left: '6%',
            top: '6%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.26), rgba(99,102,241,0.12), transparent 60%)'
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-24"
          style={{
            width: 640,
            height: 640,
            right: '6%',
            top: '28%',
            background:
              'radial-gradient(circle at 70% 40%, rgba(139,92,246,0.22), rgba(236,72,153,0.08), transparent 60%)'
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-18"
          style={{
            width: 520,
            height: 520,
            left: '24%',
            bottom: '6%',
            background:
              'radial-gradient(circle at 50% 70%, rgba(249,115,22,0.16), rgba(236,72,153,0.06), transparent 60%)'
          }}
        />
        {/* subtle grain */}
        <div
          className="absolute inset-0 opacity-5 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          aria-hidden
          className="absolute rounded-full opacity-30"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'rgba(255,255,255,0.06)',
            animation: `floatSlow ${p.duration} ease-in-out ${p.delay} infinite`
          }}
        />
      ))}

      {/* Navigation */}
      <header
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl transition-all duration-700 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 card-glass rounded-2xl soft-glow">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-sm opacity-60" style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa)' }} />
              <div className="relative rounded-xl p-2 bg-gradient-to-br from-blue-500 to-violet-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <div className="text-white font-semibold tracking-wide">AITS</div>
              <div className="text-xs text-gray-300 -mt-0.5">Next Generation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-block">
              <Button
                size="sm"
                className="group relative overflow-hidden rounded-xl px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 border-0 shadow"
                onMouseEnter={(e) => {
                  // no-op here: radial is global to hero via CSS var
                }}
              >
                <span className="flex items-center gap-2 z-10">
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 pointer-events-none shine" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="rounded-xl px-4 py-2 card-glass">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-7xl mx-auto py-28">
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-full card-glass border border-white/8 mx-auto mb-8 transition-all duration-800 ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <div className="text-sm text-gray-200 font-medium">Introducing AITS — Extreme Monitoring</div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <h1
              className={`font-extrabold leading-tight text-5xl md:text-6xl lg:text-7xl mb-6 transition-all duration-900 ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-200 to-violet-300">
                AITS
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300">
                Premium Student Intelligence
              </span>
              <br />
              <span className="text-lg md:text-xl block mt-2 text-gray-300 font-medium">
                Trusted. Secure. Insightful.
              </span>
            </h1>

            <p className={`text-lg text-gray-400 max-w-3xl mx-auto mb-10 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              Elevate your institution with real-time monitoring, world-class security, and AI-driven insights that help students succeed.
            </p>

            {/* CTAs */}
            <div className={`flex gap-4 justify-center mb-14 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/login">
                <Button
                  size="lg"
                  className="group relative overflow-hidden rounded-2xl px-10 py-5 bg-gradient-to-r from-blue-500 to-violet-500 text-lg shadow-2xl"
                  onMouseEnter={() => {}}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Explore Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      maskImage: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), black 20%, transparent 50%)'
                    }}
                  />
                </Button>
              </Link>

              <Button
                size="lg"
                className="rounded-2xl px-8 py-5 card-glass border border-white/8 text-lg"
              >
                Start Monitoring
              </Button>
            </div>

            {/* Device mockups area */}
            <div className="relative max-w-6xl mx-auto">
              {/* MacBook (fixed screen) */}
              <div
                className="mx-auto rounded-3xl overflow-hidden card-glass soft-glow shadow-2xl relative"
                style={{ maxWidth: 1180 }}
                aria-hidden
              >
                {/* Top bar */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/6 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-400">AITS • Dashboard Preview</div>
                  <div className="text-xs text-gray-400">v2.3</div>
                </div>

                {/* Screen (FIXED - no movement) */}
                <div className="bg-gradient-to-br from-slate-950 to-black p-6">
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent 40%)]">
                    {/* content: small dashboard tiles + chart */}
                    <div className="absolute inset-0 p-6 flex flex-col gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        {[80, 95, 120].map((w, i) => (
                          <div key={i} className="p-4 rounded-lg backdrop-blur-sm bg-white/3 border border-white/6">
                            <div className="text-sm text-gray-300">Metric {i + 1}</div>
                            <div className="text-2xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-violet-300">
                              {w}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex-1 rounded-lg p-4 backdrop-blur-sm bg-white/3 border border-white/6 flex items-end gap-3">
                        {/** simple bars */}
                        {[40, 70, 50, 85, 60, 95, 55].map((h, i) => (
                          <div key={i} className="flex-1 flex items-end">
                            <div
                              style={{ height: `${h}%` }}
                              className="w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t from-cyan-400 to-violet-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* subtle reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)' }} />
                  </div>
                </div>
              </div>

              {/* Floating mobile mockup right */}
              <div
                className="absolute -right-10 top-6 w-44 rounded-2xl overflow-hidden card-glass p-3 shadow-xl"
                style={{ transform: 'translateY(-8px)', animation: 'floatSlow 6s ease-in-out infinite' }}
                aria-hidden
              >
                <div className="bg-black rounded-xl aspect-[9/20] p-3">
                  <div className="h-1.5 w-12 bg-gray-700 rounded-full mx-auto mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((_) => (
                      <div className="p-3 rounded-xl bg-white/3 border border-white/6" key={_}>
                        <div className="h-2 w-10 bg-white/20 rounded-full mb-2" />
                        <div className="h-1.5 w-16 bg-white/20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating tablet left */}
              <div
                className="absolute -left-8 bottom-6 w-56 rounded-3xl overflow-hidden card-glass p-3 shadow-xl"
                style={{ transform: 'translateY(6px)', animation: 'floatSlow 7s ease-in-out infinite reverse' }}
                aria-hidden
              >
                <div className="bg-black rounded-2xl aspect-[4/3] p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-14 rounded-lg bg-white/4 border border-white/6" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              {stats.map((s, idx) => (
                <div key={idx} className="text-center p-4 card-glass rounded-xl border border-white/6">
                  <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-violet-300">
                    {s.number}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Built for Excellence
            </h2>
            <p className="text-lg text-gray-400 mt-3">Deliberate design, enterprise-grade reliability, human-centered UX.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <article
                key={i}
                className="relative p-6 rounded-2xl card-glass border border-white/6 overflow-hidden group"
                style={{ minHeight: 180 }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity rounded-2xl`} style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.02), transparent)` }} />
                <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-4 ${f.gradient}`}>
                  <div className="bg-clip-text text-transparent">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{f.description}</p>
                <div className="mt-auto flex items-center gap-2 text-sm text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-medium">Learn more</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent)' }} />
          <div className="relative card-glass rounded-[2rem] p-12 border border-white/8">
            <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to transform education?</h2>
            <p className="text-gray-300 mb-8">Join institutions using AITS to deliver better outcomes — secure, private, and powerful.</p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 shadow-lg">
                  <span className="flex items-center gap-3">
                    Get Started Now
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                </Button>
              </Link>

              <Button size="lg" className="px-10 py-4 rounded-2xl card-glass border border-white/8">
                Schedule Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/6">
              <div className="text-center">
                <div className="text-xl font-bold">10K+</div>
                <div className="text-sm text-gray-300">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">500+</div>
                <div className="text-sm text-gray-300">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">98%</div>
                <div className="text-sm text-gray-300">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-lg p-2 bg-gradient-to-br from-blue-500 to-violet-500">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="text-white font-semibold">AITS</div>
          </div>
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} AITS — Extreme Student Monitoring System. All rights reserved.</div>
          <div className="text-xs text-gray-500 mt-1">Designed with care • Built for institutions</div>
        </div>
      </footer>
    </div>
  );
}
