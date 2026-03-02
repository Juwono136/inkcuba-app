import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiLayout, FiLogIn } from 'react-icons/fi';
import logo from '../../assets/images/inkcuba-logo.png';

function getSidebarAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) return avatarUrl;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/uploads/avatars/${avatarUrl}`;
}

function SidebarLink({ to, label, icon: Icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
        ${active
          ? 'text-[#3B613A] bg-[#3B613A]/8 border-l-4 border-[#3B613A]'
          : 'text-[#303030]/80 hover:text-[#3B613A] hover:bg-[#F0F2E5]'
        }
      `}
    >
      {Icon && (
        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#3B613A]' : 'text-[#303030]/45'}`} />
      )}
      {label}
    </Link>
  );
}

export default function Sidebar({
  open,
  onClose,
  mainNav,
  roleMenus,
  isAuthenticated,
  user,
  isActive,
}) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-base-100 shadow-2xl flex flex-col transform transition-transform duration-200 ease-out translate-x-0"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-base-200/60 flex-shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <img src={logo} alt="Inkcuba" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg text-[#3B613A]">Inkcuba</span>
          </Link>
          <button
            ref={closeBtnRef}
            type="button"
            className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-base-200 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5 text-[#303030]/70" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-1">
            {mainNav.map((item) => (
              <SidebarLink
                key={item.to}
                {...item}
                active={isActive(item.to)}
                onClick={onClose}
              />
            ))}
          </div>

          {isAuthenticated ? (
            <>
              <div className="my-3 border-t border-base-200/60" />
              <p className="px-4 py-1.5 text-[11px] font-semibold text-base-content/40 uppercase tracking-widest">
                Dashboard
              </p>
              <div className="mt-1 space-y-1">
                <SidebarLink
                  to="/dashboard"
                  label="Dashboard"
                  icon={FiLayout}
                  active={isActive('/dashboard')}
                  onClick={onClose}
                />
                {roleMenus.map((item) => (
                  <SidebarLink
                    key={item.to}
                    {...item}
                    active={isActive(item.to)}
                    onClick={onClose}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="my-3 border-t border-base-200/60" />
              <SidebarLink
                to="/login"
                label="Sign in"
                icon={FiLogIn}
                active={isActive('/login')}
                onClick={onClose}
              />
            </>
          )}
        </nav>

        {isAuthenticated && user ? (
          <div className="border-t border-base-200/60 p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-[#3B613A] text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold overflow-hidden">
                {getSidebarAvatarUrl(user?.avatarUrl) ? (
                  <img
                    src={getSidebarAvatarUrl(user.avatarUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#303030] truncate">{user.name}</p>
                <p className="text-xs text-base-content/50 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
