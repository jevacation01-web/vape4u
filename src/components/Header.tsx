import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { PRODUCTS, inr } from "@/lib/catalog";
import { navigate, useRoute, useStore } from "@/lib/store";
import { Icon } from "./icons";
import { Marquee } from "./ui";

const TICKER = [
  "156 varieties live on the shelf",
  "Free delivery over ₹999",
  "21+ only · ID checked at the door",
  "Nicotine is addictive — this is a demo storefront",
  "New flavour drop every Friday 8pm",
  "No parcel will ever arrive. Read the receipt at checkout.",
];

export function Ticker() {
  return (
    <div className="relative z-50 overflow-hidden border-b border-white/10 bg-ink text-paper">
      <Marquee className="py-2">
        {TICKER.map((t) => (
          <span key={t} className="flex items-center gap-6 px-6 font-mono text-[10.5px] tracking-[0.2em] whitespace-nowrap uppercase">
            <span className="text-mint">{t}</span>
            <span className="h-1 w-1 rounded-full bg-flame" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}

const NAV = [
  { label: "Shop all", href: "/shop" },
  { label: "Disposables", href: "/shop?cat=Disposables" },
  { label: "Pod kits", href: "/shop?cat=Pod Kits" },
  { label: "E-liquids", href: "/shop?cat=E-Liquids" },
  { label: "Under ₹999", href: "/shop?max=999" },
  { label: "Zero nic", href: "/shop?cat=Zero Nicotine" },
];

export function Header() {
  const { count, subtotal, openDrawer, wish } = useStore();
  const route = useRoute();
  const [stuck, setStuck] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setStuck(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const on = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setFocus(false);
    };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, []);

  useEffect(() => { setMenu(false); setFocus(false); }, [route]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s) || p.flavour.toLowerCase().includes(s),
    ).slice(0, 6);
  }, [q]);

  const go = (href: string) => { navigate(href); setMenu(false); };

  return (
    <>
      <Ticker />
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          stuck ? "border-b border-line bg-paper/85 backdrop-blur-xl" : "border-b border-transparent bg-paper",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-10">
          <button onClick={() => setMenu((m) => !m)} className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition hover:bg-ink/5 lg:hidden" aria-label="Menu">
            <Icon n={menu ? "close" : "menu"} className="h-5 w-5" />
          </button>

          <button onClick={() => go("/")} className="group flex shrink-0 items-baseline gap-1.5 py-4" aria-label="vape4u home">
            <span className={cn("font-display font-extrabold tracking-[-0.04em] text-ink transition-all duration-500", stuck ? "text-[24px]" : "text-[28px]")}>
              vape<span className="text-flame">4</span>u
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-flame/60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-flame" />
            </span>
          </button>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV.slice(0, 5).map((n) => (
              <button
                key={n.label}
                onClick={() => go(n.href)}
                className="group relative rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-soft transition-colors hover:text-ink"
              >
                {n.label}
                <span className="absolute inset-x-3.5 -bottom-px h-[2px] origin-left scale-x-0 bg-flame transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div ref={box} className="relative ml-auto hidden min-w-0 flex-1 max-w-sm md:block">
            <Icon n="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-soft" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setFocus(true); }}
              onFocus={() => setFocus(true)}
              onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`); if (e.key === "Escape") setFocus(false); }}
              placeholder="Search 156 varieties, brands, flavours…"
              className="w-full rounded-full border border-line bg-paper-2 py-2.5 pr-4 pl-10 text-[13.5px] text-ink placeholder:text-soft/70 focus:border-moss focus:ring-2 focus:ring-moss/15 focus:outline-none"
            />
            {focus && results.length > 0 && (
              <div className="absolute inset-x-0 top-[calc(100%+10px)] overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-lift [animation:drop_0.3s_ease-out]">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { go(`/p/${p.slug}`); setQ(""); }}
                    className="flex w-full items-center gap-3 border-b border-line/70 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-paper"
                  >
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{p.name}</span>
                      <span className="block font-mono text-[10.5px] tracking-wider text-soft uppercase">{p.brand} · {p.category}</span>
                    </span>
                    <span className="font-display text-[14px] font-bold">{inr(p.price)}</span>
                  </button>
                ))}
                <button onClick={() => go(`/shop?q=${encodeURIComponent(q)}`)} className="w-full bg-paper px-3 py-2.5 text-center font-mono text-[10.5px] tracking-[0.18em] text-moss uppercase transition hover:bg-mint">
                  See every match →
                </button>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button onClick={() => go("/shop?wish=1")} className="relative hidden h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-ink/5 sm:grid" aria-label="Saved items">
              <Icon n="heart" className="h-[19px] w-[19px]" />
              {wish.length > 0 && (
                <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-flame px-1 font-mono text-[9px] font-bold text-white">{wish.length}</span>
              )}
            </button>
            <button
              onClick={openDrawer}
              className="group relative flex h-11 items-center gap-2.5 rounded-full bg-ink pr-4 pl-3.5 text-paper transition-all duration-300 hover:bg-moss active:scale-95"
            >
              <Icon n="bag" className="h-[19px] w-[19px]" sw={1.7} />
              <span className="font-mono text-[12px] tabular-nums">{count}</span>
              <span className="hidden h-4 w-px bg-paper/25 sm:block" />
              <span className="hidden font-mono text-[12px] tabular-nums sm:block">{inr(subtotal)}</span>
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-flame ring-2 ring-paper" />}
            </button>
          </div>
        </div>

        <div className={cn("overflow-hidden border-t border-line bg-paper-2 transition-all duration-500 lg:hidden", menu ? "max-h-[420px]" : "max-h-0")}>
          <div className="space-y-1 px-4 py-4">
            <div className="relative mb-3 md:hidden">
              <Icon n="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`); }}
                placeholder="Search the shelf…"
                className="w-full rounded-full border border-line bg-paper py-2.5 pr-4 pl-10 text-[13.5px] focus:border-moss focus:outline-none"
              />
            </div>
            {NAV.concat([{ label: "Saved items", href: "/shop?wish=1" }]).map((n) => (
              <button key={n.label} onClick={() => go(n.href)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-display text-[18px] font-bold text-ink transition hover:bg-paper hover:text-moss">
                {n.label}
                <Icon n="arrow" className="h-4 w-4 text-soft" />
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
