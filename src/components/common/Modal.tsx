import type { PropsWithChildren } from "react";
import { Button } from "@/components/common/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({ isOpen, onClose, title, children }: PropsWithChildren<ModalProps>) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" onClick={onClose} aria-label="关闭">
            关闭
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
