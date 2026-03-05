import { Link } from 'react-router-dom';
import { FiCheckCircle, FiStar } from 'react-icons/fi';

/**
 * Single project card for Featured Projects section.
 * Layout per reference: image, verified badge, category + rating row, title, description, author + View link.
 */
export default function ProjectCard({
  imageUrl,
  imageAlt,
  category,
  title,
  description,
  rating,
  authorName,
  authorAvatarUrl,
  to = '/projects',
}) {
  return (
    <article className="group bg-white rounded-2xl border border-base-200/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      <Link to={to} className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-[#e5e7eb] overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-[#e5e7eb]"
              aria-hidden
            >
              <span className="text-4xl font-bold text-[#9ca3af]">P</span>
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500 text-white text-xs font-medium shadow-sm">
            <FiCheckCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            Verified
          </span>
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
          {/* Category (left) + Rating (right) on same row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#303030]/80">
              {category}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#303030]/80 flex-shrink-0">
              <FiStar className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden />
              {rating}
            </span>
          </div>
          <h3 className="mt-2 text-base sm:text-lg font-bold text-[#303030] line-clamp-2 group-hover:text-[#3B613A] transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-[#303030]/60 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>

          {/* Author (left) + View link (right) */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#3B613A]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {authorAvatarUrl ? (
                  <img
                    src={authorAvatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#3B613A] uppercase">
                    {authorName?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <span className="text-sm text-[#303030]/70 truncate">{authorName}</span>
            </div>
            <span className="text-sm font-medium text-[#3B613A] whitespace-nowrap flex-shrink-0 group-hover:underline">
              View →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
