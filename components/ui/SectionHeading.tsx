export type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** For `aria-labelledby` on the parent section */
  id?: string;
};

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className = "",
  id,
}: SectionHeadingProps) {
  const wrap =
    align === "center"
      ? "mx-auto max-w-3xl text-center"
      : "max-w-3xl text-left";

  return (
    <div
      className={[
        wrap,
        "flex flex-col gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={[
            "section-subtitle",
            align === "center" ? "mx-auto" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
