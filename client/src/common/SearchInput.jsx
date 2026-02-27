import { FiSearch } from 'react-icons/fi';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  label,
  id = 'search-input',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[#303030]/70">
          {label}
        </label>
      )}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#303030]/40 pointer-events-none z-10" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input input-bordered w-full pl-10 h-11 rounded-xl text-sm border-base-300 bg-base-100 focus:border-[#3B613A]/50 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}
