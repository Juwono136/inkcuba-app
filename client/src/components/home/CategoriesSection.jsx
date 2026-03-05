import { Link } from 'react-router-dom';
import {
  FiCpu,
  FiImage,
  FiBriefcase,
  FiPackage,
  FiBook,
  FiTrendingUp,
  FiCode,
  FiLayers,
} from 'react-icons/fi';

const PROGRAMS = [
  { name: 'Computer Science', slug: 'Computer Science', icon: FiCpu },
  { name: 'Graphic Design', slug: 'Graphic Design', icon: FiImage },
  { name: 'Business Management', slug: 'Business Management', icon: FiBriefcase },
  { name: 'Game Development', slug: 'Game Development', icon: FiPackage },
  { name: 'Digital Marketing', slug: 'Digital Marketing', icon: FiTrendingUp },
  { name: 'Information Systems', slug: 'Information Systems', icon: FiCode },
  { name: 'Multimedia', slug: 'Multimedia', icon: FiLayers },
  { name: 'International Business', slug: 'International Business', icon: FiBook },
];

/**
 * Categories section: program cards with icon and animation. Click navigates to /projects?program=...
 */
export default function CategoriesSection() {
  return (
    <section className="bg-white border-t border-base-200/60 pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#303030] tracking-tight mb-6 sm:mb-8">
          Browse by Program
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {PROGRAMS.map(({ name, slug, icon: Icon }) => (
            <Link
              key={slug}
              to={`/projects?program=${encodeURIComponent(slug)}`}
              className="category-card group flex flex-col items-center sm:items-start p-4 sm:p-5 rounded-2xl bg-[#F0F2E5] border border-base-200/60 hover:border-[#3B613A]/30 hover:shadow-lg hover:bg-[#3B613A]/5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-base-200/60 flex items-center justify-center text-[#3B613A] group-hover:scale-110 group-hover:bg-[#3B613A]/10 transition-transform duration-300 shadow-sm">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" aria-hidden />
              </div>
              <span className="mt-3 text-sm sm:text-base font-semibold text-[#303030] text-center sm:text-left group-hover:text-[#3B613A] transition-colors line-clamp-2">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
