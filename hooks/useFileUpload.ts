"use client";

import useApi from "@/hooks/useApi";
import { useState } from "react";

interface UseFileUploadOptions {
  domain: string; // "SHOP" | "PRODUCT" | "CATEGORY" | user role
  entityId: string; // Existing ID or temp UUID
  purpose: string; // "image" | "logo" | "profile"
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<string>; // Returns fileKey
  uploading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Reusable hook for uploading files to the file gateway.
 * Encapsulates the upload logic from ProfileSection.tsx.
 *
 * Usage:
 * ```tsx
 * const { upload, uploading, error } = useFileUpload({
 *   domain: "PRODUCT",
 *   entityId: product?.id ?? tempId,
 *   purpose: "image"
 * });
 *
 * const fileKey = await upload(selectedFile);
 * setFormData(prev => ({ ...prev, imageUrl: fileKey }));
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("domain", options.domain);
      formData.append("entityId", options.entityId);
      formData.append("purpose", options.purpose);
      formData.append("file", file);

      const response = await api.post("/api/files/upload", formData);

      if (!response.ok) throw new Error("File upload failed");

      const data = await response.json();
      return data.fileKey;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setError(null);
    setUploading(false);
  };

  return { upload, uploading, error, reset };
}

export default useFileUpload;
