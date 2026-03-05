import { useState, useRef, useEffect } from 'react';

/**
 * Combobox: manual text input + dropdown of suggestions from previous values.
 * @param {string} value - controlled value
 * @param {function} onChange - (value) => void
 * @param {string[]} options - list of suggested values (e.g. from previous entries)
 * @param {string} placeholder
 * @param {string} label
 * @param {string} labelAlt - optional alt text (e.g. hint) shown next to label
 * @param {boolean} required
 * @param {string} className
 * @param {string} inputClassName - optional class for the input (default: input-sm rounded-lg pr-8)
 * @param {string} dropdownClassName - optional class for the dropdown list (e.g. z-[100] to appear above other sections)
 * @param {string} id
 */
export default function Combobox({
  value,
  onChange,
  options = [],
  placeholder = '',
  label = '',
  labelAlt = '',
  required = false,
  className = '',
  inputClassName = 'input input-bordered input-sm w-full rounded-lg pr-8',
  dropdownClassName = '',
  id,
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  const uniqueOptions = [...new Set(options.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  const showDropdown = open && uniqueOptions.length > 0;
  const filteredOptions = !value
    ? uniqueOptions
    : uniqueOptions.filter((opt) =>
        opt.toLowerCase().includes(value.toLowerCase())
      );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`form-control w-full ${className}`}>
      {label && (
        <label className="label py-0 mb-0.5" htmlFor={id}>
          <span className="label-text text-sm font-medium text-[#303030]">
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </span>
          {labelAlt && (
            <span className="label-text-alt text-[#303030]/50">{labelAlt}</span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          className={inputClassName}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          required={required}
          autoComplete="off"
        />
        {uniqueOptions.length > 0 && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-[#303030]/50 hover:text-[#303030] hover:bg-base-200 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Show suggestions"
            aria-expanded={showDropdown}
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        {showDropdown && (
          <ul
            className={`absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-base-200 bg-base-100 shadow-lg py-1 text-sm ${dropdownClassName}`.trim()}
            role="listbox"
          >
            {filteredOptions.slice(0, 20).map((opt) => (
              <li
                key={opt}
                role="option"
                aria-selected={value === opt}
                className="px-3 py-2.5 cursor-pointer hover:bg-[#3B613A]/10 text-[#303030] truncate transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2.5 text-[#303030]/50 text-xs">
                No matching program. Type to add new.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
