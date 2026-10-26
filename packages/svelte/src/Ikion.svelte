<script lang="ts">
  import { resolveGradient } from "./gradient.js";
  import type { IkionProps, IkionVariant } from "./types.js";

  type Node = readonly [string, Readonly<Record<string, string>>];

  let {
    size = 24,
    color = "currentColor",
    gradient,
    variant = "outline",
    strokeWidth = 1.75,
    title,
    class: className = "",
    iconName,
    nodes,
    ...rest
  }: IkionProps & { iconName: string; nodes: Readonly<Record<IkionVariant, readonly Node[]>> } = $props();

  const resolved: IkionVariant = $derived(variant === "filled" ? "filled" : "outline");
  const labelled = $derived(Boolean(title) || rest["aria-label"] !== undefined || rest["aria-labelledby"] !== undefined);
  const g = $derived(resolveGradient(gradient));
  const ink = $derived(g ? `url(#${g.id})` : "currentColor");
  const paintAttrs = (attrs: Readonly<Record<string, string>>) =>
    g ? Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, v === "currentColor" ? ink : v])) : attrs;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  {color}
  fill={resolved === "filled" ? ink : "none"}
  stroke={resolved === "outline" ? ink : undefined}
  stroke-width={resolved === "outline" ? strokeWidth : undefined}
  stroke-linecap={resolved === "outline" ? "round" : undefined}
  stroke-linejoin={resolved === "outline" ? "round" : undefined}
  class={["ikion", `ikion-${iconName}`, className].filter(Boolean).join(" ")}
  data-variant={resolved}
  role={labelled ? "img" : undefined}
  aria-hidden={labelled ? undefined : "true"}
  aria-label={title}
  {...rest}
>
  {#if title}<title>{title}</title>{/if}
  {#if g}
    <defs>
      <linearGradient id={g.id} gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
        <stop offset="0" stop-color={g.from} />
        <stop offset="1" stop-color={g.to} />
      </linearGradient>
    </defs>
  {/if}
  {#each nodes[resolved] as [tag, attrs], i (i)}
    <svelte:element this={tag} xmlns="http://www.w3.org/2000/svg" {...paintAttrs(attrs)} />
  {/each}
</svg>
