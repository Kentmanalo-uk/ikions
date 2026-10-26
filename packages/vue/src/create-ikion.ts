import { defineComponent, h, type PropType } from "vue";
import { resolveGradient, type IkionGradient } from "./gradient.js";
import type { IkionNode, IkionVariant } from "./types.js";

export const DEFAULT_SIZE = 24;
export const DEFAULT_STROKE_WIDTH = 1.75;

/** Build a Vue icon component from its outline and filled node data. */
export function createIkion(
  iconName: string,
  displayName: string,
  nodes: Readonly<Record<IkionVariant, readonly IkionNode[]>>,
) {
  return defineComponent({
    name: displayName,
    props: {
      size: { type: [Number, String] as PropType<number | string>, default: DEFAULT_SIZE },
      color: { type: String, default: "currentColor" },
      gradient: { type: Object as PropType<IkionGradient>, default: undefined },
      variant: { type: String as PropType<IkionVariant>, default: "outline" },
      strokeWidth: { type: [Number, String] as PropType<number | string>, default: DEFAULT_STROKE_WIDTH },
      title: { type: String, default: undefined },
    },
    setup(props, { attrs, slots }) {
      return () => {
        const variant: IkionVariant = props.variant === "filled" ? "filled" : "outline";
        const g = resolveGradient(props.gradient);
        const ink = g ? `url(#${g.id})` : "currentColor";
        const paint =
          variant === "filled"
            ? { fill: ink }
            : {
                fill: "none",
                stroke: ink,
                "stroke-width": props.strokeWidth,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
              };
        const labelled = Boolean(props.title) || attrs["aria-label"] !== undefined || attrs["aria-labelledby"] !== undefined;
        const a11y = labelled
          ? { role: "img", ...(props.title ? { "aria-label": props.title } : {}) }
          : { "aria-hidden": "true" };
        return h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: props.size,
            height: props.size,
            viewBox: "0 0 24 24",
            color: props.color,
            ...paint,
            class: ["ikion", `ikion-${iconName}`],
            "data-variant": variant,
            ...a11y,
          },
          [
            props.title ? h("title", props.title) : null,
            g
              ? h("defs", [
                  h("linearGradient", { id: g.id, gradientUnits: "userSpaceOnUse", x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2 }, [
                    h("stop", { offset: "0", "stop-color": g.from }),
                    h("stop", { offset: "1", "stop-color": g.to }),
                  ]),
                ])
              : null,
            ...nodes[variant].map(([tag, nodeAttrs]) =>
              h(tag, g ? Object.fromEntries(Object.entries(nodeAttrs).map(([k, v]) => [k, v === "currentColor" ? ink : v])) : { ...nodeAttrs }),
            ),
            slots.default?.(),
          ],
        );
      };
    },
  });
}
