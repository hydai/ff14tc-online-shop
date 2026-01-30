"use client";

interface ProgressBarProps {
  purchased: number;
  total: number;
}

export default function ProgressBar({ purchased, total }: ProgressBarProps) {
  const pct = total > 0 ? (purchased / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 rounded-full bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-gray-300 whitespace-nowrap">
        {purchased}/{total} 已購買
      </span>
    </div>
  );
}
