import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none ring-primary placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error ? "border-red-400" : "border-slate-300"
        } ${className}`}
        {...props}
      />
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
