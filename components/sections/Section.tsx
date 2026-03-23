import type { HTMLAttributes } from "react";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div";
};

/**
 * Standard section shell: `py-16` mobile, `md:py-24` desktop.
 * Pair with alternating `bg-white` / `bg-gray-50` for clear entry/exit.
 */
export function Section({
  as: Comp = "section",
  className = "",
  ...props
}: SectionProps) {
  return (
    <Comp
      className={["section-spacing", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
