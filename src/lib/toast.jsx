import React from "react";
import toast from "react-hot-toast";

export function confirmToast({
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
}) {
  toast.custom(
    (t) => (
      <div
        className={`w-full max-w-sm rounded-lg border border-[#dbe7da] border-l-4 border-l-[#2f8f2b] bg-white p-4 text-slate-900 shadow-[0_18px_45px_rgb(15_23_42/0.16)] transition ${
          t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <p className="text-sm font-bold text-slate-950">{title}</p>
        {message ? (
          <p className="mt-1 text-sm leading-5 text-slate-500">{message}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            onClick={() => toast.dismiss(t.id)}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#2f8f2b] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#23731f]"
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm?.();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
}
