import type { ReactNode } from "react";
import { DocsPager, DocsSidebar } from "./docs-nav";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1200px] gap-10 px-4 pt-8 sm:px-6">
      <DocsSidebar />
      <div className="min-w-0 flex-1">
        <article className="prose-ik max-w-[720px]">{children}</article>
        <DocsPager />
      </div>
    </div>
  );
}
