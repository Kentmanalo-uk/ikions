import { optimize, type Config } from "svgo";
import { ROOT_ATTRS, type IconNode, type Variant } from "./schema.ts";
import { nodesToSvg, parseSvg, toNodes } from "./svg.ts";

/**
 * Conservative SVGO settings. Shapes are kept as shapes (readable, easy to
 * diff) and paths are never merged, because merging can change how
 * even-odd cutouts in filled icons are resolved. A geometry test renders
 * source and optimized output and compares pixels.
 */
const config: Config = {
  multipass: true,
  floatPrecision: 3,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          convertShapeToPath: false,
          mergePaths: false,
          collapseGroups: false,
          moveElemsAttrsToGroup: false,
          moveGroupAttrsToElems: false,
          removeUnknownsAndDefaults: { keepRoleAttr: true, keepDataAttrs: false },
          // Curve-to-arc conversion approximates geometry; keep curves exact.
          convertPathData: { makeArcs: false as unknown as undefined },
        },
      },
    },
  ],
};

export interface OptimizedVariant {
  svg: string;
  nodes: IconNode[];
}

export function optimizeVariant(source: string, variant: Variant): OptimizedVariant {
  const { data } = optimize(source, config);
  const { children } = parseSvg(data);
  const nodes = toNodes(children).map(([tag, attrs]): IconNode => {
    const clean = { ...attrs };
    // Children inherit root presentation attributes; drop exact duplicates.
    for (const [key, value] of Object.entries(ROOT_ATTRS[variant])) {
      if (clean[key] === value) delete clean[key];
    }
    return [tag, clean];
  });
  return { svg: nodesToSvg(variant, nodes), nodes };
}
