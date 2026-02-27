import Navbar from '../components/layout/Navbar';
import { FiCheckCircle, FiUsers, FiLayers, FiShield } from 'react-icons/fi';

export default function AboutPage() {
  const points = [
    {
      icon: FiCheckCircle,
      title: 'Verified by Lecturers',
      desc: 'Every project and portfolio is reviewed, assessed, and approved by the course lecturer before being published.',
    },
    {
      icon: FiUsers,
      title: 'Multi-Role System',
      desc: 'Admin manages users, Lecturers create workspaces and review submissions, Students submit their portfolios.',
    },
    {
      icon: FiLayers,
      title: 'Rich Media Support',
      desc: 'Portfolios can include descriptions, images (up to 5), posters, videos, PDF reports, URL links, and code repositories.',
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      desc: 'Role-based access control, secure authentication, and data protection for all users.',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#303030] tracking-tight">About Inkcuba</h1>
          <p className="mt-3 text-[#303030]/70 text-lg leading-relaxed max-w-2xl">
            Inkcuba is a web application for collecting and showcasing verified student portfolios and projects from Binus University International.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-base-100 rounded-2xl border border-base-200/80 p-6">
              <div className="w-10 h-10 rounded-xl bg-[#3B613A]/8 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-[#3B613A]" />
              </div>
              <h3 className="font-semibold text-[#303030]">{title}</h3>
              <p className="mt-1.5 text-sm text-[#303030]/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-[#303030]/40">
          Inkcuba · Binus University International
        </div>
      </main>
    </div>
  );
}
