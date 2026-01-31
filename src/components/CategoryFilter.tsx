"use client";

import type { Category } from "@/lib/items";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";

interface CategoryFilterProps {
  mainCategories: Category[];
  subCategories: Category[];
  selectedMain: string;
  selectedSub: string;
  onMainChange: (id: string) => void;
  onSubChange: (id: string) => void;
}

const pillClass =
  "rounded-full px-3 py-1 text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700 data-[pressed]:bg-blue-600 data-[pressed]:text-white";

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
      <ToggleGroup
        value={[selectedMain]}
        onValueChange={(newValue) => onMainChange(newValue[0] ?? "")}
        className="flex flex-wrap gap-2"
      >
        <Toggle value="" className={pillClass}>
          全部
        </Toggle>
        {mainCategories.map((cat) => (
          <Toggle key={cat.id} value={cat.id} className={pillClass}>
            {cat.name}
          </Toggle>
        ))}
      </ToggleGroup>
      {selectedMain && subCategories.length > 0 && (
        <ToggleGroup
          value={[selectedSub]}
          onValueChange={(newValue) => onSubChange(newValue[0] ?? "")}
          className="flex flex-wrap gap-2 pl-2"
        >
          <Toggle value="" className={pillClass}>
            全部子類
          </Toggle>
          {subCategories.map((sub) => (
            <Toggle key={sub.id} value={sub.id} className={pillClass}>
              {sub.name}
            </Toggle>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}
