import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  options = [],
  rows = 4,
  helperText,
  icon: Icon,
  className = '',
  darkMode = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const labelClass = darkMode
    ? 'text-slate-200'
    : 'text-slate-700';

  const inputClass = [
    'form-control',
    Icon ? 'has-leading-icon' : '',
    isPassword ? 'has-trailing-icon' : '',
    darkMode ? 'form-control-dark' : 'form-control-light',
    error ? 'form-control-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label htmlFor={name} className={`form-label ${labelClass}`}>
          <span>
            {label}
            {required && <span className="form-required"> *</span>}
          </span>
          {helperText && <span className="form-helper">{helperText}</span>}
        </label>
      )}

      <div className="form-control-wrap">
        {Icon && (
          <span className="form-leading-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} />
          </span>
        )}

        {type === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`${inputClass} form-select`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value || opt}
                value={opt.value || opt}
                className="bg-slate-900 text-white"
              >
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`${inputClass} form-textarea`}
            {...props}
          />
        ) : (
          <input
            id={name}
            type={actualType}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClass}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="form-trailing-btn"
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default InputField;
