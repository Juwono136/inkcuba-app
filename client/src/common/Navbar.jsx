import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import logo from '../assets/inkcuba.png'
import { FaPlus, FaUser } from 'react-icons/fa'

const Navbar = () => {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="navbar bg-base-100 shadow-sm px-4 lg:px-8">
      <div className="flex-1 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Inkcuba Logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold">Inkcuba</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            to="/"
            className={`text-base ${
              isActive('/') ? 'font-semibold' : 'text-base-content/70'
            } hover:text-base-content`}
          >
            Home
          </Link>
          <Link
            to="/projects"
            className={`text-base ${
              isActive('/projects') ? 'font-semibold' : 'text-base-content/70'
            } hover:text-base-content`}
          >
            Projects
          </Link>
          <Link
            to="/student-dashboard"
            className={`text-base ${
              isActive('/student-dashboard') ? 'font-semibold' : 'text-base-content/70'
            } hover:text-base-content`}
          >
            Dashboard
          </Link>
          <Link
            to="/categories"
            className={`text-base ${
              isActive('/categories') ? 'font-semibold' : 'text-base-content/70'
            } hover:text-base-content`}
          >
            Categories
          </Link>
          <Link
            to="/about"
            className={`text-base ${
              isActive('/about') ? 'font-semibold' : 'text-base-content/70'
            } hover:text-base-content`}
          >
            About
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-sm btn-circle">
              <FaPlus className="w-5 h-5" />
            </button>
            <button className="btn btn-ghost btn-sm btn-circle">
              <FaUser className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex gap-2">
            <Link to="/select-role" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/select-role" className="btn bg-black text-white hover:bg-black/90 btn-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar

