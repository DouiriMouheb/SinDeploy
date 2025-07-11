import React from "react";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-blue-500/25",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-500/25",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-900 focus:ring-gray-500 border border-transparent hover:border-gray-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
