import { FieldError, UseFormRegisterReturn } from "react-hook-form";

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
}: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
        placeholder={placeholder}
        {...registration}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  </div>
);

export default InputField;
