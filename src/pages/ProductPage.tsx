import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { PRODUCTS, bySlug, inr, ratingSplit, related, reviewsFor, type Review } from "@/lib/catalog";
import { navigate, useStore } from "@/lib/store";
import { Icon, Star } from "@/components/icons";
import { Accordion, Btn, Chip, Kicker, QtyStepper, Reveal, SectionHead, Stars } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";

export function ProductPage({ slug }: { slug: string }) {
  const p = bySlug(slug);
  const { add, openDrawer, wish, toggleWish, extraReviews, addReview, toast, recent, pushRecent } = useStore();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [tab, setTab] = useState<"reviews" | "specs">("reviews");
  const [pin, setPin] = useState("");
  const [pinOk, setPinOk] = useState<string | null>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (p) pushRecent(p.slug); }, [p?.slug]);
  useEffect(() => { setImg(0); setQty(1); }, [slug]);

  const variants = useMemo(
    () => (p ? PRODUCTS.filter((x) => x.category === p.category && x.brand === p.brand && x.id !== p.id).slice(0, 8) : []),
    [p?.id],
  );
  const strengths = useMemo(
    () => (p ? PRODUCTS.filter((x) => x.name.includes(p.flavour) && x.brand === p.brand).slice(0, 4) : []),
    [p?.id],
  );
  const allReviews = useMemo(() => {
    if (!p) return [];
    return [...(extraReviews[p.id] ?? []), ...reviewsFor(p)];
  }, [p?.id, extraReviews]);

  if (!p) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-paper-2 text-flame"><Icon n="alert" className="h-7 w-7" /></span>
        <h1 className="mt-6 font-display text-[34px] font-extrabold">That product walked off</h1>
        <p className="mt-2 text-[14.5px] text-soft">No such SKU on the shelf. Which, for a store like this, is the most honest thing it could do.</p>
        <Btn className="mt-6" onClick={() => navigate("/shop")}>Back to all 156</Btn>
      </div>
    );
  }

  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const saved = wish.includes(p.id);
  const out = p.stock === 0;
  const split = ratingSplit(p);
  const avgUser = allReviews.length ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : p.rating;

  return (
    <div className="relative">
      {/* breadcrumb */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 overflow-x-auto px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-soft uppercase no-bar sm:px-6 lg:px-10">
          <button onClick={() => navigate("/")} className="transition hover:text-moss">Home</button>
          <Icon n="chevron" className="h-3 w-3 shrink-0" />
          <button onClick={() => navigate("/shop")} className="transition hover:text-moss">Shop</button>
          <Icon n="chevron" className="h-3 w-3 shrink-0" />
          <button onClick={() => navigate(`/shop?cat=${encodeURIComponent(p.category)}`)} className="transition hover:text-moss">{p.category}</button>
          <Icon n="chevron" className="h-3 w-3 shrink-0" />
          <span className="truncate text-ink">{p.name}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10 lg:py-12">
        {/* gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex gap-3">
            <div className="hidden w-20 shrink-0 flex-col gap-2.5 sm:flex">
              {p.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-300",
                    i === img ? "border-ink opacity-100" : "border-transparent opacity-55 hover:opacity-90",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div
              className="relative aspect-square flex-1 overflow-hidden rounded-[26px] border border-line bg-paper-3"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onMouseLeave={() => setZoom(null)}
            >
              {p.images.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={`${p.name} — view ${i + 1}`}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                    i === img ? "opacity-100" : "opacity-0",
                  )}
                  style={i === img && zoom ? { transform: "scale(1.85)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                />
              ))}
              <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-2">
                {p.badge && <span className="rounded-full bg-ink px-3 py-1.5 font-mono text-[9.5px] tracking-[0.16em] text-paper uppercase">{p.badge}</span>}
                {off >= 20 && <span className="rounded-full bg-flame px-3 py-1.5 font-mono text-[9.5px] tracking-[0.16em] text-white uppercase">{off}% off</span>}
              </div>
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                <div className="flex gap-1.5 sm:hidden">
                  {p.images.map((_, i) => (
                    <button key={i} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={cn("h-1.5 rounded-full transition-all", i === img ? "w-6 bg-ink" : "w-1.5 bg-ink/30")} />
                  ))}
                </div>
                <span className="ml-auto rounded-full bg-paper-2/90 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.14em] text-soft uppercase backdrop-blur">
                  {img + 1} / {p.images.length} · hover to zoom
                </span>
              </div>
              <button
                onClick={() => toggleWish(p.id)}
                className={cn("absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition active:scale-90", saved ? "border-flame bg-flame text-white" : "border-ink/10 bg-paper-2/85 text-ink hover:border-flame hover:text-flame")}
                aria-label={saved ? "Remove from saved" : "Save for later"}
              >
                <Icon n="heart" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* spec strip */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { k: "Puffs", v: p.puffs ? p.puffs.toLocaleString() : "—" },
              { k: "Nicotine", v: `${p.nicotine}%` },
              { k: "SKU", v: p.id },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-line bg-paper-2 px-3 py-2.5">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] text-soft uppercase">{s.k}</span>
                <span className="mt-0.5 block font-display text-[15px] font-bold">{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* buy box */}
        <div>
          <Kicker>{p.brand} · {p.category}</Kicker>
          <h1 className="mt-3 text-[clamp(1.9rem,4.6vw,3.1rem)] leading-[0.94] font-extrabold">{p.name}</h1>

          <button onClick={() => { setTab("reviews"); reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="mt-4 flex items-center gap-2.5">
            <Stars value={avgUser} className="h-4 w-4" />
            <span className="font-mono text-[12px] text-soft">{avgUser.toFixed(1)} · {allReviews.length + p.reviewCount} reviews</span>
            <span className="font-mono text-[11px] text-moss underline-offset-4 hover:underline">read them ↓</span>
          </button>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="font-display text-[clamp(2.2rem,5vw,3.2rem)] leading-none font-extrabold">{inr(p.price)}</span>
            {off > 0 && (
              <>
                <span className="font-mono text-[15px] text-soft line-through">{inr(p.mrp)}</span>
                <span className="rounded-full bg-mint px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.14em] text-moss-deep uppercase">save {inr(p.mrp - p.price)}</span>
              </>
            )}
          </div>
          <p className="mt-1.5 font-mono text-[10.5px] tracking-[0.14em] text-soft uppercase">inclusive of all taxes · GST invoice on request</p>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-soft">{p.blurb}</p>

          {variants.length > 0 && (
            <div className="mt-7">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] text-soft uppercase">Swap the flavour</span>
                <span className="font-mono text-[10px] text-soft">{variants.length} more from {p.brand}</span>
              </div>
              <div className="no-bar flex gap-2 overflow-x-auto pb-1">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/p/${v.slug}`)}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper-2 px-3 py-2 text-[12.5px] font-semibold transition hover:-translate-y-px hover:border-ink"
                  >
                    <span className="h-3 w-3 rounded-full ring-1 ring-ink/10" style={{ background: v.colour }} />
                    {v.flavour}
                    <span className="font-mono text-[10.5px] text-soft">{inr(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {strengths.length > 1 && (
            <div className="mt-5">
              <span className="mb-2.5 block font-mono text-[10px] tracking-[0.2em] text-soft uppercase">Strength</span>
              <div className="flex flex-wrap gap-2">
                {strengths.map((s) => (
                  <Chip key={s.id} active={s.id === p.id} onClick={() => navigate(`/p/${s.slug}`)}>{s.nicotine}%</Chip>
                ))}
              </div>
            </div>
          )}

          <div className={cn("mt-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase", out ? "text-flame" : p.stock < 10 ? "text-amber" : "text-moss")}>
            <span className="relative flex h-2 w-2">
              {!out && <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 [animation:pulse-ring_2.2s_ease-out_infinite]" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
            </span>
            {out ? "Sold out — restock Friday" : p.stock < 10 ? `Hurry · only ${p.stock} left` : `In stock · ${p.stock} units · ships today`}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QtyStepper qty={qty} set={(n) => setQty(Math.max(1, n))} max={Math.max(1, p.stock)} />
            <Btn size="lg" variant="flame" disabled={out} className="flex-1 min-w-[190px]" onClick={() => { add(p, qty); openDrawer(); }}>
              <Icon n="bag" className="h-4 w-4" /> Add to bag · {inr(p.price * qty)}
            </Btn>
          </div>
          <Btn size="lg" full className="mt-2.5" disabled={out} onClick={() => { add(p, qty); navigate("/checkout"); }}>
            Buy it now <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Btn>

          {/* pincode */}
          <div className="mt-6 rounded-[20px] border border-line bg-paper-2 p-4">
            <span className="font-mono text-[10px] tracking-[0.2em] text-soft uppercase">Check delivery</span>
            <div className="mt-2 flex gap-2">
              <input
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinOk(null); }}
                placeholder="6-digit PIN code"
                className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 font-mono text-[13px] focus:border-moss focus:outline-none"
              />
              <Btn
                size="sm" variant="outline" disabled={pin.length !== 6}
                onClick={() => setPinOk(pin.startsWith("9") ? "We don't deliver there. Try 110001." : `Arrives in ${2 + (Number(pin[0]) % 3)} days · ID check at the door`)}
              >
                Check
              </Btn>
            </div>
            {pinOk && (
              <p className={cn("mt-2.5 flex items-center gap-2 text-[12.5px]", pinOk.startsWith("We") ? "text-flame" : "text-moss")}>
                <Icon n={pinOk.startsWith("We") ? "alert" : "truck"} className="h-4 w-4" /> {pinOk}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {[
              { i: "truck", t: "Free delivery over ₹999", d: "₹79 flat otherwise" },
              { i: "shield", t: "21+ ID check", d: "Courier verifies at handover" },
              { i: "check", t: "7-day replacement", d: "Dead-on-arrival covered" },
              { i: "lock", t: "Sealed batch code", d: "Tamper-evident packaging" },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-2.5 rounded-2xl border border-line bg-paper-2 px-3.5 py-3">
                <Icon n={x.i} className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                <span>
                  <span className="block text-[13px] font-semibold">{x.t}</span>
                  <span className="block text-[11.5px] text-soft">{x.d}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Accordion
              items={[
                { t: "Full description", c: <p>{p.blurb} Packaged in a plain outer box with a batch code and manufacture date on the base. Every unit is power-tested before dispatch; disposables arrive at roughly 70% charge and top up over USB-C in under an hour.</p> },
                { t: "Specifications", c: (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-line">
                      {p.specs.map((s) => (
                        <tr key={s.k}>
                          <th className="w-2/5 py-2 pr-3 font-mono text-[10.5px] tracking-[0.12em] text-soft uppercase">{s.k}</th>
                          <td className="py-2 text-[13.5px] font-medium text-ink">{s.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) },
                { t: "Delivery & returns", c: <p>Dispatched same day before 4pm IST, 2–5 working days to metros. Replacements within 7 days for DOA units with an unboxing video. Flavour preference is not a return reason — pick with the swap chips above instead.</p> },
                { t: "Safety & age", c: <p>Keep away from children and pets; e-liquid is toxic if swallowed. Not for use during pregnancy, or by anyone with a heart condition. Sale is strictly 21+. Nicotine is addictive — if you don't already vape, the right purchase is nothing at all.</p> },
              ]}
            />
          </div>
        </div>
      </div>

      {/* reviews + specs */}
      <div ref={reviewRef} className="border-t border-line bg-paper-2 py-14 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHead kicker="Buyer reviews" title={<span className="text-[clamp(2rem,4vw,2.6rem)]">{avgUser.toFixed(1)}</span>} />
              <div className="mt-4 flex items-center gap-2">
                <Stars value={avgUser} className="h-4 w-4" />
                <span className="font-mono text-[11.5px] text-soft">{allReviews.length + p.reviewCount} reviews</span>
              </div>
              <div className="mt-5 space-y-2">
                {split.map((s) => (
                  <div key={s.star} className="flex items-center gap-2.5">
                    <span className="w-8 font-mono text-[11px] text-soft">{s.star}★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-amber transition-all duration-700" style={{ width: `${s.pct}%` }} />
                    </span>
                    <span className="w-9 text-right font-mono text-[10.5px] text-soft">{s.pct}%</span>
                  </div>
                ))}
              </div>
              <ReviewForm
                onSubmit={(r) => {
                  addReview(p.id, r);
                  toast({ title: "Review published", body: "It'll sit right at the top. Convenient, isn't it.", tone: "good" });
                }}
              />
            </div>

            <div>
              <div className="mb-5 flex gap-2 border-b border-line">
                {(["reviews", "specs"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn("relative px-4 py-3 font-display text-[15px] font-bold capitalize transition-colors", tab === t ? "text-ink" : "text-soft hover:text-ink")}
                  >
                    {t === "reviews" ? `Reviews (${allReviews.length})` : "Spec sheet"}
                    {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-flame" />}
                  </button>
                ))}
              </div>

              {tab === "reviews" ? (
                <ul className="space-y-3">
                  {allReviews.map((r) => (
                    <li key={r.id} className="rounded-[20px] border border-line bg-paper p-5 transition-shadow hover:shadow-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-mint font-display text-[15px] font-bold text-moss-deep">{r.author[0]}</span>
                          <div>
                            <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                              {r.author}
                              {r.verified && <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.12em] text-moss uppercase"><Icon n="check" className="h-2.5 w-2.5" sw={3} /> verified</span>}
                            </p>
                            <p className="font-mono text-[10.5px] text-soft">{r.date}</p>
                          </div>
                        </div>
                        <Stars value={r.rating} className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="mt-3.5 font-display text-[16px] font-bold">{r.title}</h4>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-soft">{r.body}</p>
                      <div className="mt-3 flex items-center gap-4 border-t border-line pt-3">
                        <button className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-soft uppercase transition hover:text-moss">
                          <Icon n="check" className="h-3.5 w-3.5" /> Helpful ({r.helpful})
                        </button>
                        <button className="font-mono text-[10px] tracking-[0.14em] text-soft uppercase transition hover:text-flame">Report</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="overflow-hidden rounded-[20px] border border-line bg-paper">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-line">
                      {p.specs.concat([{ k: "Listing ID", v: p.id }, { k: "Added", v: `${p.daysOld} days ago` }, { k: "Page views", v: String(p.views) }]).map((s) => (
                        <tr key={s.k} className="transition-colors hover:bg-paper-2">
                          <th className="w-2/5 px-5 py-3.5 font-mono text-[10.5px] tracking-[0.12em] text-soft uppercase">{s.k}</th>
                          <td className="px-5 py-3.5 text-[14px] font-medium">{s.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <Reveal>
          <SectionHead
            kicker="Goes with this"
            title="People also bought"
            action={<Btn variant="outline" size="sm" onClick={() => navigate(`/shop?cat=${encodeURIComponent(p.category)}`)}>See the {p.category} shelf</Btn>}
          />
        </Reveal>
        <div className="no-bar mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
          {related(p).map((r, i) => (
            <div key={r.id} className="w-[240px] shrink-0 snap-start sm:w-[270px]">
              <ProductCard p={r} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* recently viewed */}
      {recent.length > 1 && (
        <section className="border-t border-line bg-paper-2 py-10">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
            <Kicker>Recently viewed</Kicker>
            <div className="no-bar mt-4 flex gap-3 overflow-x-auto pb-1">
              {recent.filter((s) => s !== p.slug).map((s) => {
                const rp = bySlug(s);
                if (!rp) return null;
                return (
                  <button key={s} onClick={() => navigate(`/p/${s}`)} className="flex w-56 shrink-0 items-center gap-3 rounded-2xl border border-line bg-paper p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
                    <img src={rp.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{rp.name}</span>
                      <span className="font-mono text-[10.5px] text-moss">{inr(rp.price)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* sticky mobile buy bar */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-paper-2/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold">{p.name}</span>
            <span className="font-display text-[17px] font-extrabold">{inr(p.price * qty)}</span>
          </div>
          <Btn variant="flame" disabled={out} onClick={() => { add(p, qty); openDrawer(); }}>Add to bag</Btn>
          <Btn disabled={out} onClick={() => { add(p, qty); navigate("/checkout"); }}>Buy now</Btn>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (r: Review) => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hover, setHover] = useState(0);

  return (
    <div className="mt-7 rounded-[22px] border border-line bg-paper p-5">
      {!open ? (
        <Btn full variant="outline" onClick={() => setOpen(true)}>
          <Icon n="star" className="h-4 w-4" /> Write a review
        </Btn>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              id: `u-${Date.now()}`,
              author: author.trim() || "Anonymous",
              rating,
              date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
              title: title.trim() || "No title",
              body: body.trim() || "—",
              verified: false,
              helpful: 0,
            });
            setAuthor(""); setTitle(""); setBody(""); setRating(5); setOpen(false);
          }}
          className="space-y-3"
        >
          <div>
            <span className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">Your rating</span>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)} aria-label={`${n} stars`}
                  className={cn("transition-transform duration-200 hover:scale-125", (hover || rating) >= n ? "text-amber" : "text-line")}
                >
                  <Star filled={(hover || rating) >= n} className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
          <Field label="Name" value={author} onChange={setAuthor} placeholder="How it shows up" />
          <Field label="Headline" value={title} onChange={setTitle} placeholder="Short and honest" />
          <div>
            <label className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">Review</label>
            <textarea
              required value={body} onChange={(e) => setBody(e.target.value)} rows={3}
              placeholder="Flavour, battery, delivery — anything"
              className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-paper-2 px-3.5 py-2.5 text-[13.5px] focus:border-moss focus:ring-2 focus:ring-moss/15 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Btn type="submit" className="flex-1">Publish</Btn>
            <Btn type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">{label}</label>
      <input
        value={value} required onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-line bg-paper-2 px-3.5 py-2.5 text-[13.5px] focus:border-moss focus:ring-2 focus:ring-moss/15 focus:outline-none"
      />
    </div>
  );
}
