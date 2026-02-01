"use client";

import useApi from "@/hooks/useApi";
import { Category, CategoryType } from "@/types/category";
import { useEffect, useState } from "react";

interface CreateableSelectProps {
  type: CategoryType;
  value?: { label: string; value: string } | null;
  onChange: (value: { label: string; value: string } | null) => void;
  placeholder?: string;
}

export default function CreateableSelect({
  type,
  value,
  onChange,
  placeholder = "Select or create...",
}: CreateableSelectProps) {
  const { categoryApi } = useApi();
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const CREATE_VALUE = "__create__";

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = (await categoryApi.getByType(type)) as { data: Category[] };
      const categories: Category[] = res.data;
      setOptions(
        categories.map((c) => ({
          label: c.name,
          value: String(c.id),
        }))
      );
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    try {
      const res = (await categoryApi.create({
        name: inputValue,
        type: type,
      })) as { data: Category };
      const newCategory: Category = res.data;
      const newOption = { label: newCategory.name, value: String(newCategory.id) };

      setOptions((prev) => [...prev, newOption]);
      onChange(newOption);
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <select
        className="w-full px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100"
        disabled={isLoading}
        value={value?.value ?? ""}
        onChange={async (e) => {
          const next = e.target.value;
          if (!next) {
            onChange(null);
            return;
          }
          if (next === CREATE_VALUE) {
            const name = window.prompt("Create a new category:", "");
            if (name && name.trim()) {
              await handleCreate(name.trim());
            }
            // reset the select if user cancels
            e.currentTarget.value = value?.value ?? "";
            return;
          }
          const opt = options.find((o) => o.value === next) ?? null;
          onChange(opt);
        }}
      >
        <option value="" disabled>
          {isLoading ? "Loading..." : placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value={CREATE_VALUE}>+ Create new…</option>
      </select>
    </div>
  );
}
