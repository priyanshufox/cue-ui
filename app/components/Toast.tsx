"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

export type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const lines = message.split("; ");

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-sm w-full pointer-events-auto ${
        type === "success" ? "bg-[#1e2e24] border border-[#45b26b]/40 text-[#45b26b]" : "bg-[#2a1a1a] border border-red-700/40 text-red-400"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {type === "success" ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        {lines.map((line, i) => {
          const colonIdx = line.indexOf(": ");
          if (colonIdx !== -1 && lines.length > 1) {
            const platform = line.slice(0, colonIdx);
            const msg = line.slice(colonIdx + 2);
            return (
              <p key={i}>
                <span className="font-semibold capitalize">{platform}:</span>{" "}
                <span className="font-normal">{msg}</span>
              </p>
            );
          }
          return <p key={i} className="font-normal">{line}</p>;
        })}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}
