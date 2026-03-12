import type { PropsWithChildren } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "md" | "lg";
}

const sizeClass = {
  md: "max-w-md",
  lg: "max-w-xl"
} as const;

export function Modal({ isOpen, onClose, title, description, size = "md", children }: PropsWithChildren<ModalProps>) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201910]/48 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={`w-full ${sizeClass[size]} overflow-hidden rounded-[28px] border border-[#ddd2c1] bg-[#fbf7f1] shadow-[0_30px_90px_rgba(32,25,16,0.18)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e7ddcf] px-5 py-5 sm:px-6">
          <div>
            <h3 id="modal-title" className="text-xl font-semibold tracking-[-0.03em] text-stone-950">
              {title}
            </h3>
            {description ? (
              <p id="modal-description" className="mt-2 max-w-[44ch] text-sm leading-7 text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[16px] border border-[#ddd2c1] bg-white text-sm font-medium text-stone-600 transition hover:bg-[#f5efe4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
          >
            关闭
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
