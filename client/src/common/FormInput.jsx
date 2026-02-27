import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  autoComplete,
  showPasswordToggle = false,
  className = '',
  ...rest
}) {
  const id = rest.id || name;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);
  const inputType = isPassword && showPasswordToggle && visible ? 'text' : type;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text font-medium">{label}{required && ' *'}</span>
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`input input-bordered w-full pr-10 ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content focus:outline-none p-1 rounded"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="label text-error text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
