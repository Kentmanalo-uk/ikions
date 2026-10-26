import type { CSSProperties } from "react";
import { getNodes } from "@/lib/catalog";
import { NodeIcon } from "../ui/node-icon";
import { MorphTrigger } from "./morph-trigger";

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

export function MorphText({ lines, as: Tag = "h2", id, className, trigger = "view" }: MorphTextProps) {
  let index = 0;
  const text = lines.join(" ");

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <MorphTrigger trigger={trigger}>
        {lines.map((line, lineIndex) => (
          <span key={line} className="block">
            {line.split(" ").map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`}>
                {wordIndex > 0 ? " " : null}
                <span className="inline-block whitespace-nowrap">
                  {[...word].map((char) => {
                    const i = index++;
                    const options = BY_LETTER[char.toLowerCase()];
                    const second = options ? getNodes(options[i % options.length]!) : undefined;
                    const first = getNodes(FIRST[(i * 7 + lineIndex) % FIRST.length]!);
                    const hover = second ?? first;
                    const style = { "--d": `${i * STAGGER_MS}ms`, "--s": `${glyphSize(char)}em` } as CSSProperties;
                    return (
                      <span key={i} className="ik-morph-char" style={style}>
                        {first ? <NodeIcon nodes={first} className="ik-morph-glyph ik-morph-first" /> : null}
                        {second ? <NodeIcon nodes={second} className="ik-morph-glyph ik-morph-second" /> : null}
                        {/* The face wrapper takes the hover transition; the letter inside keeps the intro animation. */}
                        <span className="ik-morph-face">
                          <span className={second ? "ik-morph-letter" : "ik-morph-letter ik-morph-quick"}>{char}</span>
                        </span>
                        {hover ? <NodeIcon nodes={hover} className="ik-morph-hover" /> : null}
                      </span>
                    );
                  })}
                </span>
              </span>
            ))}
          </span>
        ))}
      </MorphTrigger>
    </Tag>
  );
}

/** The hero heading: plays on every load. */
export function MorphHeading({ className }: { className?: string }) {
  return <MorphText as="h1" trigger="load" lines={["Icons for everything", "you imagine."]} className={className} />;
}
