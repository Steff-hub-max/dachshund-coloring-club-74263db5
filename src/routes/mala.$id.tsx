import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PICTURES } from "@/lib/pictures";
import { loadProgress, PixelArt, saveProgress } from "@/components/PixelArt";

export const Route = createFileRoute("/mala/$id")({
  loader: ({ params }) => {
    const p = PICTURES.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Måla"} – Taxmålarbok` },
      { name: "description", content: "Måla taxen med siffror." },
      { property: "og:title", content: `${loaderData?.name} – Taxmålarbok` },
      { property: "og:description", content: "Måla taxen med siffror." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Paint,
});

function Paint() {
  const p = Route.useLoaderData();
  const empty = () => p.grid.map((r) => r.map(() => false));
  const [painted, setPainted] = useState<boolean[][]>(empty);
  const [sel, setSel] = useState(0);
  const [zoom, setZoom] = useState(1);
  const drawing = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setPainted(loadProgress(p) ?? empty()), [p.id]);

  const remaining = (c: number) => p.grid.flat().filter((v, i) => v === c && !painted.flat()[i]).length;
  const done = painted.flat().every(Boolean);

  const paintAt = (cx: number, cy: number) => {
    const el = ref.current?.querySelector("svg");
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.floor(((cx - r.left) / r.width) * p.grid[0].length);
    const y = Math.floor(((cy - r.top) / r.height) * p.grid.length);
    if (p.grid[y]?.[x] !== sel || painted[y][x]) return;
    setPainted((prev) => {
      const n = prev.map((row) => [...row]);
      n[y][x] = true;
      saveProgress(p, n);
      return n;
    });
  };

  useEffect(() => {
    if (remaining(sel) === 0) {
      const next = p.palette.findIndex((_, i) => remaining(i) > 0);
      if (next >= 0) setSel(next);
    }
  }, [painted]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="rounded-full bg-card px-4 py-2 font-semibold shadow-soft">← Tillbaka</Link>
        <h1 className="font-display text-xl text-primary">{p.name}</h1>
        <div className="flex gap-1">
          <button className="h-9 w-9 rounded-full bg-card font-bold shadow-soft" onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>−</button>
          <button className="h-9 w-9 rounded-full bg-card font-bold shadow-soft" onClick={() => setZoom((z) => Math.min(3, z + 0.5))}>+</button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-2">
        <div
          ref={ref}
          style={{ width: `${zoom * 100}%`, touchAction: "none" }}
          onPointerDown={(e) => { drawing.current = true; paintAt(e.clientX, e.clientY); }}
          onPointerMove={(e) => drawing.current && paintAt(e.clientX, e.clientY)}
          onPointerUp={() => (drawing.current = false)}
          onPointerLeave={() => (drawing.current = false)}
        >
          <PixelArt picture={p} painted={painted} selected={done ? undefined : sel} preview={done} />
        </div>
        {done && (
          <div className="mt-6 text-center animate-in zoom-in">
            <p className="font-display text-3xl text-primary">Voff! Klart! 🎉</p>
            <button className="mt-3 rounded-full bg-secondary px-5 py-2 font-semibold" onClick={() => { const e = empty(); setPainted(e); saveProgress(p, e); }}>
              Måla igen
            </button>
          </div>
        )}
      </div>

      {!done && (
        <nav className="sticky bottom-0 flex gap-3 overflow-x-auto bg-card px-4 py-4 shadow-soft">
          {p.palette.map((col, i) => {
            const left = remaining(i);
            return (
              <button
                key={i}
                disabled={left === 0}
                onClick={() => setSel(i)}
                style={{ backgroundColor: col }}
                className={`relative h-14 w-14 shrink-0 rounded-full border-4 text-lg font-bold transition ${sel === i ? "scale-110 border-primary" : "border-card"} ${left === 0 ? "opacity-30" : ""}`}
              >
                <span className="rounded-full bg-card/80 px-1.5 text-foreground">{left === 0 ? "✓" : i + 1}</span>
              </button>
            );
          })}
        </nav>
      )}
    </main>
  );
}
