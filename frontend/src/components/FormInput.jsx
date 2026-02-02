import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  register, 
  errors, 
  placeholder,
  required = false,
  ...props 
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        {...register(name, { required: required && `${label} is required` })}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        {...props}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
      )}
    </div>
  );
};

export default React.memo(FormInput);
