"use client";

import type { Category } from "@/lib/items";

interface CategoryFilterProps {
  mainCategories: Category[];
  subCategories: Category[];
  selectedMain: string;
  selectedSub: string;
  onMainChange: (id: string) => void;
  onSubChange: (id: string) => void;
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

export default function CategoryFilter({
  mainCategories,
  subCategories,
  selectedMain,
  selectedSub,
  onMainChange,
  onSubChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Pill
          label="全部"
          active={selectedMain === ""}
          onClick={() => onMainChange("")}
        />
        {mainCategories.map((cat) => (
          <Pill
            key={cat.id}
            label={cat.name}
            active={selectedMain === cat.id}
            onClick={() => onMainChange(cat.id)}
          />
        ))}
      </div>
      {selectedMain && subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-2">
          <Pill
            label="全部子類"
            active={selectedSub === ""}
            onClick={() => onSubChange("")}
          />
          {subCategories.map((sub) => (
            <Pill
              key={sub.id}
              label={sub.name}
              active={selectedSub === sub.id}
              onClick={() => onSubChange(sub.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
