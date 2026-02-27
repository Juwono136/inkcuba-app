import { FiInstagram, FiYoutube, FiGlobe } from 'react-icons/fi';
import inkcubaLogo from '../../assets/images/inkcuba-logo.png';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base-200 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src={inkcubaLogo} alt="Inkcuba" className="w-8 h-8 rounded-md object-contain" />
              <span className="font-semibold text-[#303030] text-lg">Inkcuba</span>
            </div>
            <p className="text-sm text-[#303030]/65 leading-relaxed max-w-xs">
              A collaborative platform to manage academic portfolios and verification workflows
              between students, lecturers, and administrators.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-[#303030]/70 hover:text-[#3B613A] hover:bg-[#3B613A]/10 transition-colors"
                aria-label="Inkcuba on Instagram"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-[#303030]/70 hover:text-[#3B613A] hover:bg-[#3B613A]/10 transition-colors"
                aria-label="Inkcuba on YouTube"
              >
                <FiYoutube className="w-4 h-4" />
              </a>
              <a
                href="https://example.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center text-[#303030]/70 hover:text-[#3B613A] hover:bg-[#3B613A]/10 transition-colors"
                aria-label="Inkcuba website"
              >
                <FiGlobe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-[#303030]/70 uppercase mb-3">
              Project
            </h3>
            <ul className="space-y-2 text-sm text-[#303030]/70">
              <li>Project list</li>
              <li>Program list</li>
              <li>Batch list</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-[#303030]/70 uppercase mb-3">
              About
            </h3>
            <ul className="space-y-2 text-sm text-[#303030]/70">
              <li>About us</li>
              <li>Contact</li>
              <li>Privacy &amp; terms</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-base-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#303030]/60">
          <p>© {year} Inkcuba. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

