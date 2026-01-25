"use client";

import useApi from "@/hooks/useApi";
import { Category, CategoryType } from "@/types/category";
import { useEffect, useState } from "react";
import ReactSelect from "react-select/creatable";

interface CreateableSelectProps {
    type: CategoryType;
    value?: { label: string; value: string };
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

    useEffect(() => {
        loadCategories();
    }, [type]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const res = await categoryApi.getByType(type);
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
            const res = await categoryApi.create({
                name: inputValue,
                type: type,
            });
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
        <ReactSelect
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={(val) => onChange(val)}
            onCreateOption={handleCreate}
            options={options}
            value={value}
            placeholder={placeholder}
            className="my-react-select-container"
            classNamePrefix="my-react-select"
        />
    );
}
