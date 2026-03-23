import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article";
  /** Adds hover scale + shadow (uses .card-hover utility) */
  interactive?: boolean;
};

export function Card({
  as: Comp = "div",
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  const base =
    "rounded-xl border border-border-muted bg-background-white p-6 shadow-card";

  return (
    <Comp
      className={[base, interactive ? "card-hover" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
