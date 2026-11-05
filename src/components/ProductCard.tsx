import { memo } from "react";
import { cn } from "@/utils/cn";
import { inr, type Product } from "@/lib/catalog";
import { navigate, useStore } from "@/lib/store";
import { Icon } from "./icons";
import { Stars } from "./ui";

function Badge({ text, tone }: { text: string; tone?: string }) {
  const map: Record<string, string> = {
    Bestseller: "bg-moss text-paper",
    "New Drop": "bg-ink text-mint",
    Limited: "bg-amber text-ink",
    "Staff Pick": "bg-flame text-white",
    "Low Stock": "bg-flame-soft text-flame",
  };
  return (
    <span
      className={cn("rounded-full px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.16em] uppercase", map[text] ?? "bg-ink text-paper")}
      style={tone ? { background: tone } : undefined}
    >
      {text}
    </span>
  );
}

export const ProductCard = memo(function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { add, wish, toggleWish, openDrawer } = useStore();
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const saved = wish.includes(p.id);
  const out = p.stock === 0;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-paper-2 transition-all duration-500 hover:-translate-y-1.5 hover:border-ink/20 hover:shadow-lift"
      style={{ animationDelay: `${index * 24}ms` }}
    >
      <button
        onClick={() => navigate(`/p/${p.slug}`)}
        className="zoomable relative block aspect-4/5 w-full overflow-hidden bg-paper-3 text-left"
        aria-label={`View ${p.name}`}
      >
        <img
          src={p.images[0]}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={p.images[1]}
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-70 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
          style={{ background: `linear-gradient(to top, ${p.colour}55, transparent)` }}
        />
        {out && (
          <span className="absolute inset-0 grid place-items-center bg-ink/70 backdrop-blur-[2px]">
            <span className="rotate-[-8deg] rounded-full border border-paper/40 px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-paper uppercase">
              Sold out
            </span>
          </span>
        )}
      </button>

      <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
        {p.badge && !out && <Badge text={p.badge} />}
        {off >= 25 && !out && <Badge text={`${off}% off`} tone="#ef4b23" />}
      </div>

      <button
        onClick={() => toggleWish(p.id)}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        className={cn(
          "absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-all duration-300 active:scale-90",
          saved ? "border-flame bg-flame text-white" : "border-ink/10 bg-paper-2/85 text-ink hover:border-flame hover:text-flame",
        )}
      >
        <Icon n="heart" className="h-4 w-4" sw={1.8} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">{p.brand}</span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-soft">
            <Stars value={p.rating} className="h-3 w-3" />
            {p.rating.toFixed(1)}
            <span className="text-soft/60">({p.reviewCount})</span>
          </span>
        </div>

        <button onClick={() => navigate(`/p/${p.slug}`)} className="text-left">
          <h3 className="line-clamp-2 font-display text-[16.5px] leading-[1.15] font-bold text-ink transition-colors group-hover:text-moss">
            {p.name}
          </h3>
        </button>

        <div className="flex items-center gap-2 text-[11.5px] text-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/10" style={{ background: p.colour }} />
            {p.flavour === "N/A" ? p.category : p.flavour}
          </span>
          {p.puffs > 0 && <span className="font-mono">· {p.puffs.toLocaleString()} puffs</span>}
          {p.nicotine > 0 && <span className="font-mono">· {p.nicotine}%</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[21px] font-extrabold text-ink">{inr(p.price)}</span>
              {off > 0 && <span className="font-mono text-[11.5px] text-soft line-through">{inr(p.mrp)}</span>}
            </div>
            <span className={cn("mt-0.5 inline-block font-mono text-[10px] tracking-wider uppercase", out ? "text-flame" : p.stock < 10 ? "text-amber" : "text-moss")}>
              {out ? "Restocking soon" : p.stock < 10 ? `Only ${p.stock} left` : "In stock"}
            </span>
          </div>
          <button
            disabled={out}
            onClick={() => { add(p); openDrawer(); }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition-all duration-300 hover:bg-moss hover:shadow-lift active:scale-90 disabled:bg-line disabled:text-soft"
            aria-label={`Add ${p.name} to bag`}
          >
            <Icon n="bag" className="h-[18px] w-[18px]" sw={1.7} />
          </button>
        </div>
      </div>
    </article>
  );
});

export function ProductRow({ p }: { p: Product }) {
  const { add, openDrawer } = useStore();
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  return (
    <article className="group flex gap-4 rounded-[20px] border border-line bg-paper-2 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card sm:gap-5 sm:p-4">
      <button onClick={() => navigate(`/p/${p.slug}`)} className="zoomable relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-paper-3 sm:h-36 sm:w-32">
        <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">{p.brand} · {p.category}</span>
            <button onClick={() => navigate(`/p/${p.slug}`)} className="mt-1 block text-left">
              <h3 className="line-clamp-2 font-display text-[17px] font-bold text-ink group-hover:text-moss">{p.name}</h3>
            </button>
            <p className="mt-1.5 line-clamp-2 hidden text-[13px] leading-relaxed text-soft sm:block">{p.blurb}</p>
          </div>
          <div className="text-right">
            <div className="font-display text-[20px] font-extrabold">{inr(p.price)}</div>
            {off > 0 && <div className="font-mono text-[11px] text-soft line-through">{inr(p.mrp)}</div>}
            <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[11px] text-soft">
              <Stars value={p.rating} className="h-3 w-3" /> {p.rating.toFixed(1)}
            </div>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-mono text-[10.5px] tracking-wider text-moss uppercase">
            {p.stock === 0 ? "Sold out" : p.stock < 10 ? `Only ${p.stock} left` : `${p.stock} in stock`}
          </span>
          <button
            disabled={p.stock === 0}
            onClick={() => { add(p); openDrawer(); }}
            className="rounded-full bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper transition hover:bg-moss disabled:bg-line disabled:text-soft"
          >
            Add to bag
          </button>
        </div>
      </div>
    </article>
  );
}
