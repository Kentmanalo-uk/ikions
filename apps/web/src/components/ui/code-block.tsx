import { highlight, type LanguageName } from "sugar-high";
import { CopyButton } from "./copy-button";
import { buttonClass } from "./button";

/**
 * Highlighted, copyable code. sugar-high escapes the source before wrapping
 * tokens in spans, so the generated HTML contains no user markup.
 */
export function CodeBlock({
  code,
  lang = "javascript",
  label,
  className,
}: {
  code: string;
  lang?: LanguageName;
  label?: string;
  className?: string;
}) {
  const html = highlight(code, { lang });
  return (
    <div className={`code-block group relative overflow-hidden rounded-[18px] bg-code ${className ?? ""}`}>
      {label ? (
        <div className="flex items-center justify-between px-4 pb-0 pt-2.5">
          <span className="font-mono text-[12px] text-ink-2">{label}</span>
          <CopyButton text={code} label="Copy code" className={`${buttonClass.ghost} h-7 px-2 text-[12px]`} />
        </div>
      ) : (
        <CopyButton
          text={code}
          label="Copy code"
          compact
          className={`${buttonClass.icon} absolute right-2 top-2 h-8 w-8 bg-code opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
        />
      )}
      <pre tabIndex={0} role="region" aria-label={label ? `${label} code` : "Code example"} className={`overflow-x-auto p-4 font-mono text-[13px] leading-[1.65] ${label ? "" : "pr-12"}`}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
