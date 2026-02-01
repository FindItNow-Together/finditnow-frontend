"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import useFileUpload from "@/hooks/useFileUpload";

interface ImageUploaderProps {
    domain: string; // "SHOP" | "PRODUCT" | "CATEGORY"
    entityId: string; // Existing ID or temp UUID for new entities
    purpose?: string; // "image" | "logo" | "thumbnail"
    currentImageUrl?: string; // Existing image URL (for edit mode)
    onUploadComplete: (fileKey: string) => void;
    onError?: (error: Error) => void;
    className?: string;
    label?: string;
}

/**
 * Reusable image upload component with preview and drag-and-drop support.
 *
 * Usage:
 * ```tsx
 * <ImageUploader
 *   domain="PRODUCT"
 *   entityId={product?.id ?? tempEntityId}
 *   currentImageUrl={product?.imageUrl}
 *   onUploadComplete={(fileKey) => setFormData(prev => ({ ...prev, imageUrl: fileKey }))}
 * />
 * ```
 */
export default function ImageUploader({
    domain,
    entityId,
    purpose = "image",
    currentImageUrl,
    onUploadComplete,
    onError,
    className = "",
    label = "Upload Image",
}: ImageUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { upload, uploading, error } = useFileUpload({
        domain,
        entityId,
        purpose,
    });

    const imageGatewayUrl = process.env.NEXT_PUBLIC_IMAGE_GATEWAY_URL || "";

    const displayImageUrl = previewUrl || (currentImageUrl ? imageGatewayUrl + currentImageUrl : null);

    const handleFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            const err = new Error("Please select an image file");
            onError?.(err);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            const err = new Error("Image must be less than 5MB");
            onError?.(err);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload file
        try {
            const fileKey = await upload(file);
            onUploadComplete(fileKey);
        } catch (err) {
            setPreviewUrl(null);
            onError?.(err instanceof Error ? err : new Error("Upload failed"));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const clearImage = () => {
        setPreviewUrl(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <div
                className={`relative border-2 border-dashed rounded-lg transition-colors ${dragActive
                        ? "border-blue-500 bg-blue-50"
                        : displayImageUrl
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-300 hover:border-gray-400"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                />

                {displayImageUrl ? (
                    <div className="relative p-2">
                        <img
                            src={displayImageUrl}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg"
                        />
                        {!uploading && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearImage();
                                }}
                                className="absolute top-4 right-4 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition z-20"
                            >
                                <X className="h-4 w-4 text-gray-600" />
                            </button>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        {uploading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <ImagePlus className="h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
