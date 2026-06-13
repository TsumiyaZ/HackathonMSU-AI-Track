export function StarRating({
  value,
  outOf = 5,
  size = 16,
  className = "",
}: {
  value: number;
  outOf?: number;
  size?: number;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <div
      className={`inline-flex items-center gap-0.5 text-yellow-400 ${className}`}
      aria-label={`คะแนน ${value} จาก ${outOf}`}
    >
      {Array.from({ length: outOf }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={{
            fontSize: size,
            fontVariationSettings: i < filled ? "'FILL' 1" : "'FILL' 0",
            color: i < filled ? "#facc15" : "rgba(255,255,255,0.25)",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}
