/**
 * Minimal SVG path-data parser used for validation. It checks syntax and
 * argument counts and collects absolute points (end and control points) so
 * the validator can check that geometry stays on the artboard.
 */

const ARG_COUNTS: Record<string, number> = {
  m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0,
};

export interface PathParseResult {
  ok: boolean;
  error?: string;
  points: Array<[number, number]>;
}

const TOKEN = /([MmLlHhVvCcSsQqTtAaZz])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)|([\s,]+)|(.)/g;

export function parsePathData(d: string): PathParseResult {
  // Commands are kept as letters; numbers are kept as raw strings (prefixed
  // with "#") so arc flags written without separators ("011") can be split.
  const tokens: string[] = [];
  for (const match of d.matchAll(TOKEN)) {
    if (match[1]) tokens.push(match[1]);
    else if (match[2]) tokens.push(`#${match[2]}`);
    else if (match[4]) return { ok: false, error: `unexpected character "${match[4]}"`, points: [] };
  }

  const points: Array<[number, number]> = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  if (tokens[0] === undefined || tokens[0].toLowerCase() !== "m") {
    return { ok: false, error: "path must start with a moveto command", points };
  }

  while (i < tokens.length) {
    const token = tokens[i]!;
    if (!token.startsWith("#")) {
      cmd = token;
      i++;
      if (cmd.toLowerCase() === "z") {
        x = startX;
        y = startY;
        continue;
      }
    } else if (!cmd || cmd.toLowerCase() === "z") {
      return { ok: false, error: "number without a command", points };
    }

    const lower = cmd.toLowerCase();
    const count = ARG_COUNTS[lower];
    if (count === undefined) return { ok: false, error: `unknown command ${cmd}`, points };
    const args: number[] = [];
    while (args.length < count) {
      const t = tokens[i];
      if (t === undefined || !t.startsWith("#")) {
        return { ok: false, error: `command ${cmd} expects ${count} arguments`, points };
      }
      if (lower === "a" && (args.length === 3 || args.length === 4)) {
        const raw = t.slice(1);
        if (raw[0] !== "0" && raw[0] !== "1") {
          return { ok: false, error: "invalid arc flag", points };
        }
        args.push(Number(raw[0]));
        const rest = raw.slice(1);
        if (rest.length > 0) tokens[i] = `#${rest}`;
        else i++;
        continue;
      }
      const value = Number(t.slice(1));
      if (!Number.isFinite(value)) return { ok: false, error: `invalid number ${t.slice(1)}`, points };
      args.push(value);
      i++;
    }

    const rel = cmd === lower;
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (lower) {
      case "m":
        x = ox + args[0]!;
        y = oy + args[1]!;
        startX = x;
        startY = y;
        points.push([x, y]);
        // Subsequent pairs after a moveto are implicit linetos.
        cmd = rel ? "l" : "L";
        break;
      case "l":
      case "t":
        x = ox + args[0]!;
        y = oy + args[1]!;
        points.push([x, y]);
        break;
      case "h":
        x = ox + args[0]!;
        points.push([x, y]);
        break;
      case "v":
        y = oy + args[0]!;
        points.push([x, y]);
        break;
      case "c":
        points.push([ox + args[0]!, oy + args[1]!], [ox + args[2]!, oy + args[3]!]);
        x = ox + args[4]!;
        y = oy + args[5]!;
        points.push([x, y]);
        break;
      case "s":
      case "q":
        points.push([ox + args[0]!, oy + args[1]!]);
        x = ox + args[2]!;
        y = oy + args[3]!;
        points.push([x, y]);
        break;
      case "a":
        if (args[0]! < 0 || args[1]! < 0) return { ok: false, error: "negative arc radius", points };
        x = ox + args[5]!;
        y = oy + args[6]!;
        points.push([x, y]);
        break;
    }
  }
  return { ok: true, points };
}
