"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { CheckIcon, PlusIcon } from "@ikions/react";
import { useSelection } from "@/lib/stored-set";

/** Adds the whole collection to the export selection used by the explorer. */
export function SelectCollection({ names }: { names: string[] }) {
  const selection = useSelection();
  const all = names.every((n) => selection.values.includes(n));
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={buttonClass.secondary} onClick={() => selection.add(names)} disabled={all}>
        {all ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
        {all ? "All in selection" : "Add all to selection"}
      </button>
      {selection.values.length > 0 ? (
        <Link href="/icons" className={buttonClass.primary}>
          Export {selection.values.length} selected
        </Link>
      ) : null}
    </div>
  );
}
