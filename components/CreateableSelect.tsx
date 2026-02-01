"use client";

import useApi from "@/hooks/useApi";
import { Category, CategoryType } from "@/types/category";
import { useEffect, useState } from "react";
import Modal from "@/app/_components/Modal";
import ImageUploader from "./ImageUploader";

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

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newCategoryImg, setNewCategoryImg] = useState("");
  // Temporary ID for new category image uploads
  const [tempEntityId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = (await categoryApi.getByType(type)) as { data: Category[] };
      const categories: Category[] = res?.data || [];
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

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    try {
      const res = (await categoryApi.create({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
        imageUrl: newCategoryImg,
        type: type,
      })) as { data: Category };

      const newCategory: Category | undefined = res?.data;

      if (!newCategory) {
        throw new Error("Failed to create category: No data returned");
      }

      const newOption = { label: newCategory.name, value: String(newCategory.id) };

      setOptions((prev) => [...prev, newOption]);
      onChange(newOption);
      closeModal();
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewCategoryName("");
    setNewCategoryDesc("");
    setNewCategoryImg("");
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
            setShowCreateModal(true);
            // reset the select if user cancels (will be updated if they create)
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
      {
        showCreateModal && (
          <Modal header={`Create New ${type === "SHOP" ? "Shop" : "Product"} Category`} onCloseAction={closeModal}>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image (Optional)
                </label>
                <ImageUploader
                  domain="CATEGORY"
                  entityId={tempEntityId}
                  purpose="image"
                  currentImageUrl={newCategoryImg}
                  onUploadComplete={setNewCategoryImg}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  autoFocus
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Electronics"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Describe this category..."
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newCategoryName.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </div>
          </Modal>
        )
      }
    </div >
  );
}
