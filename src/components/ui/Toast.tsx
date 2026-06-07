"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border bg-bg-surface px-4 py-3 shadow-lg transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <CheckCircle className="h-5 w-5 text-pistache" />
      <span className="text-sm text-text-primary">{message}</span>
      <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
