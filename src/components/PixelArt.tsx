import type { Picture } from "@/lib/pictures";

const key = (id: string) => `taxmalarbok:${id}`;
export function loadProgress(p: Picture): boolean[][] | null {
  try {
    const v = localStorage.getItem(key(p.id));
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export function saveProgress(p: Picture, painted: boolean[][]) {
  localStorage.setItem(key(p.id), JSON.stringify(painted));
}

export function grayOf(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255;
  const g = Math.round(200 + l * 50);
  return `rgb(${g},${g},${g})`;
}

export function PixelArt({
  picture,
  painted,
  preview,
  selected,
}: {
  picture: Picture;
  painted: boolean[][] | null;
  preview?: boolean;
  selected?: number | undefined;
}) {
  const h = picture.grid.length;
  const w = picture.grid[0]!.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full rounded-2xl" shapeRendering="crispEdges">
      {picture.grid.map((row, y) =>
        row.map((c, x) => {
          const isPainted = painted?.[y]?.[x];
          const fill = isPainted ? picture.palette[c] : grayOf(picture.palette[c]!);
          const hl = !isPainted && selected === c;
          return (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width={1.02} height={1.02} fill={hl ? "#9aa0a6" : fill} />
              {!preview && !isPainted && (
                <text x={x + 0.5} y={y + 0.68} fontSize={0.45} textAnchor="middle" fill={hl ? "#fff" : "#777"} style={{ pointerEvents: "none" }}>
                  {c + 1}
                </text>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}
