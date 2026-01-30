"use client";

interface ProgressBarProps {
  purchased: number;
  total: number;
}

export default function ProgressBar({ purchased, total }: ProgressBarProps) {
  const pct = total > 0 ? (purchased / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-[var(--color-muted)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-[var(--color-muted-foreground)] whitespace-nowrap font-[family-name:var(--font-mono)] tracking-wide">
        {purchased}/{total}
      </span>
    </div>
  );
}
