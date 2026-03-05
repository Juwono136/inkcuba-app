import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiBell, FiChevronDown, FiEdit2, FiGrid, FiLogOut, FiUsers, FiBarChart2, FiBook, FiSend, FiMessageSquare, FiFolder, FiHome, FiInfo, FiLayers } from 'react-icons/fi';
import { HiMenuAlt2 } from "react-icons/hi";
import { logout } from '../../features/auth/authSlice';
import ConfirmModal from '../../common/ConfirmModal';
import Sidebar from './Sidebar';
import NotificationListModal from '../notifications/NotificationListModal';
import { api } from '../../utils/axios';
import logo from '../../assets/images/inkcuba-logo.png';

function getNavbarAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) return avatarUrl;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/uploads/avatars/${avatarUrl}`;
}

function NavLink({ to, label, icon: Icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'text-[#3B613A] bg-[#3B613A]/8'
          : 'text-[#303030]/70 hover:text-[#3B613A] hover:bg-[#F0F2E5]'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {label}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#3B613A] rounded-full" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifListModalOpen, setNotifListModalOpen] = useState(false);
  const [latestNotifs, setLatestNotifs] = useState([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const sidebarBtnRef = useRef(null);
  const wasSidebarOpen = useRef(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const pathname = location.pathname;

  useEffect(() => {
    setSidebarOpen(false);
    setUserDropdownOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (wasSidebarOpen.current && !sidebarOpen) {
      sidebarBtnRef.current?.focus();
    }
    wasSidebarOpen.current = sidebarOpen;
  }, [sidebarOpen]);

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/api/notifications/latest')
      .then(({ data }) => {
        setLatestNotifs(data.data || []);
        setNotifUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {});
  }, [isAuthenticated, notifOpen, notifListModalOpen]);

  const handleLogoutConfirm = () => {
    dispatch(logout());
    setLogoutModalOpen(false);
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname === to || pathname.startsWith(to + '/');
  };

  const role = user?.role;

  const adminMenus = [
    { to: '/admin/users', label: 'User Management', icon: FiUsers },
    { to: '/admin/supervision', label: 'Supervision Monitoring', icon: FiBarChart2 },
    { to: '/admin/reports', label: 'Analytics & Reports', icon: FiBarChart2 },
  ];

  const lecturerMenus = [
    { to: '/lecturer/workspaces', label: 'My Workspaces', icon: FiGrid },
    { to: '/lecturer/students', label: 'Student List', icon: FiUsers },
    { to: '/lecturer/cards', label: 'Define Cards', icon: FiBook },
    { to: '/lecturer/review', label: 'Review Submissions', icon: FiSend },
  ];

  const studentMenus = [
    { to: '/student/workspace', label: 'My Workspace', icon: FiFolder },
    { to: '/student/submit', label: 'Submit Portfolio', icon: FiSend },
    { to: '/student/feedback', label: 'View Feedback', icon: FiMessageSquare },
  ];

  const roleMenus = role === 'admin' ? adminMenus : role === 'lecturer' ? lecturerMenus : role === 'student' ? studentMenus : [];

  const mainNav = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/projects', label: 'Projects', icon: FiLayers },
    { to: '/about', label: 'About', icon: FiInfo },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-base-100/95 backdrop-blur-md border-b border-base-200/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Left */}
          <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
            <button
              type="button"
              ref={sidebarBtnRef}
              className={`flex items-center justify-center h-9 w-9 rounded-lg text-[#303030]/70 hover:bg-base-200 transition-colors ${isAuthenticated ? '' : 'lg:hidden'}`}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <HiMenuAlt2 className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <img src={logo} alt="Inkcuba" className="h-9 w-9 object-contain flex-shrink-0" />
              <span className="font-bold text-xl text-[#3B613A] tracking-tight hidden sm:block">Inkcuba</span>
            </Link>
          </div>

          {/* Center */}
          <nav className="hidden lg:flex items-center" aria-label="Main navigation">
            <div className="flex items-center gap-1">
              {mainNav.map((item) => (
                <NavLink key={item.to} {...item} active={isActive(item.to)} />
              ))}
            </div>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    className={`relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors ${notifOpen ? 'bg-[#3B613A]/8 ring-2 ring-[#3B613A]/20' : 'hover:bg-base-200'}`}
                    onClick={() => setNotifOpen((o) => !o)}
                    aria-haspopup="true"
                    aria-expanded={notifOpen}
                    aria-label="Notifications"
                  >
                    <FiBell className="w-5 h-5 text-[#303030]/70" />
                    {notifUnreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#3B613A]" aria-hidden="true" />}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[90vw] rounded-2xl bg-base-100 border border-base-200/80 shadow-lg overflow-hidden transition-all duration-150 ease-out transform origin-top-right">
                      <div className="px-4 py-3 bg-[#F0F2E5]/50 flex items-center justify-between">
                        <p className="font-semibold text-[#303030]">Notifications</p>
                        <span className="text-xs text-[#303030]/50">{notifUnreadCount > 0 ? `${notifUnreadCount} new` : '0 new'}</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {latestNotifs.length === 0 ? (
                          <div className="p-4">
                            <p className="text-sm text-[#303030]/60">No notifications yet.</p>
                            <p className="text-xs text-[#303030]/40 mt-1">When lecturers add you to a workspace or review your submission, updates will appear here.</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-base-200/60">
                            {latestNotifs.slice(0, 5).map((n) => (
                              <li key={n.id} className={n.read ? '' : 'bg-[#3B613A]/5'}>
                                <div className="px-4 py-2.5 text-left">
                                  <p className="font-medium text-sm text-[#172b4d]">{n.title}</p>
                                  {n.body && <p className="text-xs text-[#5e6c84] mt-0.5 line-clamp-2">{n.body}</p>}
                                  <p className="text-xs text-[#5e6c84] mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="p-2 border-t border-base-200/60">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm w-full text-[#3B613A] font-medium"
                            onClick={() => { setNotifOpen(false); setNotifListModalOpen(true); }}
                          >
                            More / View all
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown (shortcuts only) */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    className={`
                      flex items-center gap-2 rounded-full p-1 pl-1.5 pr-2 transition-colors
                      ${userDropdownOpen ? 'bg-[#3B613A]/8 ring-2 ring-[#3B613A]/20' : 'hover:bg-base-200'}
                    `}
                    onClick={() => setUserDropdownOpen((o) => !o)}
                    aria-haspopup="true"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#3B613A] text-base-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {getNavbarAvatarUrl(user?.avatarUrl) ? (
                        <img
                          src={getNavbarAvatarUrl(user.avatarUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[#303030] truncate max-w-[120px]">
                      {user.name?.split(' ')[0]}
                    </span>
                    <FiChevronDown className="hidden sm:block w-4 h-4 text-[#303030]/50" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-base-100 border border-base-200/80 shadow-lg overflow-hidden transition-all duration-150 ease-out transform origin-top-right">
                      <div className="px-4 py-3 bg-[#F0F2E5]/50">
                        <p className="font-semibold text-[#303030] truncate">{user.name}</p>
                        <p className="text-xs text-base-content/60 truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium bg-[#3B613A]/10 text-[#3B613A] rounded-md capitalize">{user.role}</span>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive('/dashboard') ? 'text-[#3B613A] bg-[#3B613A]/5 font-medium' : 'hover:bg-base-200'}`}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FiGrid className="w-4 h-4 flex-shrink-0" /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive('/profile') ? 'text-[#3B613A] bg-[#3B613A]/5 font-medium' : 'hover:bg-base-200'}`}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FiEdit2 className="w-4 h-4 flex-shrink-0" /> Edit profile
                        </Link>
                      </div>
                      <div className="border-t border-base-200">
                        <button
                          type="button"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 w-full text-left transition-colors"
                          onClick={() => { setUserDropdownOpen(false); setLogoutModalOpen(true); }}
                        >
                          <FiLogOut className="w-4 h-4 flex-shrink-0" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-[#3B613A] hover:bg-[#4a7549] text-white text-sm font-medium transition-colors shadow-sm"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        mainNav={mainNav}
        roleMenus={roleMenus}
        isAuthenticated={isAuthenticated}
        user={user}
        isActive={isActive}
      />

      <NotificationListModal open={notifListModalOpen} onClose={() => setNotifListModalOpen(false)} />

      <ConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign out"
        message="Are you sure you want to sign out? You will need to sign in again to access your account."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        variant="primary"
      />
    </>
  );
}
