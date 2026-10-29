"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** Length of the drawer's slide-out, matching `.ik-side-drawer[data-closing]` in globals.css. */
const DRAWER_EXIT_MS = 240;

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
  // Content stays mounted while the drawer slides out, after `open` turns false.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  // The drawer plays its exit animation before the native close.
  const close = useCallback(() => {
    const dialog = ref.current;
    if (!dialog?.open || dialog.hasAttribute("data-closing")) return;
    if (variant !== "drawer" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    dialog.setAttribute("data-closing", "");
    window.setTimeout(() => {
      dialog.removeAttribute("data-closing");
      dialog.close();
    }, DRAWER_EXIT_MS);
  }, [variant]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      close();
    }
  }, [open, close]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      setShown(false);
      onClose();
      returnFocus.current?.focus?.();
    };
    const handleCancel = (event: Event) => {
      // Escape: animate out instead of closing at once.
      event.preventDefault();
      close();
    };
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onClose, close]);

  const position =
    variant === "sheet"
      ? "mt-auto mb-0 w-full max-w-none rounded-t-2xl ik-sheet max-h-[88dvh] open:flex open:flex-col"
      : "ml-auto mr-0 h-dvh max-h-none w-[min(22rem,88vw)] ik-side-drawer";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === ref.current) close();
      }}
      className={`m-0 border-0 bg-surface p-0 text-ink shadow-soft backdrop:bg-black/40 ${position} ${className ?? ""}`}
    >
      {open || shown ? children : null}
    </dialog>
  );
}
