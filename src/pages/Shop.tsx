import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { BRANDS, CATEGORIES, FLAVOURS, PRODUCTS, inr, type Category } from "@/lib/catalog";
import { navigate, useRoute, useStore } from "@/lib/store";
import { Icon } from "@/components/icons";
import { Btn, Chip, Reveal, Stars } from "@/components/ui";
import { ProductCard, ProductRow } from "@/components/ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "newest" | "name";
const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · low to high" },
  { id: "price-desc", label: "Price · high to low" },
  { id: "rating", label: "Top rated" },
  { id: "newest", label: "Newest in" },
  { id: "name", label: "A → Z" },
];

const NICS = [0, 2, 3, 5, 6];
const PAGE = 24;

type Filters = {
  q: string;
  cats: Category[];
  brands: string[];
  flavours: string[];
  nics: number[];
  max: number;
  min: number;
  rating: number;
  stockOnly: boolean;
  badges: string[];
  wishOnly: boolean;
};

const EMPTY: Filters = {
  q: "", cats: [], brands: [], flavours: [], nics: [],
  max: 8000, min: 0, rating: 0, stockOnly: false, badges: [], wishOnly: false,
};

export function Shop() {
  const route = useRoute();
  const { wish } = useStore();
  const [f, setF] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<Sort>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  /* read filters from the URL whenever we navigate in */
  useEffect(() => {
    if (route.name !== "shop") return;
    const p = route.params;
    setF({
      ...EMPTY,
      q: p.get("q") ?? "",
      cats: p.get("cat") ? [p.get("cat") as Category] : [],
      brands: p.get("brand") ? [p.get("brand")!] : [],
      max: p.get("max") ? Number(p.get("max")) : EMPTY.max,
      wishOnly: p.get("wish") === "1",
      badges: p.get("badge") ? [p.get("badge")!] : [],
    });
    if (p.get("sort")) setSort(p.get("sort") as Sort);
    setShown(PAGE);
  }, [route]);

  useEffect(() => { setShown(PAGE); }, [f, sort]);
  useEffect(() => { document.body.style.overflow = sheet ? "hidden" : ""; }, [sheet]);

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (q && !(p.name + p.brand + p.flavour + p.category).toLowerCase().includes(q)) return false;
      if (f.cats.length && !f.cats.includes(p.category)) return false;
      if (f.brands.length && !f.brands.includes(p.brand)) return false;
      if (f.flavours.length && !f.flavours.includes(p.flavour)) return false;
      if (f.nics.length && !f.nics.includes(p.nicotine)) return false;
      if (p.price < f.min || p.price > f.max) return false;
      if (f.rating && p.rating < f.rating) return false;
      if (f.stockOnly && p.stock === 0) return false;
      if (f.badges.length && !(p.badge && f.badges.includes(p.badge))) return false;
      if (f.wishOnly && !wish.includes(p.id)) return false;
      return true;
    });
    const by: Record<Sort, (a: typeof list[number], b: typeof list[number]) => number> = {
      featured: (a, b) => Number(!!b.badge) - Number(!!a.badge) || b.rating - a.rating,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      newest: (a, b) => a.daysOld - b.daysOld,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort]);
  }, [f, sort, wish]);

  const toggle = <K extends keyof Filters>(k: K, v: Filters[K] extends (infer T)[] ? T : never) =>
    setF((prev) => {
      const arr = prev[k] as unknown[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...prev, [k]: next } as Filters;
    });

  const activeChips: { label: string; clear: () => void }[] = [
    ...f.cats.map((c) => ({ label: c, clear: () => toggle("cats", c) })),
    ...f.brands.map((b) => ({ label: b, clear: () => toggle("brands", b) })),
    ...f.flavours.map((x) => ({ label: x, clear: () => toggle("flavours", x) })),
    ...f.nics.map((n) => ({ label: `${n}% nic`, clear: () => toggle("nics", n) })),
    ...f.badges.map((b) => ({ label: b, clear: () => toggle("badges", b) })),
    ...(f.q ? [{ label: `“${f.q}”`, clear: () => setF((p) => ({ ...p, q: "" })) }] : []),
    ...(f.rating ? [{ label: `${f.rating}★ & up`, clear: () => setF((p) => ({ ...p, rating: 0 })) }] : []),
    ...(f.stockOnly ? [{ label: "In stock", clear: () => setF((p) => ({ ...p, stockOnly: false })) }] : []),
    ...(f.wishOnly ? [{ label: "Saved items", clear: () => setF((p) => ({ ...p, wishOnly: false })) }] : []),
    ...(f.max < 8000 || f.min > 0 ? [{ label: `${inr(f.min)}–${inr(f.max)}`, clear: () => setF((p) => ({ ...p, min: 0, max: 8000 })) }] : []),
  ];

  const filterPanel = (
    <div className="space-y-7">
      <Group title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={f.cats.includes(c)} onClick={() => toggle("cats", c)}>
              {c} <span className="ml-1 font-mono opacity-60">{PRODUCTS.filter((p) => p.category === c).length}</span>
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Price">
        <div className="flex items-center justify-between font-mono text-[11.5px] text-soft">
          <span>{inr(f.min)}</span>
          <span className="text-ink">{inr(f.max)}{f.max >= 8000 ? "+" : ""}</span>
        </div>
        <div className="mt-3 space-y-3">
          <input type="range" min={0} max={8000} step={50} value={f.min} onChange={(e) => setF((p) => ({ ...p, min: Math.min(Number(e.target.value), p.max - 50) }))} className="w-full" aria-label="Minimum price" />
          <input type="range" min={0} max={8000} step={50} value={f.max} onChange={(e) => setF((p) => ({ ...p, max: Math.max(Number(e.target.value), p.min + 50) }))} className="w-full" aria-label="Maximum price" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[500, 999, 1999, 3999].map((m) => (
            <Chip key={m} active={f.max === m} onClick={() => setF((p) => ({ ...p, max: m, min: 0 }))}>Under {inr(m)}</Chip>
          ))}
        </div>
      </Group>

      <Group title="Nicotine strength">
        <div className="flex flex-wrap gap-2">
          {NICS.map((n) => (
            <Chip key={n} active={f.nics.includes(n)} onClick={() => toggle("nics", n)}>
              {n === 0 ? "0.00%" : `${n}%`}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Flavour">
        <div className="no-bar flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1">
          {FLAVOURS.map((x) => (
            <button
              key={x}
              onClick={() => toggle("flavours", x)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200",
                f.flavours.includes(x) ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 text-soft hover:-translate-y-px hover:border-ink/40 hover:text-ink",
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/10" style={{ background: PRODUCTS.find((p) => p.flavour === x)?.colour }} />
              {x}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Brand">
        <div className="relative">
          <Icon n="search" className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
          <input
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Filter brands"
            className="w-full rounded-xl border border-line bg-paper-2 py-2 pr-3 pl-9 text-[12.5px] focus:border-moss focus:outline-none"
          />
        </div>
        <div className="no-bar mt-2 max-h-44 space-y-0.5 overflow-y-auto pr-1">
          {BRANDS.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase())).map((b) => {
            const on = f.brands.includes(b);
            return (
              <button key={b} onClick={() => toggle("brands", b)} className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-paper">
                <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition", on ? "border-moss bg-moss text-paper" : "border-line")}>
                  {on && <Icon n="check" className="h-3 w-3" sw={2.6} />}
                </span>
                <span className={cn("flex-1 text-[13px]", on ? "font-semibold text-ink" : "text-soft")}>{b}</span>
                <span className="font-mono text-[10px] text-soft/70">{PRODUCTS.filter((p) => p.brand === b).length}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Rating">
        <div className="flex flex-wrap gap-2">
          {[4.5, 4, 3.5].map((r) => (
            <Chip key={r} active={f.rating === r} onClick={() => setF((p) => ({ ...p, rating: p.rating === r ? 0 : r }))}>
              <Stars value={r} className="mr-1 inline h-3 w-3" /> {r}+
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="More">
        <div className="flex flex-wrap gap-2">
          {["Bestseller", "New Drop", "Limited", "Staff Pick"].map((b) => (
            <Chip key={b} active={f.badges.includes(b)} onClick={() => toggle("badges", b)}>{b}</Chip>
          ))}
          <Chip active={f.stockOnly} onClick={() => setF((p) => ({ ...p, stockOnly: !p.stockOnly }))}>In stock only</Chip>
          <Chip active={f.wishOnly} onClick={() => setF((p) => ({ ...p, wishOnly: !p.wishOnly }))}>
            Saved ({wish.length})
          </Chip>
        </div>
      </Group>
    </div>
  );

  return (
    <div className="relative">
      {/* page head */}
      <div className="relative overflow-hidden border-b border-line bg-ink py-10 text-paper lg:py-14">
        <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-50" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-moss/40 blur-[110px]" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-paper/40 uppercase">
            <button onClick={() => navigate("/")} className="transition hover:text-mint">Home</button>
            <Icon n="chevron" className="h-3 w-3" /> <span className="text-paper/70">Shop</span>
          </nav>
          <h1 className="mt-4 text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.88] font-extrabold">
            The whole shelf
            <span className="ml-4 align-middle font-mono text-[clamp(0.8rem,2vw,1.1rem)] tracking-[0.2em] text-mint">{PRODUCTS.length} SKUs</span>
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] text-paper/55">
            Filter by puff count, strength, flavour or budget. Every card is a real product page with a real spec sheet.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[270px_1fr] lg:gap-10 lg:px-10 lg:py-12">
        {/* sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-[17px] font-bold">Filters</span>
              {activeChips.length > 0 && (
                <button onClick={() => setF(EMPTY)} className="font-mono text-[10px] tracking-[0.16em] text-flame uppercase transition hover:text-ink">Clear all</button>
              )}
            </div>
            {filterPanel}
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSheet(true)} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 text-[12.5px] font-semibold transition hover:border-ink lg:hidden">
                <Icon n="filter" className="h-4 w-4" /> Filters {activeChips.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 font-mono text-[9.5px] text-white">{activeChips.length}</span>}
              </button>
              <p className="font-mono text-[11px] tracking-[0.14em] text-soft uppercase">
                <span className="text-ink">{results.length}</span> {results.length === 1 ? "product" : "products"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center rounded-full border border-line bg-paper-2 p-0.5 sm:flex">
                {(["grid", "list"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={cn("grid h-8 w-8 place-items-center rounded-full transition", view === v ? "bg-ink text-paper" : "text-soft hover:text-ink")}>
                    <Icon n={v === "grid" ? "grid" : "rows"} className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <div className="relative">
                <button onClick={() => setSortOpen((s) => !s)} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 text-[12.5px] font-semibold transition hover:border-ink">
                  <Icon n="sort" className="h-4 w-4 text-soft" />
                  {SORTS.find((s) => s.id === sort)?.label}
                  <Icon n="down" className={cn("h-3.5 w-3.5 text-soft transition-transform", sortOpen && "rotate-180")} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-paper-2 py-1 shadow-lift [animation:drop_0.25s_ease-out]">
                    {SORTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSort(s.id); setSortOpen(false); }}
                        className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition hover:bg-paper", sort === s.id ? "font-semibold text-moss" : "text-soft")}
                      >
                        {s.label}
                        {sort === s.id && <Icon n="check" className="h-3.5 w-3.5" sw={2.4} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-4">
              {activeChips.map((c, i) => (
                <button key={i} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper transition hover:bg-flame">
                  {c.label} <Icon n="close" className="h-3 w-3" sw={2.4} />
                </button>
              ))}
              <button onClick={() => { setF(EMPTY); navigate("/shop"); }} className="font-mono text-[10px] tracking-[0.16em] text-soft uppercase underline-offset-4 transition hover:text-flame hover:underline">reset</button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-[28px] border border-dashed border-line bg-paper-2 px-6 py-20 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-paper text-soft"><Icon n="search" className="h-6 w-6" /></span>
              <h3 className="mt-5 font-display text-[26px] font-bold">Nothing matches that</h3>
              <p className="mt-2 max-w-sm text-[13.5px] text-soft">156 products on the shelf and none of them fit. Loosen a filter or start again.</p>
              <Btn className="mt-6" onClick={() => setF(EMPTY)}>Clear every filter</Btn>
            </div>
          ) : view === "grid" ? (
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, shown).map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
                  <ProductCard p={p} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {results.slice(0, shown).map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 8) * 30}><ProductRow p={p} /></Reveal>
              ))}
            </div>
          )}

          {shown < results.length && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-moss transition-all duration-700" style={{ width: `${(shown / results.length) * 100}%` }} />
              </div>
              <p className="font-mono text-[10.5px] tracking-[0.16em] text-soft uppercase">Showing {Math.min(shown, results.length)} of {results.length}</p>
              <Btn variant="outline" size="lg" onClick={() => setShown((s) => s + PAGE)}>Load 24 more</Btn>
            </div>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      <div className={cn("fixed inset-0 z-[65] lg:hidden", sheet ? "pointer-events-auto" : "pointer-events-none")}>
        <div onClick={() => setSheet(false)} className={cn("absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-300", sheet ? "opacity-100" : "opacity-0")} />
        <div className={cn("absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-[28px] bg-paper p-5 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]", sheet ? "translate-y-0" : "translate-y-full")}>
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-line" />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[22px] font-extrabold">Filters</h2>
            <button onClick={() => setF(EMPTY)} className="font-mono text-[10px] tracking-[0.16em] text-flame uppercase">Clear all</button>
          </div>
          {filterPanel}
          <div className="sticky bottom-0 mt-6 flex gap-2 bg-paper pt-3 pb-1">
            <Btn variant="outline" className="flex-1" onClick={() => setSheet(false)}>Close</Btn>
            <Btn className="flex-[2]" onClick={() => setSheet(false)}>Show {results.length} results</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5 first:border-0 first:pt-0">
      <h3 className="mb-3 font-mono text-[10px] tracking-[0.2em] text-soft uppercase">{title}</h3>
      {children}
    </div>
  );
}
