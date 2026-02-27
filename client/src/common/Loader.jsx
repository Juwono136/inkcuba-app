/**
 * Reusable loader. Use for buttons, pages, or inline.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - wrapper div class
 * @param {string} text - optional label below spinner
 */
export default function Loader({ size = 'md', className = '', text = '' }) {
  const sizeClass = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  }[size] || 'loading-md';

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <span
        className={`loading loading-spinner ${sizeClass} text-[#3B613A]`}
        aria-hidden="true"
      />
      {text && (
        <span className="text-sm text-base-content/70">{text}</span>
      )}
    </div>
  );
}
