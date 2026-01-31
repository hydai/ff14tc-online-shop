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
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onMainChange("")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            selectedMain === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          全部
        </button>
        <ToggleGroup
          value={selectedMain ? [selectedMain] : []}
          onValueChange={(newValue) => onMainChange(newValue.length > 0 ? newValue[0] as string : "")}
          className="flex flex-wrap gap-2"
        >
          {mainCategories.map((cat) => (
            <Toggle key={cat.id} value={cat.id} className={pillClass}>
              {cat.name}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
      {selectedMain && subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-2">
          <button
            onClick={() => onSubChange("")}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedSub === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            全部子類
          </button>
          <ToggleGroup
            value={selectedSub ? [selectedSub] : []}
            onValueChange={(newValue) => onSubChange(newValue.length > 0 ? newValue[0] as string : "")}
            className="flex flex-wrap gap-2"
          >
            {subCategories.map((sub) => (
              <Toggle key={sub.id} value={sub.id} className={pillClass}>
                {sub.name}
              </Toggle>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
}
