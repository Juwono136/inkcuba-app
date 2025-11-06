import { Link } from 'react-router-dom'
import logo from '../assets/inkcuba.png'

const Footer = () => {
  return (
    <footer className="bg-base-200 py-6 px-4 lg:px-8 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="flex items-center gap-2 mb-4 md:mb-0">
          <img src={logo} alt="Inkcuba Logo" className="h-6 w-auto" />
          <span className="text-lg font-semibold">Inkcuba</span>
        </Link>
        <p className="text-sm text-base-content/70">
          © 2025 Inkcuba. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
