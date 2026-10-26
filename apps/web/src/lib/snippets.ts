import {
  DEFAULT_STROKE_WIDTH,
  gradientCoords,
  gradientId,
  nodesToSvg,
  normalizeColor,
  normalizeGradient,
  type IconGradient,
  type IconNode,
  type IconVariant,
} from "@ikions/icons";

export type { IconGradient };

export interface IconOptions {
  variant: IconVariant;
  size: number;
  color: string;
  /** When set, the icon is painted with this gradient instead of `color`. */
  gradient: IconGradient | null;
  strokeWidth: number;
}

export const DEFAULT_OPTIONS: IconOptions = {
  variant: "outline",
  size: 24,
  color: "currentColor",
  gradient: null,
  strokeWidth: DEFAULT_STROKE_WIDTH,
};

interface SnippetIcon {
  name: string;
  title: string;
  component: string;
}

export type SnippetKind = "svg" | "react" | "vue" | "svelte" | "jsx" | "html" | "css" | "js";

export const SNIPPET_TABS: { kind: SnippetKind; label: string; lang: "html" | "javascript" | "css" | "vue" | "svelte" }[] = [
  { kind: "svg", label: "SVG", lang: "html" },
  { kind: "react", label: "React", lang: "javascript" },
  { kind: "vue", label: "Vue", lang: "vue" },
  { kind: "svelte", label: "Svelte", lang: "svelte" },
  { kind: "jsx", label: "JSX", lang: "javascript" },
  { kind: "html", label: "HTML", lang: "html" },
  { kind: "css", label: "CSS", lang: "css" },
  { kind: "js", label: "JavaScript", lang: "javascript" },
];

const round = (n: number) => Number(n.toFixed(2));

/** The validated gradient for these options, if any. */
export const activeGradient = (options: IconOptions) => normalizeGradient(options.gradient);

/** Standalone SVG markup for the icon with the chosen options. */
export function svgMarkup(nodes: readonly IconNode[], options: IconOptions, pretty = false): string {
  const svg = nodesToSvg(nodes, options.variant, {
    size: options.size,
    color: options.color,
    gradient: options.gradient ?? undefined,
    strokeWidth: options.strokeWidth,
  }).replace(' aria-hidden="true"', "");
  return pretty ? svg.replace(/></g, ">\n  <").replace(/\n {2}<\/svg>$/, "\n</svg>") : svg;
}

type Prop = [name: string, value: string | number | Required<IconGradient>];

/** Props that differ from component defaults, in a stable order. */
function changedProps(options: IconOptions): Prop[] {
  const props: Prop[] = [];
  if (options.size !== DEFAULT_OPTIONS.size) props.push(["size", options.size]);
  props.push(["variant", options.variant]);
  const gradient = activeGradient(options);
  if (gradient) props.push(["gradient", gradient]);
  else {
    const color = normalizeColor(options.color);
    if (color !== "currentColor") props.push(["color", color]);
  }
  if (options.variant === "outline" && round(options.strokeWidth) !== DEFAULT_STROKE_WIDTH) {
    props.push(["strokeWidth", round(options.strokeWidth)]);
  }
  return props;
}

const gradientObject = (g: Required<IconGradient>, quote = '"') =>
  `{ from: ${quote}${g.from}${quote}, to: ${quote}${g.to}${quote}, angle: ${g.angle} }`;

const jsxProps = (options: IconOptions) =>
  changedProps(options)
    .map(([k, v]) => (typeof v === "object" ? `${k}={${gradientObject(v)}}` : typeof v === "number" ? `${k}={${v}}` : `${k}="${v}"`))
    .join(" ");

export function reactSnippet(icon: SnippetIcon, options: IconOptions, multiline = false): string {
  const element = multiline
    ? `(\n    <${icon.component}\n${jsxProps(options)
        .split(/ (?=\w+=)/)
        .map((prop) => `      ${prop}`)
        .join("\n")}\n    />\n  )`
    : `<${icon.component} ${jsxProps(options)} />`;
  return `import { ${icon.component} } from "@ikions/react";

export function Example() {
  return ${element};
}`;
}

export function vueSnippet(icon: SnippetIcon, options: IconOptions): string {
  const props = changedProps(options)
    .map(([k, v]) => {
      const name = k === "strokeWidth" ? "stroke-width" : k;
      if (typeof v === "object") return `:${name}="${gradientObject(v, "'")}"`;
      return typeof v === "number" ? `:${name}="${v}"` : `${name}="${v}"`;
    })
    .join(" ");
  return `<script setup>
import { ${icon.component} } from "@ikions/vue";
</script>

<template>
  <${icon.component} ${props} />
</template>`;
}

export function svelteSnippet(icon: SnippetIcon, options: IconOptions): string {
  return `<script>
  import { ${icon.component} } from "@ikions/svelte";
</script>

<${icon.component} ${jsxProps(options)} />`;
}

const camel = (key: string) => key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** Inline JSX with no package dependency. */
export function jsxSnippet(icon: SnippetIcon, nodes: readonly IconNode[], options: IconOptions): string {
  const gradient = activeGradient(options);
  const id = gradient ? gradientId(gradient) : "";
  const paint = gradient ? `url(#${id})` : normalizeColor(options.color);
  const root =
    options.variant === "outline"
      ? `fill="none" stroke="${paint}" strokeWidth={${round(options.strokeWidth)}} strokeLinecap="round" strokeLinejoin="round"`
      : `fill="${paint}"`;
  let defs = "";
  if (gradient) {
    const c = gradientCoords(gradient.angle);
    defs = `      <defs>
        <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}">
          <stop offset="0" stopColor="${gradient.from}" />
          <stop offset="1" stopColor="${gradient.to}" />
        </linearGradient>
      </defs>
`;
  }
  const children = nodes
    .map(([tag, attrs]) => {
      const text = Object.entries(attrs)
        .map(([k, v]) => `${camel(k)}="${v === "currentColor" ? paint : v}"`)
        .join(" ");
      return `      <${tag} ${text} />`;
    })
    .join("\n");
  return `export function ${icon.component}(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={${options.size}} height={${options.size}} viewBox="0 0 24 24" ${root} aria-hidden="true" {...props}>
${defs}${children}
    </svg>
  );
}`;
}

/** HTML using the SVG sprite shipped in @ikions/icons, or inline SVG for gradients. */
export function htmlSnippet(icon: SnippetIcon, nodes: readonly IconNode[], options: IconOptions): string {
  if (activeGradient(options)) {
    return `<!-- Gradients need the gradient definition, so inline the SVG -->
${svgMarkup(nodes, options, true).replace("<svg ", '<svg aria-hidden="true" ')}`;
  }
  const color = normalizeColor(options.color);
  const style = color === "currentColor" ? "" : ` style="color: ${color}"`;
  return `<!-- Serve node_modules/@ikions/icons/sprite/${options.variant}.svg as /ikions-${options.variant}.svg -->
<svg width="${options.size}" height="${options.size}" aria-hidden="true"${style}>
  <use href="/ikions-${options.variant}.svg#ikions-${icon.name}"></use>
</svg>

<!-- Or as an image: copy node_modules/@ikions/icons/${options.variant}/${icon.name}.svg (colour is fixed) -->
<img src="/${icon.name}.svg" width="${options.size}" height="${options.size}" alt="${icon.title}">`;
}

/** Encode an SVG for use in a CSS url(). */
export function svgDataUri(svg: string): string {
  const encoded = svg
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ");
  return `url("data:image/svg+xml,${encoded}")`;
}

/** CSS mask technique: the icon takes the element's text colour, or a gradient background. */
export function cssSnippet(icon: SnippetIcon, nodes: readonly IconNode[], options: IconOptions): string {
  const mask = svgDataUri(svgMarkup(nodes, { ...options, color: "#000", gradient: null, size: 24 }));
  const gradient = activeGradient(options);
  const background = gradient
    ? `background: linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to});`
    : `background-color: ${normalizeColor(options.color)};`;
  return `.ikion-${icon.name} {
  display: inline-block;
  width: ${options.size}px;
  height: ${options.size}px;
  ${background}
  -webkit-mask: ${mask} center / contain no-repeat;
  mask: ${mask} center / contain no-repeat;
}`;
}

/** Framework-free usage through @ikions/icons. */
export function jsSnippet(icon: SnippetIcon, options: IconOptions): string {
  const opts: string[] = [];
  if (options.size !== DEFAULT_OPTIONS.size) opts.push(`size: ${options.size}`);
  const gradient = activeGradient(options);
  if (gradient) opts.push(`gradient: ${gradientObject(gradient)}`);
  else {
    const color = normalizeColor(options.color);
    if (color !== "currentColor") opts.push(`color: "${color}"`);
  }
  if (options.variant === "outline" && round(options.strokeWidth) !== DEFAULT_STROKE_WIDTH) {
    opts.push(`strokeWidth: ${round(options.strokeWidth)}`);
  }
  const optionText = opts.length ? `, { ${opts.join(", ")} }` : "";
  return `import { toSvg } from "@ikions/icons";

const svg = toSvg("${icon.name}", "${options.variant}"${optionText});
document.querySelector("#icon").innerHTML = svg;`;
}

export function getSnippet(kind: SnippetKind, icon: SnippetIcon, nodes: readonly IconNode[], options: IconOptions): string {
  switch (kind) {
    case "svg":
      return svgMarkup(nodes, options, true);
    case "react":
      return reactSnippet(icon, options);
    case "vue":
      return vueSnippet(icon, options);
    case "svelte":
      return svelteSnippet(icon, options);
    case "jsx":
      return jsxSnippet(icon, nodes, options);
    case "html":
      return htmlSnippet(icon, nodes, options);
    case "css":
      return cssSnippet(icon, nodes, options);
    case "js":
      return jsSnippet(icon, options);
  }
}
