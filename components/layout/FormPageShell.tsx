import type { ReactNode } from "react";

type FormPageShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Portal / long-form pages (jobs, matrimony, etc.).
 * Root `app/layout.tsx` already applies `pt-[var(--site-header-offset)]` so content clears the fixed header.
 * This shell adds horizontal padding and inner vertical rhythm so forms are never clipped under the nav.
 */
export function FormPageShell({ children, className = "" }: FormPageShellProps) {
  return (
    <div
      className={[
        "min-h-screen w-full bg-gray-50 px-4 pb-16 pt-6 md:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
