import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const FormInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  // Toggle tipe input antara 'text' dan 'password'
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label pb-1">
          <span className="label-text font-semibold text-[#1B211A] text-sm md:text-base">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input input-bordered w-full bg-white text-[#1B211A] 
            placeholder:text-gray-400 focus:outline-none focus:border-[#1B211A] focus:ring-1 focus:ring-[#1B211A] 
            transition-all duration-200 rounded-lg h-11 md:h-12
            ${error ? "input-error" : "border-gray-300"}
            ${isPassword ? "pr-10" : ""} 
          `}
        />

        {/* Ikon Mata untuk Password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B211A] transition-colors focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>

      {/* Pesan Error (Opsional) */}
      {error && (
        <label className="label pt-1">
          <span className="label-text-alt text-red-500">{error}</span>
        </label>
      )}
    </div>
  );
};

export default FormInput;
