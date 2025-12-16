import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import LogoImg from "../../assets/inkcuba-logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#1B211A] text-[#F1F3E0] py-6 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* 1. Logo & Brand */}
          <div className="flex items-center gap-1">
            <img src={LogoImg} alt="logo-image" className="w-10 h-10" />
            <span className="text-lg font-bold tracking-wide">InkCuba</span>
          </div>

          {/* 2. Copyright */}
          <div className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} InkCuba. All rights reserved.
          </div>

          {/* 3. Social Icons */}
          <div className="flex gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
