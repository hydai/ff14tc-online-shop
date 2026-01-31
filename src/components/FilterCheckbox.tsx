"use client";

import { Checkbox } from "@base-ui/react/checkbox";

interface FilterCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  accentColor: "emerald" | "rose" | "green";
}

const accentClasses = {
  emerald: "data-[checked]:bg-emerald-500 data-[checked]:border-emerald-500 focus-visible:ring-emerald-500",
  rose: "data-[checked]:bg-rose-500 data-[checked]:border-rose-500 focus-visible:ring-rose-500",
  green: "data-[checked]:bg-green-500 data-[checked]:border-green-500 focus-visible:ring-green-500",
};

export default function FilterCheckbox({ checked, onCheckedChange, label, accentColor }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer whitespace-nowrap">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={`flex size-5 items-center justify-center rounded border border-gray-600 bg-gray-800 focus-visible:outline-none focus-visible:ring-2 ${accentClasses[accentColor]}`}
      >
        <Checkbox.Indicator className="text-white data-[unchecked]:hidden">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label}
    </label>
  );
}
