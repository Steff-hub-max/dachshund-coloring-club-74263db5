import { useMemo } from "react";
import type { Picture } from "@/lib/pictures";

export type Regions = {
  ids: number[][]; // upscaled region map
  scale: number;
  color: number[]; // region -> color index
  label: { x: number; y: number; size: number }[];
  paths: string[];
};

function epx(m: number[][]): number[][] {
  const h = m.length, w = m[0]!.length;
  const g = (y: number, x: number) => m[Math.min(h - 1, Math.max(0, y))]![Math.min(w - 1, Math.max(0, x))]!;
  const out: number[][] = Array.from({ length: h * 2 }, () => Array(w * 2).fill(0));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const P = g(y, x), A = g(y - 1, x), B = g(y, x + 1), C = g(y, x - 1), D = g(y + 1, x);
      out[y * 2]![x * 2] = C === A && C !== D && A !== B ? A : P;
      out[y * 2]![x * 2 + 1] = A === B && A !== C && B !== D ? B : P;
      out[y * 2 + 1]![x * 2] = D === C && D !== B && C !== A ? C : P;
      out[y * 2 + 1]![x * 2 + 1] = B === D && B !== A && D !== C ? D : P;
    }
  return out;
}

const cache = new Map<string, Regions>();
export function getRegions(p: Picture): Regions {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const h = p.grid.length, w = p.grid[0]!.length;
  const base: number[][] = p.grid.map((r) => r.map(() => -1));
  const color: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (base[y]![x]! >= 0) continue;
      const id = color.length, c = p.grid[y]![x]!;
      color.push(c);
      const st = [[y, x]];
      base[y]![x] = id;
      while (st.length) {
        const [cy, cx] = st.pop()!;
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const ny = cy! + dy, nx = cx! + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && base[ny]![nx] === -1 && p.grid[ny]![nx] === c) {
            base[ny]![nx] = id;
            st.push([ny, nx]);
          }
        }
      }
    }
  const ids = epx(epx(base));
  const scale = 4, s = 1 / scale;
  const paths = color.map(() => "");
  const cells: [number, number][][] = color.map(() => []);
  ids.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const id = row[x]!;
      let e = x;
      while (e < row.length && row[e] === id) { cells[id]!.push([x + (e - x), y]); e++; }
      paths[id] += `M${x * s} ${y * s}h${(e - x) * s}v${s}h${-(e - x) * s}z`;
      x = e;
    }
  });
  const label = cells.map((cs) => {
    const cx = cs.reduce((a, c) => a + c[0], 0) / cs.length, cy = cs.reduce((a, c) => a + c[1], 0) / cs.length;
    let best = cs[0]!, bd = Infinity;
    for (const c of cs) { const d = (c[0] - cx) ** 2 + (c[1] - cy) ** 2; if (d < bd) { bd = d; best = c; } }
    return { x: (best[0] + 0.5) * s, y: (best[1] + 0.5) * s, size: Math.min(1.1, 0.35 + Math.sqrt(cs.length * s * s) * 0.12) };
  });
  const r = { ids, scale, color, label, paths };
  cache.set(p.id, r);
  return r;
}

const key = (id: string) => `taxmalarbok:v2:${id}`;
export function loadProgress(p: Picture): boolean[] | null {
  try {
    const v = localStorage.getItem(key(p.id));
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export function saveProgress(p: Picture, painted: boolean[]) {
  localStorage.setItem(key(p.id), JSON.stringify(painted));
}

export function grayOf(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255;
  const g = Math.round(205 + l * 45);
  return `rgb(${g},${g},${g})`;
}

export function PixelArt({
  picture,
  painted,
  preview,
  selected,
}: {
  picture: Picture;
  painted: boolean[] | null;
  preview?: boolean;
  selected?: number | undefined;
}) {
  const reg = useMemo(() => getRegions(picture), [picture]);
  const h = picture.grid.length, w = picture.grid[0]!.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full rounded-2xl" shapeRendering="geometricPrecision">
      {reg.paths.map((d, i) => {
        const c = reg.color[i]!, col = picture.palette[c]!, on = painted?.[i];
        const fill = on ? col : selected === c ? "#a3a8ad" : grayOf(col);
        return <path key={i} d={d} fill={fill} stroke={on ? col : fill} strokeWidth={0.03} />;
      })}
      {!preview &&
        reg.paths.map((d, i) =>
          painted?.[i] ? null : <path key={`o${i}`} d={d} fill="none" stroke="#fff" strokeOpacity={0} />,
        )}
      {!preview &&
        reg.label.map((l, i) =>
          painted?.[i] ? null : (
            <text key={`t${i}`} x={l.x} y={l.y + l.size * 0.35} fontSize={l.size} textAnchor="middle"
              fill={selected === reg.color[i] ? "#fff" : "#777"} style={{ pointerEvents: "none", fontFamily: "Nunito" }}>
              {reg.color[i]! + 1}
            </text>
          ),
        )}
    </svg>
  );
}
