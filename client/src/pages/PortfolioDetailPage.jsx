import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import { api } from '../utils/axios';
import { FiArrowLeft, FiFileText, FiLink, FiPlay, FiCheckCircle } from 'react-icons/fi';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
function avatarUrl(avatar) {
  if (!avatar) return null;
  return `${API_BASE}/api/uploads/avatars/${avatar}`;
}

function embedVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function PortfolioDetailPage() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Invalid portfolio ID');
      return;
    }
    setLoading(true);
    setError(null);
    api
      .get(`/api/portfolios/${id}`)
      .then(({ data }) => setPortfolio(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Portfolio not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const videoEmbedUrl = useMemo(
    () => (portfolio?.videoUrl ? embedVideoUrl(portfolio.videoUrl) : null),
    [portfolio?.videoUrl]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <Loader text="Loading portfolio..." />
        </main>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-2xl bg-base-100 border border-base-200 p-8 text-center">
            <p className="text-error font-medium">{error || 'Portfolio not found or not published.'}</p>
            <Link to="/projects" className="btn btn-ghost btn-sm mt-4 gap-2">
              <FiArrowLeft className="w-4 h-4" /> Back to portfolios
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: portfolio.projectName || 'Project' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <Breadcrumb items={breadcrumbs} />
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-[#5e6c84] hover:text-[#3B613A] mt-2 mb-6">
          <FiArrowLeft className="w-4 h-4" /> Back to Discover Portfolios
        </Link>

        <header className="mb-8">
          {portfolio.workspace && (
            <p className="text-sm text-[#5e6c84] mb-1">
              {portfolio.workspace.course}
              {portfolio.workspace.name ? ` · ${portfolio.workspace.name}` : ''}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172b4d] tracking-tight">
            {portfolio.projectName || 'Untitled project'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {portfolio.student && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#3B613A]/20 flex items-center justify-center text-[#3B613A] font-semibold text-sm overflow-hidden">
                  {portfolio.student.avatarUrl ? (
                    <img src={avatarUrl(portfolio.student.avatarUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (portfolio.student.name || 'S').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#172b4d] text-sm">{portfolio.student.name}</p>
                  {portfolio.workspace && (
                    <p className="text-xs text-[#5e6c84]">{portfolio.workspace.course}</p>
                  )}
                </div>
              </div>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium">
              <FiCheckCircle className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </header>

        {portfolio.projectPoster && (
          <section className="mb-8 rounded-2xl overflow-hidden border border-base-200 shadow-sm">
            <img
              src={portfolio.projectPoster}
              alt="Project poster"
              className="w-full aspect-video object-cover"
            />
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-base-100 rounded-2xl border border-base-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#172b4d] mb-3">About this project</h2>
              <div className="prose prose-sm max-w-none text-[#5e6c84] whitespace-pre-wrap">
                {portfolio.description || 'No description provided.'}
              </div>
            </section>

            {portfolio.screenshots && portfolio.screenshots.length > 0 && (
              <section className="bg-base-100 rounded-2xl border border-base-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#172b4d] mb-4">Screenshots</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.screenshots.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden border border-base-200 aspect-video bg-base-200"
                    >
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {videoEmbedUrl && (
              <section className="bg-base-100 rounded-2xl border border-base-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#172b4d] mb-4 flex items-center gap-2">
                  <FiPlay className="w-5 h-5 text-[#3B613A]" /> Walkthrough video
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    title="Video"
                    src={videoEmbedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {portfolio.externalLinks && portfolio.externalLinks.length > 0 && (
              <section className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-[#172b4d] mb-3 flex items-center gap-2">
                  <FiLink className="w-4 h-4 text-[#3B613A]" /> Project links
                </h2>
                <ul className="space-y-2">
                  {portfolio.externalLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#3B613A] hover:underline break-all"
                      >
                        {link.title || link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {portfolio.detailedReport && (
              <section className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-[#172b4d] mb-3 flex items-center gap-2">
                  <FiFileText className="w-4 h-4 text-[#3B613A]" /> Detailed report
                </h2>
                <a
                  href={portfolio.detailedReport}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#3B613A] hover:underline"
                >
                  <FiFileText className="w-4 h-4" />
                  {portfolio.detailedReportFilename || 'Report'} (PDF)
                </a>
              </section>
            )}

            {portfolio.tags && portfolio.tags.length > 0 && (
              <section className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-[#172b4d] mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {portfolio.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#3B613A]/10 text-[#3B613A] text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
