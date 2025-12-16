import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, reset } from "../../features/auth/authSlice";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LogoImg from "../../assets/inkcuba-logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logoutUser());
    dispatch(reset());
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          {/* 1. Logo (Animated Hover) */}
          <div className="shrink-0 flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 300 }}>
              <img src={LogoImg} alt="logo-image" className="w-10 h-10" />
            </motion.div>
            <span className="text-xl md:text-2xl font-bold text-[#1B211A] tracking-tight">
              InkCuba
            </span>
          </div>

          {/* 2. Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-200 
                  ${
                    isActive(link.path)
                      ? "text-[#1B211A] font-bold"
                      : "text-gray-500 hover:text-[#1B211A]"
                  }
                `}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 top-full block h-0.5 w-full bg-[#1B211A] mt-1"
                  />
                )}
              </Link>
            ))}

            {/* Auth Buttons */}
            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
              {user ? (
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-circle avatar border border-gray-200 hover:border-[#1B211A] transition-all"
                  >
                    <div className="w-10 rounded-full">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=1B211A&color=fff`}
                        alt="avatar"
                      />
                    </div>
                  </label>
                  <ul
                    tabIndex={0}
                    className="mt-3 z-1 p-2 shadow-lg menu menu-sm dropdown-content bg-white rounded-box w-52 border border-gray-100"
                  >
                    <li className="menu-title text-[#1B211A] opacity-50">Hello, {user.name}</li>
                    <li>
                      <Link
                        to="/dashboard"
                        className="hover:bg-[#F1F3E0] active:bg-[#1B211A] active:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <button onClick={onLogout} className="text-red-500 hover:bg-red-50">
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn bg-[#1B211A] text-[#F1F3E0] hover:bg-black border-none px-6 min-h-10 normal-case font-medium rounded-lg shadow-sm"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {/* 3. Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#1B211A] focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Menu Dropdown (Animasi Slide Down, Tidak Full Screen) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-lg absolute w-full left-0 top-full"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all
                    ${
                      isActive(link.path)
                        ? "text-[#1B211A] bg-[#F1F3E0]"
                        : "text-gray-600 hover:text-[#1B211A] hover:bg-gray-50"
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-gray-100 pt-4 mt-2">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-[#1B211A] text-white flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-[#1B211A]">{user.name}</span>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-sm btn-outline w-full normal-case"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={onLogout}
                      className="btn btn-sm btn-error btn-outline w-full normal-case"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn w-full bg-[#1B211A] text-white hover:bg-black border-none normal-case"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
