export type Picture = { id: string; name: string; palette: string[]; grid: number[][] };

const W = 24;

const DOG = [
  "...................bb...",
  "..................bbbb..",
  ".................bbdbbbd",
  ".................cbbbbbb",
  ".b...............ccbbb..",
  "..bbbbbbbbbbbbbbbccbb...",
  "..bbbbbbbbbbbbbbbbbb....",
  "..bbbbbbbbbbbbbbbbbb....",
  "...bbbbbbbbbbbbbbbb.....",
  "...bb............bb.....",
  "...cb............cb.....",
];

function compose(bg: string[], dogOffsetY: number, extra: Record<string, string> = {}) {
  const rows = bg.map((r) => r.padEnd(W, r[0]).slice(0, W).split(""));
  DOG.forEach((r, y) =>
    r.split("").forEach((ch, x) => {
      if (ch !== "." && rows[y + dogOffsetY]) rows[y + dogOffsetY]![x] = extra[ch] ?? ch;
    }),
  );
  return rows;
}

function build(id: string, name: string, colors: Record<string, string>, rows: string[][]): Picture {
  const keys = Object.keys(colors);
  return {
    id,
    name,
    palette: keys.map((k) => colors[k]!),
    grid: rows.map((r) => r.map((ch) => Math.max(0, keys.indexOf(ch)))),
  };
}

const sky = (n: number, ground: string, gRows: number) =>
  [...Array(n - gRows).fill("a"), ...Array(gRows).fill(ground)];

export const PICTURES: Picture[] = [
  build(
    "klassisk",
    "Klassisk tax",
    { a: "#9fd8f0", b: "#b5651d", c: "#7a3e10", d: "#222222", e: "#6cbf4b" },
    compose(sky(15, "e", 2), 2),
  ),
  build(
    "hjarta",
    "Taxkärlek",
    { a: "#ffd6e0", h: "#e63957", b: "#2b2b2b", c: "#c97b3c", d: "#ffffff", e: "#f7a8c0" },
    compose(
      [
        "aaahhaahhaaaaaaaaaaaaaaa",
        "aahhhhhhhhaaaaaaaaaaaaaa",
        "aahhhhhhhhaaaaaaaaaaaaaa",
        "aaahhhhhhaaaaaaaaaaaaaaa",
        "aaaahhhhaaaaaaaaaaaaaaaa",
        "aaaaahhaaaaaaaaaaaaaaaaa",
        "a", "a", "a", "a", "a", "a", "a", "e", "e",
      ],
      2,
    ),
  ),
  build(
    "natt",
    "Natt-tax",
    { a: "#1d2b53", m: "#fff1a8", s: "#ffffff", b: "#d9a066", c: "#a86b32", d: "#111111", e: "#3b5d3a" },
    compose(
      [
        "aaaaaaaaaaaaaaaaaaaaaaaa",
        "aamamaaaaaasaaaaaaaaasaa",
        "amaaaaaaaaaaaaaasaaaaaaa",
        "amaaaaasaaaaaaaaaaaaaaaa",
        "aammaaaaaaaaaaaaaaaaaaaa",
        "a", "a", "a", "a", "a", "a", "a", "a", "e", "e",
      ],
      2,
    ),
  ),
  build(
    "strand",
    "Strandtax",
    { a: "#7fd3ff", y: "#ffd23f", w: "#2a9df4", b: "#8b4a2b", c: "#5a2e18", d: "#000000", e: "#f4d58d" },
    compose(
      [
        "aaaaaaaaaaaaaaaaaaayyaaa",
        "aaaaaaaaaaaaaaaaaayyyyaa",
        "aaaaaaaaaaaaaaaaaayyyyaa",
        "aaaaaaaaaaaaaaaaaaayyaaa",
        "a", "a",
        "w", "w", "w", "w", "w", "w",
        "eeeeeeeeeeeeeeeeeeeeeeee", "e", "e", "e",
      ],
      5,
    ),
  ),
  build(
    "sno",
    "Vintertax",
    { a: "#cfe8f7", s: "#ffffff", b: "#2b2b2b", c: "#d08a4a", d: "#ff3b3b", r: "#d62828" },
    compose(
      [
        "asaaaasaaaaasaaaaaasaaaa",
        "aaaasaaaaasaaaaasaaaaasa",
        "aasaaaaaasaaaaaaaaasaaaa",
        "a", "a", "a", "a", "a", "a", "a", "a", "a", "a",
        "s", "s",
      ],
      3,
      {},
    ).map((r, y) => (y === 8 ? r.map((ch, x) => (x >= 15 && x <= 18 ? "r" : ch)) : r)),
  ),
];
