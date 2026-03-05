import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronDown } from 'react-icons/fi';

const CURSOR_FACTOR = 0.04;

/**
 * Hero section: cursor-following parallax shapes, gradient animation, scroll-to-featured button.
 */
export default function HeroSection({ isAuthenticated }) {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * CURSOR_FACTOR;
    const y = (e.clientY - centerY) * CURSOR_FACTOR;
    setCursor({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursor({ x: 0, y: 0 });
  }, []);

  // Smooth interpolation toward cursor position (via RAF or state - simple approach: use cursor directly with CSS transition)
  const moveX = cursor.x;
  const moveY = cursor.y;

  const scrollToFeatured = useCallback(() => {
    const el = document.getElementById('featured-projects');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section
      className="relative overflow-hidden hero-bg-animated"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left: large curve – follows cursor (no keyframe to avoid transform conflict) */}
      <div
        className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-white/[0.08] -left-[300px] sm:-left-[400px] top-1/2 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${moveX * 1.5}px, calc(-50% + ${moveY * 1.5}px))`,
        }}
        aria-hidden
      />
      {/* Right: partial circle – follows cursor (opposite direction for depth) */}
      <div
        className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full border-2 border-white/30 right-0 top-1/2 translate-x-1/2 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${-moveX}px, calc(-50% + ${-moveY * 0.8}px))`,
        }}
        aria-hidden
      />
      {/* Center glow – subtle, follows cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        aria-hidden
      >
        <div
          className="absolute w-[min(80vw,600px)] h-[min(80vw,600px)] rounded-full bg-white/[0.03] blur-3xl transition-all duration-500 ease-out"
          style={{
            left: `calc(50% + ${moveX * 8}px)`,
            top: `calc(50% + ${moveY * 8}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1.5 mb-4 sm:mb-6 text-[10px] sm:text-xs font-semibold tracking-wider uppercase bg-white/15 text-white rounded-md backdrop-blur-sm">
            BINUS UNIVERSITY INTERNATIONAL
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Showcasing Binus
            <br />
            Excellence
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/90 max-w-lg mx-auto leading-relaxed px-1">
            Discover verified student portfolios from Binus University International across programs and courses—highlighting innovation and creativity.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-white border border-[#2d4f2c]/40 text-[#303030] hover:bg-white/95 font-medium text-sm sm:text-base transition-colors w-full sm:w-auto"
            >
              Explore Portfolios <FiArrowRight className="w-4 h-4 flex-shrink-0" />
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-[#2d4f2c]/90 border border-white/60 text-white hover:bg-[#3B613A] font-medium text-sm sm:text-base transition-colors w-full sm:w-auto"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/about"
                className="inline-flex items-center justify-center h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-[#2d4f2c]/90 border border-white/60 text-white hover:bg-[#3B613A] font-medium text-sm sm:text-base transition-colors w-full sm:w-auto"
              >
                Learn More
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={scrollToFeatured}
            className="mt-8 sm:mt-10 inline-flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg py-2"
            aria-label="Scroll to Featured Projects"
          >
            <span className="text-xs font-medium uppercase tracking-wider">View featured projects</span>
            <FiChevronDown className="w-8 h-8 hero-scroll-chevron" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
