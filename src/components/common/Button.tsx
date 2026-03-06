import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-white hover:bg-blue-700",
  secondary: "bg-accent text-slate-900 hover:bg-yellow-500",
  ghost: "bg-transparent text-primary hover:bg-blue-50"
};

export function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "处理中..." : children}
    </button>
  );
}
