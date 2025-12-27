import Modal from "@/app/_components/Modal";
import { useState } from "react";

function UploadPhotoModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Modal header="Upload profile photo" onCloseAction={onClose}>
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm
                               file:mr-4 file:rounded-md file:border-0
                               file:bg-gray-900 file:px-3 file:py-1.5
                               file:text-xs file:font-medium file:text-white
                               hover:file:bg-gray-800"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) setFile(selected);
          }}
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border px-3 py-1.5 text-xs">
            Cancel
          </button>

          <button
            type="button"
            disabled={!file}
            onClick={() => file && onUpload(file)}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default UploadPhotoModal;
