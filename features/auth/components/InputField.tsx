"use client";

import { useState } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error: FieldError | undefined;
}

const InputField = ({
  label,
  type,
  placeholder,
  registration,
  error,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const inputType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          className={`block w-full px-3 py-2 border ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:ring-blue-500"
          } rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-black ${
            isPasswordField ? "pr-10" : ""
          }`}
          placeholder={placeholder}
          {...registration}
        />
        
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
};

export default InputField;