import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PICTURES } from "@/lib/pictures";
import { getRegions, loadProgress, PixelArt } from "@/components/PixelArt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taxmålarbok – måla taxar med siffror" },
      { name: "description", content: "Avkopplande målarspel med siffror där alla bilder är taxar." },
      { property: "og:title", content: "Taxmålarbok" },
      { property: "og:description", content: "Måla taxar med siffror – helt utan reklam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [progress, setProgress] = useState<Record<string, boolean[] | null>>({});
  useEffect(() => {
    setProgress(Object.fromEntries(PICTURES.map((p) => [p.id, loadProgress(p)])));
  }, []);
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-8">
      <h1 className="font-display text-4xl text-primary">Taxmålarbok</h1>
      <p className="mb-6 text-muted-foreground">Välj en tax att måla 🐾</p>
      <div className="grid grid-cols-2 gap-4">
        {PICTURES.map((p) => {
          const pr = progress[p.id];
          const total = getRegions(p).color.length;
          const done = pr ? pr.filter(Boolean).length : 0;
          return (
            <Link key={p.id} to="/mala/$id" params={{ id: p.id }} className="rounded-3xl bg-card p-3 shadow-soft transition active:scale-95">
              <PixelArt picture={p} painted={pr ?? null} preview />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-semibold">{p.name}</span>
                <span className="text-muted-foreground">{Math.round((done / total) * 100)}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
