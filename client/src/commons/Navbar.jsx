import { useMemo, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const cn = (...cls) => cls.filter(Boolean).join(" ");

const navigation = [
  { name: "Home", to: "/" },
  { name: "Projects", to: "/project-browse" },
  { name: "Categories", to: "/categories" },
  { name: "About", to: "/about" },
];

const default_avatar = "https://api.dicebear.com/7.x/thumbs/svg?seed=inkcuba";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(default_avatar);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const { pathname } = useLocation();

  const brand = useMemo(() => "Inkcuba", []);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    // add logout logic later
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-300">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <button
            className="btn btn-ghost md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          <Link
            to="/"
            className="text-xl font-semibold tracking-tight hover:opacity-80"
          >
            {brand}
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 text-sm rounded-btn transition-colors",
                      isActive
                        ? "bg-base-200 font-semibold"
                        : "hover:bg-base-100 text-gray-700"
                    )
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Upload Button */}
              <Link
                to="/choose-submission"
                className="btn btn-ghost btn-circle"
                aria-label="Upload project"
                title="Upload Project"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
              </Link>

              {/* Notifications */}
              <button
                type="button"
                className="btn btn-ghost btn-circle"
                aria-label="View notifications"
                title="Notifications"
              >
                <BellIcon className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-9 rounded-full overflow-hidden">
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      onError={(e) => {
                        e.currentTarget.src = default_avatar;
                      }}
                    />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li className="menu-title px-3 py-2">
                    <span className="text-xs opacity-70">Signed in</span>
                  </li>
                  <li>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2">
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2">
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li>
                    <button 
                      type="button" 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Sign out</span>
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Logged Out State - Show Sign In on all screen sizes */}
              <button
                onClick={handleSignIn}
                className="btn btn-ghost text-sm font-medium"
              >
                Sign In
              </button>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-[max-height] duration-300 border-t border-[#E5E5E5]",
          mobileOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <ul className="menu px-4 py-2">
          {navigation.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.to} onClick={() => setMobileOpen(false)}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={cn(
                    "rounded-btn",
                    active ? "bg-base-200 font-semibold" : undefined
                  )}
                >
                  {item.name}
                </NavLink>
              </li>
            );
          })}
          {!isLoggedIn && (
            <li className="mt-2">
              <Link
                to="/signup"
                className="btn btn-neutral w-full"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}