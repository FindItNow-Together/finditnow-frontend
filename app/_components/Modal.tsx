import React from "react";

interface ModalProps {
  header: string;
  children: React.ReactNode;
  onCloseAction: () => void;
}

export default function Modal({ header, children, onCloseAction }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={onCloseAction}
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">{header}</h3>
          <button
            onClick={onCloseAction}
            className="text-gray-500 hover:text-black"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
