import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";

export type ButtonVariant = "primary" | "secondary" | "outline";

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-2 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background-white disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover",
  secondary:
    "bg-secondary text-on-secondary hover:bg-secondary/90 active:bg-secondary/90",
  outline:
    "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 active:bg-primary/15",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[baseClass, variantClass[variant], className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export type ButtonLinkProps = Omit<LinkProps, "className"> & {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

/** Same visuals as `Button`, for navigation CTAs (`next/link`). */
export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={[baseClass, variantClass[variant], className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
