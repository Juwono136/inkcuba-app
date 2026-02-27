import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import Loader from '../common/Loader';
import { FiCheckCircle, FiUsers, FiLayers, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  const { user, isAuthenticated, authLoading } = useSelector((state) => state.auth);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loader size="lg" className="min-h-[50vh]" text="Loading..." />
        </main>
      </div>
    );
  }

  const features = [
    {
      icon: FiCheckCircle,
      title: 'Verified Portfolios',
      desc: 'Every project is reviewed and approved by the course lecturer before it goes live.',
    },
    {
      icon: FiUsers,
      title: 'Managed by Lecturers',
      desc: 'Lecturers create workspaces, assign cards, and assess student submissions.',
    },
    {
      icon: FiLayers,
      title: 'Rich Content',
      desc: 'Each portfolio can include images, posters, videos, PDF reports, links, and code repositories.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2E5]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider uppercase bg-[#3B613A]/10 text-[#3B613A] rounded-full">
              Binus University International
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#303030] tracking-tight leading-tight">
              Showcase Your <br className="hidden sm:block" />
              <span className="text-[#3B613A]">Verified</span> Portfolio
            </h1>
            <p className="mt-6 text-lg text-[#303030]/70 max-w-lg mx-auto leading-relaxed">
              Inkcuba is the portfolio platform where verified student projects from every program and course come together in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated && user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-[#3B613A] hover:bg-[#4a7549] text-white font-medium text-base transition-colors shadow-md shadow-[#3B613A]/20"
                >
                  Go to Dashboard <FiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-[#3B613A] hover:bg-[#4a7549] text-white font-medium text-base transition-colors shadow-md shadow-[#3B613A]/20"
                >
                  Sign in to continue <FiArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl border-2 border-[#3B613A]/20 text-[#3B613A] hover:bg-[#3B613A]/5 font-medium text-base transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-base-100 rounded-2xl border border-base-200/60 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-[#3B613A]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#3B613A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#303030]">{title}</h3>
              <p className="mt-2 text-sm text-[#303030]/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-200/60 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-[#303030]/50">
          Inkcuba · Binus University International
        </div>
      </footer>
    </div>
  );
}
