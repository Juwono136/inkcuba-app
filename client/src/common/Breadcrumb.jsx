import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/**
 * @param {{ label: string, to?: string }[]} items
 */
export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="mb-4 text-xs sm:text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[#303030]/60">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <FiChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#303030]/40" />
              )}
              {isLast || !item.to ? (
                <span className="font-medium text-[#303030]">{item.label}</span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-[#3B613A] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

