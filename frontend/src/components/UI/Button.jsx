import React from "react";

const variantStyles = {
  primary:
    "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-[0_10px_30px_-12px_rgba(34,211,238,0.7)] hover:scale-[1.01] hover:shadow-[0_18px_34px_-18px_rgba(103,232,249,0.95)] focus-visible:ring-brand-primary/60",
  ghost:
    "btn-ghost-theme bg-white/5 text-slate-200 border border-white/15 hover:bg-white/10 hover:border-white/25 focus-visible:ring-white/40",
  danger:
    "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_10px_28px_-14px_rgba(244,63,94,0.85)] hover:shadow-[0_16px_30px_-18px_rgba(251,113,133,0.95)] focus-visible:ring-rose-400/60",
};

const sizeStyles = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="nova-spinner h-4 w-4 border-2 border-white/25 border-t-white" />
          <span>Working...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
