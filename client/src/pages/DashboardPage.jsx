import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiBook,
  FiSend,
  FiFolder,
  FiMessageSquare,
  FiBarChart2,
  FiArrowRight,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiFileText,
  FiClock,
  FiAward,
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';

// --- Admin dashboard subcomponents with static data ---

const ADMIN_SUMMARY = [
  {
    key: 'students',
    label: 'Total Students',
    value: '4,289',
    trend: '+12% from last month',
    trendPositive: true,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: FiUsers,
  },
  {
    key: 'lecturers',
    label: 'Total Lecturers',
    value: '312',
    trend: '+4% from last month',
    trendPositive: true,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    icon: FiUserCheck,
  },
  {
    key: 'pending',
    label: 'Pending Reviews',
    value: '156',
    trend: 'Awaiting lecturer action',
    trendPositive: false,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: FiClock,
  },
  {
    key: 'published',
    label: 'Published Portfolios',
    value: '8,942',
    trend: '+24% from last month',
    trendPositive: true,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    icon: FiAward,
  },
];

const ADMIN_SUBMISSIONS = [
  {
    title: 'Brand Identity Revamp',
    student: 'John Doe',
    lecturer: 'Prof. Smith',
    status: 'In Review',
    statusVariant: 'warning',
    date: 'Today, 10:30 AM',
  },
  {
    title: 'UI/UX Mobile App Design',
    student: 'Jane Roe',
    lecturer: 'Dr. Alan',
    status: 'Published',
    statusVariant: 'success',
    date: 'Yesterday',
  },
  {
    title: 'Interactive Web Documentary',
    student: 'Mike Lee',
    lecturer: 'Prof. Smith',
    status: 'Needs Revision',
    statusVariant: 'danger',
    date: 'Oct 24, 2023',
  },
  {
    title: '3D Animation Short Film',
    student: 'Sarah Connor',
    lecturer: 'Dr. Chen',
    status: 'Submitted',
    statusVariant: 'info',
    date: 'Oct 22, 2023',
  },
];

const ADMIN_ACTIVITY = [
  {
    type: 'user',
    title: 'Admin created new user',
    description: 'Created lecturer account for Dr. Alice.',
    time: '10 mins ago',
  },
  {
    type: 'portfolio',
    title: 'Portfolio Taken Down',
    description: 'Admin removed project ID #4592 due to invalidity.',
    time: '1 hour ago',
  },
  {
    type: 'batch',
    title: 'Batch Student Import',
    description: 'Successfully mapped 120 students to workspaces.',
    time: '3 hours ago',
  },
];

function AdminSummaryCards() {
  return (
    <section aria-label="Key metrics" className="mb-6 md:mb-8">
      <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-4">
        {ADMIN_SUMMARY.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="bg-base-100 rounded-2xl border border-base-200/80 p-4 sm:p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5e6c84]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#303030] flex items-center gap-1">
                    {item.value}
                    {item.key === 'students' && (
                      <FiTrendingUp className="w-4 h-4 text-emerald-500" aria-hidden />
                    )}
                  </p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}
                >
                  {Icon && <Icon className={`w-5 h-5 ${item.iconColor}`} aria-hidden />}
                </div>
              </div>
              <p
                className={`mt-2 text-xs font-medium ${
                  item.trendPositive ? 'text-emerald-600' : 'text-[#5e6c84]'
                }`}
              >
                {item.trend}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusBadge({ label, variant }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    default: 'bg-base-200 text-[#303030]/80 border border-base-300',
  }[variant || 'default'];

  return (
    <span className={`${base} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" aria-hidden />
      {label}
    </span>
  );
}

function AdminRecentSubmissions() {
  return (
    <section className="bg-base-100 rounded-2xl border border-base-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-b border-base-200/70">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-[#303030]">
            Recent Submissions Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#5e6c84] mt-1">
            Snapshot of the latest portfolio activities across workspaces.
          </p>
        </div>
        <Link
          to="/admin/supervision"
          className="inline-flex items-center justify-end gap-1 text-xs font-medium text-[#3B613A] hover:text-[#264324] transition-colors"
        >
          View All
          <FiArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>

      {/* Desktop/tablet: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-[#5e6c84]">
              <th className="px-4 sm:px-5 py-3">Project Title</th>
              <th className="px-4 sm:px-5 py-3">Student</th>
              <th className="px-4 sm:px-5 py-3 hidden sm:table-cell">Lecturer</th>
              <th className="px-4 sm:px-5 py-3">Status</th>
              <th className="px-4 sm:px-5 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_SUBMISSIONS.map((row, idx) => (
              <tr
                key={row.title}
                className={`text-xs sm:text-sm text-[#303030]/80 ${
                  idx !== ADMIN_SUBMISSIONS.length - 1 ? 'border-b border-base-200/70' : ''
                }`}
              >
                <td className="px-4 sm:px-5 py-3.5">
                  <p className="font-medium text-[#303030]">{row.title}</p>
                  <p className="mt-0.5 text-[11px] text-[#5e6c84] sm:hidden">
                    {row.student} • {row.lecturer}
                  </p>
                </td>
                <td className="px-4 sm:px-5 py-3.5 align-middle">
                  {row.student}
                </td>
                <td className="px-4 sm:px-5 py-3.5 align-middle hidden sm:table-cell">
                  {row.lecturer}
                </td>
                <td className="px-4 sm:px-5 py-3.5 align-middle">
                  <StatusBadge label={row.status} variant={row.statusVariant} />
                </td>
                <td className="px-4 sm:px-5 py-3.5 align-middle text-right text-[#5e6c84]">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards for better readability */}
      <div className="sm:hidden divide-y divide-base-200">
        {ADMIN_SUBMISSIONS.map((row) => (
          <div key={row.title} className="px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#303030]">{row.title}</p>
                <p className="mt-0.5 text-[11px] text-[#5e6c84]">
                  {row.student} • {row.lecturer}
                </p>
              </div>
              <StatusBadge label={row.status} variant={row.statusVariant} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#9ca3af]">
              <span>{row.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityIcon({ type }) {
  const base =
    'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold';
  if (type === 'user') return <div className={`${base} bg-sky-500`}>U</div>;
  if (type === 'portfolio') return <div className={`${base} bg-rose-500`}>P</div>;
  if (type === 'batch') return <div className={`${base} bg-emerald-500`}>B</div>;
  return (
    <div className={`${base} bg-[#3B613A]`}>
      <FiFileText className="w-4 h-4" aria-hidden />
    </div>
  );
}

function AdminActivityLog() {
  return (
    <section className="bg-base-100 rounded-2xl border border-base-200/80 shadow-sm h-full flex flex-col">
      <div className="px-4 sm:px-5 py-4 border-b border-base-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base font-semibold text-[#303030]">Activity Log</h2>
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#3B613A] hover:text-[#264324] transition-colors self-start sm:self-auto"
        >
          View All
          <FiArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>
      <div className="px-4 sm:px-5 py-4 space-y-3 sm:space-y-4">
        {ADMIN_ACTIVITY.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="mt-0.5">
              <ActivityIcon type={item.type} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#303030]">{item.title}</p>
              <p className="text-xs text-[#5e6c84] mt-0.5">{item.description}</p>
              <p className="text-[11px] text-[#9ca3af] mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminQuickLinks({ sections }) {
  if (!sections.length) return null;

  return (
    <section className="mb-6 md:mb-8">
      <h2 className="text-sm font-semibold text-[#5e6c84] mb-3 uppercase tracking-wide">
        Quick navigation
      </h2>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group bg-base-100 rounded-2xl border border-base-200/80 px-4 py-4 flex items-start gap-3 hover:border-[#3B613A]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#3B613A]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#3B613A]/12">
              <Icon className="w-5 h-5 text-[#3B613A]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#303030] group-hover:text-[#3B613A]">
                {title}
              </p>
              <p className="text-xs text-[#5e6c84] mt-0.5 line-clamp-2">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// --- Main page ---

export default function DashboardPage() {
  const { user, authLoading } = useSelector((state) => state.auth);

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

  const role = user?.role;

  const adminSections = [
    {
      to: '/admin/users',
      title: 'User Management',
      desc: 'Create, edit, activate or deactivate users',
      icon: FiUsers,
    },
    {
      to: '/admin/supervision',
      title: 'Supervision Monitoring',
      desc: 'Monitor submission status across workspaces',
      icon: FiBarChart2,
    },
    {
      to: '/admin/reports',
      title: 'Analytics & Reports',
      desc: 'Generate and view reports',
      icon: FiBarChart2,
    },
  ];

  const lecturerSections = [
    {
      to: '/lecturer/workspaces',
      title: 'My Workspaces',
      desc: 'Create and manage workspaces for courses',
      icon: FiGrid,
    },
    {
      to: '/lecturer/students',
      title: 'Student List',
      desc: 'Upload via Excel or add students manually',
      icon: FiUsers,
    },
    {
      to: '/lecturer/cards',
      title: 'Define Cards',
      desc: 'Create cards, set type & quantity, assign to students or groups',
      icon: FiBook,
    },
    {
      to: '/lecturer/review',
      title: 'Review Submissions',
      desc: 'Review, approve or request revisions',
      icon: FiSend,
    },
  ];

  const studentSections = [
    {
      to: '/student/workspace',
      title: 'My Workspace',
      desc: 'Enter your workspace and view assigned cards',
      icon: FiFolder,
    },
    {
      to: '/student/submit',
      title: 'Submit Portfolio',
      desc: 'Submit project or portfolio content',
      icon: FiSend,
    },
    {
      to: '/student/feedback',
      title: 'View Feedback',
      desc: 'See lecturer feedback and submit revisions',
      icon: FiMessageSquare,
    },
  ];

  const nonAdminSections =
    role === 'lecturer'
      ? lecturerSections
      : role === 'student'
        ? studentSections
        : [];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />

        {role === 'admin' ? (
          <>
            {/* Header row */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#303030]">
                    Welcome back, {firstName}!
                  </h1>
                  <p className="mt-1 text-sm text-[#5e6c84]">
                    Here&apos;s what&apos;s happening on Inkcuba today.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3B613A]/8 text-[#3B613A] text-xs font-medium capitalize">
                    <FiCheckCircle className="w-4 h-4" aria-hidden />
                    {role}
                    <span className="h-1 w-1 rounded-full bg-[#3B613A]" />
                    {today}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#3B613A] hover:bg-[#264324] text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    Add User
                  </Link>
                  <Link
                    to="/admin/reports"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-base-100 border border-base-300 hover:border-[#3B613A]/30 text-[#303030] text-sm font-medium transition-colors"
                  >
                    <FiFileText className="w-4 h-4" aria-hidden />
                    Generate Report
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick navigation just below header */}
            <AdminQuickLinks sections={adminSections} />

            {/* Summary cards */}
            <AdminSummaryCards />

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <AdminRecentSubmissions />
              <AdminActivityLog />
            </div>
          </>
        ) : (
          <>
            {/* Generic dashboard for lecturer / student */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#303030]">
                    Hello, {firstName}
                  </h1>
                  <p className="text-[#303030]/60 mt-1">Welcome to your dashboard</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#303030]/50">
                  <FiCalendar className="w-4 h-4" />
                  {today}
                </div>
              </div>
              {role && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3B613A]/8 text-[#3B613A] text-sm font-medium capitalize">
                  {role}
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {nonAdminSections.map(({ to, title, desc, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group relative bg-base-100 rounded-2xl border border-base-200/80 p-6 hover:shadow-lg hover:border-[#3B613A]/20 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#3B613A]/8 flex items-center justify-center mb-4 group-hover:bg-[#3B613A]/12 group-hover:scale-105 transition-all">
                    <Icon className="w-6 h-6 text-[#3B613A]" aria-hidden />
                  </div>
                  <h2 className="text-lg font-semibold text-[#303030] group-hover:text-[#3B613A] transition-colors">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#303030]/60 leading-relaxed">{desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-[#3B613A] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <FiArrowRight className="w-4 h-4" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
