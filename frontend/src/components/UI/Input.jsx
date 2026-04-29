import React from "react";

const Input = ({
  label,
  error,
  hint,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={props.id}
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        className={`nova-input ${error ? "nova-input-error" : ""} ${className}`}
      />

      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
      {!error && hint ? (
        <p className="mt-2 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
};

export default Input;
