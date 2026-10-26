import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Children, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import type { LanguageName } from "sugar-high";
import { CodeBlock } from "../ui/code-block";
import { IkIcon } from "../ui/ik-icon";

const LANGS: Record<string, LanguageName> = {
  js: "javascript",
  jsx: "javascript",
  javascript: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  bash: "shell",
  sh: "shell",
  shell: "shell",
  html: "html",
  svg: "html",
  css: "css",
  json: "json",
  vue: "vue",
  svelte: "svelte",
  text: "plaintext",
};

const textOf = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function Heading({ level, children }: { level: 2 | 3; children: ReactNode }) {
  const id = slugify(textOf(children));
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={id} className="group scroll-mt-24">
      {children}
      <a href={`#${id}`} className="ml-2 text-ink-2 no-underline opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Link to this section">
        #
      </a>
    </Tag>
  );
}

function Pre({ children }: ComponentProps<"pre">) {
  const child = Children.only(children) as ReactElement<{ className?: string; children?: ReactNode }>;
  const className = child.props.className ?? "";
  const match = /language-(\w+)(?::(.+))?/.exec(className);
  const lang = LANGS[match?.[1] ?? "text"] ?? "plaintext";
  const code = textOf(child.props.children).replace(/\n$/, "");
  return <CodeBlock code={code} lang={lang} className="my-5" />;
}

function A({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

/** A callout box for notes and warnings. */
export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return (
    <div className="not-prose my-5 flex gap-3 rounded-[18px] border border-line bg-subtle px-4 py-3 text-[14.5px] leading-6">
      <IkIcon name={tone === "warning" ? "warning" : "info"} size={18} className="mt-0.5 shrink-0 text-accent-text" />
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}

/** Inline icon preview inside documentation. */
export function Preview({ names, variant = "outline" }: { names: string[]; variant?: "outline" | "filled" }) {
  return (
    <div className="my-5 flex flex-wrap items-center gap-5 rounded-[18px] border border-line bg-surface px-5 py-4">
      {names.map((name) => (
        <IkIcon key={name} name={name} variant={variant} size={24} title={name} />
      ))}
    </div>
  );
}

export const docsComponents: MDXComponents = {
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  pre: Pre,
  a: A,
  Note,
  Preview,
};
