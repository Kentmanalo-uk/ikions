import { createElement, type CSSProperties } from "react";
import { getNodes } from "@/lib/catalog";
import { MorphTrigger } from "./morph-trigger";

const camel = (key: string) => key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Headings that assemble themselves from icons: every letter first appears as
 * an icon, swaps to a second icon whose name starts with that letter, then
 * settles into the letter itself. Hovering a letter turns it back into its
 * icon. The animation is CSS (see .ik-morph in globals.css); MorphTrigger only
 * decides when it plays. Reduced motion shows the text immediately.
 */

// Icons whose names start with each letter — the last step before the letter.
const BY_LETTER: Record<string, string[]> = {
  a: ["apple", "atom", "alarm"],
  b: ["bell", "bookmark", "bug"],
  c: ["camera", "chat", "cloud", "code"],
  d: ["download", "database", "droplet"],
  e: ["eye", "edit"],
  f: ["file", "folder", "flag"],
  g: ["globe", "gift", "grid"],
  h: ["home", "heart"],
  i: ["image", "info", "inbox"],
  k: ["key", "keyboard"],
  l: ["lock", "link", "leaf"],
  m: ["mail", "music", "map"],
  n: ["navigation"],
  o: ["circle"],
  p: ["play", "phone", "plane"],
  r: ["robot", "route", "refresh"],
  s: ["search", "sun", "star"],
  t: ["tag", "tree", "trophy"],
  u: ["user", "umbrella"],
  v: ["video", "volume"],
  w: ["wallet", "wifi", "wind"],
  y: ["sparkles"],
};

// A varied first glyph for every letter.
const FIRST = ["camera", "bell", "heart", "cloud", "wallet", "music", "map-pin", "lock", "sun", "chat", "star", "gift", "code", "leaf", "coffee", "plane"];

const STAGGER_MS = 24;

/**
 * Icon size for a character, in em, so each icon matches the letter it stands
 * in for: cap height for capitals and ascenders, x-height for short letters,
 * narrower icons for narrow letters and tiny ones for punctuation.
 */
function glyphSize(char: string): number {
  if (/[.,:;!?'’]/.test(char)) return 0.34;
  if (/[iljI]/.test(char)) return 0.5;
  if (/[ftr]/.test(char)) return 0.6;
  if (/[A-Z0-9bdhk]/.test(char)) return 0.8;
  return 0.66;
}

interface MorphTextProps {
  /** One string per line; long lines wrap between words. */
  lines: string[];
  /** `span` lets the text sit inside a larger heading, e.g. next to the logo. */
  as?: "h1" | "h2" | "span";
  id?: string;
  className?: string;
  /** `load` plays immediately; `view` plays when the heading scrolls into view. */
  trigger?: "load" | "view";
}

/** Short stable hash, so each heading's sprite symbols get unique ids. */
function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function MorphText({ lines, as: Tag = "h2", id, className, trigger = "view" }: MorphTextProps) {
  let index = 0;
  const text = lines.join(" ");
  const prefix = `ikm-${hash(text)}`;

  // Each icon's artwork is written once per heading as a <symbol>; every letter
  // references it with <use>, which keeps long headings light in the HTML.
  const used = new Set<string>();
  const glyph = (name: string | undefined, className: string) => {
    if (!name || !getNodes(name)) return null;
    used.add(name);
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <use href={`#${prefix}-${name}`} />
      </svg>
    );
  };

  const content = lines.map((line, lineIndex) => (
    <span key={line} className="block">
      {line.split(" ").map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`}>
          {wordIndex > 0 ? " " : null}
          <span className="inline-block whitespace-nowrap">
            {[...word].map((char) => {
              const i = index++;
              const options = BY_LETTER[char.toLowerCase()];
              const second = options ? options[i % options.length] : undefined;
              const first = FIRST[(i * 7 + lineIndex) % FIRST.length];
              const hasSecond = Boolean(second && getNodes(second));
              const style = { "--d": `${i * STAGGER_MS}ms`, "--s": `${glyphSize(char)}em` } as CSSProperties;
              return (
                <span key={i} className="ik-morph-char" style={style}>
                  {glyph(first, "ik-morph-glyph ik-morph-first")}
                  {glyph(second, "ik-morph-glyph ik-morph-second")}
                  {/* The face wrapper takes the hover transition; the letter inside keeps the intro animation. */}
                  <span className="ik-morph-face">
                    <span className={hasSecond ? "ik-morph-letter" : "ik-morph-letter ik-morph-quick"}>{char}</span>
                  </span>
                  {glyph(hasSecond ? second : first, "ik-morph-hover")}
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </span>
  ));

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <MorphTrigger trigger={trigger}>
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
          {[...used].map((name) => (
            <symbol key={name} id={`${prefix}-${name}`} viewBox="0 0 24 24">
              {getNodes(name)!.outline.map(([tag, attrs], k) =>
                createElement(tag, { key: k, ...Object.fromEntries(Object.entries(attrs).map(([a, v]) => [camel(a), v])) }),
              )}
            </symbol>
          ))}
        </svg>
        {content}
      </MorphTrigger>
    </Tag>
  );
}

/** The hero heading: plays on every load. */
export function MorphHeading({ className }: { className?: string }) {
  return <MorphText as="h1" trigger="load" lines={["Icons for everything", "you imagine."]} className={className} />;
}
