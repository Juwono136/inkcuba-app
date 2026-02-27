/**
 * Reusable skeleton loading placeholder.
 * @param {string} variant - 'text' | 'line' | 'card' | 'avatar' | 'custom'
 * @param {number} lines - for variant 'text', number of lines
 * @param {string} className - wrapper class
 * @param {object} style - optional inline style
 */
export default function Skeleton({ variant = 'line', lines = 3, className = '', style = {} }) {
  const baseClass = 'animate-pulse bg-base-300 rounded';

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`} style={style}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClass} h-4`}
            style={{ width: i === lines - 1 && lines > 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`card bg-base-100 border border-base-200 ${className}`} style={style}>
        <div className={`${baseClass} h-40 rounded-t-2xl`} />
        <div className="card-body">
          <div className={`${baseClass} h-5 w-3/4 mb-2`} />
          <div className={`${baseClass} h-4 w-full mb-1`} />
          <div className={`${baseClass} h-4 w-5/6`} />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`${baseClass} rounded-full aspect-square w-12 h-12 ${className}`} style={style} />
    );
  }

  if (variant === 'custom') {
    return <div className={`${baseClass} ${className}`} style={style} />;
  }

  return <div className={`${baseClass} h-4 w-full ${className}`} style={style} />;
}
