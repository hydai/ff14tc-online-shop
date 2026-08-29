"use client";

import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Field.Root>
      <Field.Label className="sr-only">搜尋商品</Field.Label>
      <Input
        type="text"
        placeholder="搜尋商品名稱..."
        value={value}
        onValueChange={(val) => onChange(val)}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </Field.Root>
  );
}
