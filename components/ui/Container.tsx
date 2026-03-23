import type { HTMLAttributes } from "react";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article" | "main";
  /** Narrow reading column for forms or long prose */
  narrow?: boolean;
};

export function Container({
  as: Comp = "div",
  narrow = false,
  className = "",
  ...props
}: ContainerProps) {
  const max = narrow ? "max-w-3xl" : "max-w-7xl";

  return (
    <Comp
      className={["mx-auto w-full", max, "px-6 md:px-12", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
