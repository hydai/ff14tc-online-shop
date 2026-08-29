"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="搜尋商品名稱..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-lg glass pl-10 pr-4 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] outline-none transition-all duration-200 focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
      />
    </div>
  );
}
