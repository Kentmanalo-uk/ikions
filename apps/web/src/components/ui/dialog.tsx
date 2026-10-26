"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Modal built on the native <dialog> element: the browser provides the focus
 * trap, inert background and Escape handling; we restore focus on close.
 */
export function Dialog({
  open,
  onClose,
  label,
  children,
  variant = "sheet",
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  /** `sheet` slides up from the bottom (mobile); `drawer` slides in from the right. */
  variant?: "sheet" | "drawer";
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      onClose();
      returnFocus.current?.focus?.();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const position =
    variant === "sheet"
      ? "mt-auto mb-0 w-full max-w-none rounded-t-2xl ik-sheet max-h-[88dvh]"
      : "ml-auto mr-0 h-dvh max-h-none w-[min(22rem,88vw)] ik-drawer";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === ref.current) ref.current.close();
      }}
      className={`m-0 border-0 bg-surface p-0 text-ink shadow-soft backdrop:bg-black/40 ${position} ${className ?? ""}`}
    >
      {open ? children : null}
    </dialog>
  );
}
