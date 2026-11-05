import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { BRANDS, COLLECTIONS, FACTS, PRODUCTS, TESTIMONIALS, inr } from "@/lib/catalog";
import { HERO, px } from "@/lib/media";
import { navigate, useStore } from "@/lib/store";
import { Icon } from "@/components/icons";
import { Btn, Counter, Kicker, Marquee, Reveal, SectionHead, Stars } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";

const TABS = ["All", "Disposables", "Pod Kits", "E-Liquids", "Zero Nicotine"] as const;

export function Home() {
  const { add } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [spot, setSpot] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const bestsellers = useMemo(
    () =>
      PRODUCTS.filter((p) => (tab === "All" ? true : p.category === tab))
        .sort((a, b) => b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount))
        .slice(0, 8),
    [tab],
  );

  const spotlight = useMemo(
    () => PRODUCTS.filter((p) => p.badge === "Bestseller" && p.category === "Disposables").slice(0, 5),
    [],
  );
  const featured = spotlight[spot] ?? PRODUCTS[0];

  useEffect(() => {
    const t = window.setInterval(() => setSpot((s) => (s + 1) % spotlight.length), 4200);
    return () => window.clearInterval(t);
  }, [spotlight.length]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 10, y: ((e.clientY - r.top) / r.height - 0.5) * -10 });
  };

  return (
    <div>
      {/* ------------------------------ hero ------------------------------ */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-60" />
        <div className="pointer-events-none absolute -top-56 -left-40 h-[680px] w-[680px] rounded-full opacity-45 blur-[110px]" style={{ background: "radial-gradient(circle,#0e5c43,transparent 62%)" }} />
        <div className="pointer-events-none absolute -right-32 -bottom-64 h-[620px] w-[620px] rounded-full opacity-25 blur-[120px]" style={{ background: "radial-gradient(circle,#ef4b23,transparent 62%)" }} />
        <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.16] mix-blend-overlay" />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:px-10 lg:py-20">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <Kicker tone="text-mint">New drop · live now</Kicker>
                <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">
                  21+ only · ID at the door
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-[clamp(3rem,8.6vw,6.4rem)] leading-[0.85] font-extrabold">
                The flavour
                <br />
                drop is
                <span className="relative ml-3 inline-block">
                  <span className="relative z-10 text-flame">live.</span>
                  <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 bg-mint/25" />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-paper/60">
                <span className="font-mono text-mint">156</span> devices, pod kits, bottles and spares across
                <span className="font-mono text-mint"> 20</span> brands and <span className="font-mono text-mint">20</span> flavours —
                from a ₹349 salt-nic bottle to a 200W regulated box mod. Sealed batches, mesh coils, next-day dispatch.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Btn size="lg" variant="paper" onClick={() => navigate("/shop")}>
                  Shop all 156 <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Btn>
                <Btn
                  size="lg" variant="outline"
                  className="border-paper/25 text-paper hover:border-mint hover:bg-mint hover:text-ink"
                  onClick={() => navigate("/shop?cat=Zero Nicotine")}
                >
                  <Icon n="leaf" className="h-4 w-4" /> Zero-nicotine shelf
                </Btn>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-8 sm:grid-cols-4">
                {[
                  { n: 156, s: "", l: "varieties in stock" },
                  { n: 4.8, s: "", l: "average rating", dec: true },
                  { n: 24, s: "h", l: "dispatch window" },
                  { n: 999, s: "", l: "free delivery above", money: true },
                ].map((st) => (
                  <div key={st.l}>
                    <dt className="font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-none font-extrabold text-mint">
                      {st.money ? "₹" : ""}
                      {st.dec ? st.n.toFixed(1) : <Counter to={st.n} suffix={st.s} />}
                    </dt>
                    <dd className="mt-2 font-mono text-[10px] leading-relaxed tracking-[0.14em] text-paper/45 uppercase">{st.l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* collage */}
          <Reveal delay={200} className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-[560px]" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
              <div className="absolute inset-6 rounded-full border border-dashed border-white/12 [animation:spin_26s_linear_infinite]" />
              <div
                className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/12 shadow-2xl transition-transform duration-500 ease-out"
                style={{ transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
              >
                <img src={HERO.collageA} alt="Vape device glowing in vapour" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
                  <div>
                    <span className="font-mono text-[9.5px] tracking-[0.2em] text-mint uppercase">Staff pick</span>
                    <p className="mt-1 font-display text-[19px] leading-tight font-bold">{featured.name}</p>
                    <p className="mt-1 font-mono text-[11.5px] text-paper/60">{inr(featured.price)} · {featured.rating.toFixed(1)} ★</p>
                  </div>
                  <button
                    onClick={() => navigate(`/p/${featured.slug}`)}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper text-ink transition hover:bg-flame hover:text-white active:scale-90"
                    aria-label={`View ${featured.name}`}
                  >
                    <Icon n="arrow" className="h-5 w-5" sw={1.9} />
                  </button>
                </div>
              </div>

              <div className="absolute -top-3 -left-3 hidden w-40 rounded-2xl border border-white/12 bg-ink-2/85 p-3 backdrop-blur-xl [animation:float_7s_ease-in-out_infinite] sm:block">
                <img src={HERO.mint} alt="" className="h-16 w-full rounded-xl object-cover" />
                <p className="mt-2 font-display text-[13px] leading-tight font-bold">Cool Menthol</p>
                <p className="font-mono text-[9.5px] tracking-[0.14em] text-mint uppercase">flavour of the week</p>
              </div>

              <div className="absolute -right-2 bottom-10 hidden w-44 rounded-2xl border border-white/12 bg-ink-2/85 p-3.5 backdrop-blur-xl sm:block" style={{ animation: "float 8.5s ease-in-out infinite 0.6s" }}>
                <span className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.16em] text-flame uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-flame/70 [animation:pulse-ring_2s_ease-out_infinite]" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-flame" />
                  </span>
                  live right now
                </span>
                <p className="mt-1.5 font-display text-[26px] leading-none font-extrabold"><Counter to={412} /></p>
                <p className="mt-1 font-mono text-[9.5px] tracking-[0.14em] text-paper/45 uppercase">shoppers on the shelf</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* trust strip */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto grid max-w-[1400px] gap-px px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
            {[
              { i: "shield", t: "ID-checked delivery", d: "21+ verified at the door, no exceptions" },
              { i: "truck", t: "Next-day dispatch", d: "Order before 4pm, shipped the same day" },
              { i: "check", t: "Sealed batches", d: "Batch code on every box, tamper-evident" },
              { i: "leaf", t: "Zero-nic option", d: "12 flavours with 0.00% nicotine" },
            ].map((x) => (
              <div key={x.t} className="group flex items-start gap-3 py-5 transition-colors hover:bg-white/[0.03] sm:px-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-mint transition-colors group-hover:border-mint group-hover:bg-mint group-hover:text-ink">
                  <Icon n={x.i} className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-display text-[14.5px] font-bold">{x.t}</span>
                  <span className="block text-[12px] text-paper/45">{x.d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ brands ------------------------------ */}
      <section className="border-b border-line bg-paper-2 py-5">
        <Marquee className="opacity-70">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => navigate(`/shop?brand=${encodeURIComponent(b)}`)}
              className="px-7 font-display text-[19px] font-bold whitespace-nowrap text-ink/45 transition-colors hover:text-flame"
            >
              {b}
            </button>
          ))}
        </Marquee>
      </section>

      {/* ------------------------------ collections ------------------------------ */}
      <section className="relative mx-auto max-w-[1400px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal>
          <SectionHead
            kicker="Featured collections"
            title={<>Six ways in.<br />Pick your shelf.</>}
            copy="Every collection is a live filter — tap one and the grid rebuilds around it."
            action={
              <Btn variant="outline" onClick={() => navigate("/shop")}>
                All 156 products <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Btn>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {COLLECTIONS.map((c, i) => {
            const items = PRODUCTS.filter((p) =>
              c.query.category ? p.category === c.query.category : c.query.maxPrice ? p.price <= c.query.maxPrice! : true,
            );
            const big = i === 0;
            return (
              <Reveal key={c.id} delay={i * 70} className={cn(big && "md:col-span-2 md:row-span-2")}>
                <button
                  onClick={() =>
                    navigate(c.query.category ? `/shop?cat=${encodeURIComponent(c.query.category)}` : `/shop?max=${c.query.maxPrice}`)
                  }
                  className={cn(
                    "zoomable group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[24px] border border-line p-5 text-left",
                    big ? "min-h-[420px] lg:min-h-[560px]" : "min-h-[260px]",
                  )}
                  style={{ background: `linear-gradient(160deg, ${c.accent}18, #ffffff 65%)` }}
                >
                  <img src={c.image} alt={c.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
                  <div className="relative z-10 text-paper">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-paper/15 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] uppercase backdrop-blur">{c.kicker}</span>
                      <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase opacity-70">{items.length} items</span>
                    </div>
                    <h3 className={cn("mt-3 font-extrabold", big ? "text-[clamp(1.8rem,3.6vw,2.9rem)]" : "text-[22px]")}>{c.title}</h3>
                    <p className={cn("mt-2 max-w-sm text-[13px] leading-relaxed text-paper/65", !big && "line-clamp-2")}>{c.copy}</p>
                    <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#b6f0d2" }}>
                      Shop the shelf
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-1">
                        <Icon n="arrow" className="h-3.5 w-3.5" sw={2} />
                      </span>
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------ bestsellers ------------------------------ */}
      <section className="relative border-y border-line bg-paper-2 py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <Reveal>
            <SectionHead
              kicker="Moving fastest"
              title="What the shelf is selling"
              copy="Ranked by rating × review volume, refreshed as orders come in."
              action={
                <div className="no-bar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-all duration-300",
                        tab === t ? "border-ink bg-ink text-paper" : "border-line text-soft hover:-translate-y-px hover:border-ink/40 hover:text-ink",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              }
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bestsellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 45}>
                <ProductCard p={p} index={i} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 text-center">
            <Btn variant="outline" onClick={() => navigate(`/shop${tab === "All" ? "" : `?cat=${encodeURIComponent(tab)}`}`)}>
              Load the whole shelf <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Btn>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ spotlight ------------------------------ */}
      <section className="relative overflow-hidden bg-moss-deep py-16 text-paper lg:py-24">
        <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-40" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[130px]" style={{ background: `radial-gradient(circle, ${featured.colour}, transparent 60%)`, transition: "background 1s" }} />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <div className="relative">
              <div className="zoomable relative aspect-4/3 overflow-hidden rounded-[28px] border border-white/12">
                <img key={featured.id} src={featured.images[0]} alt={featured.name} className="h-full w-full object-cover [animation:drop_0.6s_ease-out]" />
                <span className="absolute top-4 left-4 rounded-full bg-flame px-3 py-1.5 font-mono text-[9.5px] tracking-[0.18em] text-white uppercase">Drop of the day</span>
              </div>
              <div className="mt-4 flex gap-2">
                {spotlight.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSpot(i)}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:h-20 sm:w-20",
                      i === spot ? "border-mint opacity-100" : "border-transparent opacity-45 hover:opacity-80",
                    )}
                    aria-label={`Show ${p.name}`}
                  >
                    <img src={p.images[1]} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Kicker tone="text-mint">Bestseller · {featured.brand}</Kicker>
            <h2 className="mt-4 text-[clamp(2.1rem,5vw,3.6rem)] leading-[0.94] font-extrabold">{featured.name}</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <Stars value={featured.rating} className="h-4 w-4" />
                <span className="font-mono text-[12.5px] text-paper/65">{featured.rating.toFixed(1)} · {featured.reviewCount} reviews</span>
              </span>
              <span className="h-4 w-px bg-white/15" />
              <span className="font-mono text-[12.5px] text-mint">{featured.stock > 10 ? `${featured.stock} in stock` : `Only ${featured.stock} left`}</span>
            </div>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-paper/60">{featured.blurb}</p>

            <div className="mt-7 flex flex-wrap items-end gap-4">
              <div>
                <span className="font-display text-[clamp(2rem,4.6vw,3rem)] leading-none font-extrabold">{inr(featured.price)}</span>
                <span className="ml-3 font-mono text-[13px] text-paper/45 line-through">{inr(featured.mrp)}</span>
              </div>
              <span className="rounded-full bg-mint px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.14em] text-moss-deep uppercase">
                save {inr(featured.mrp - featured.price)}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Btn size="lg" variant="paper" onClick={() => add(featured)}>
                <Icon n="bag" className="h-4 w-4" /> Add to bag
              </Btn>
              <Btn
                size="lg" variant="outline"
                className="border-paper/25 text-paper hover:border-mint hover:bg-mint hover:text-ink"
                onClick={() => navigate(`/p/${featured.slug}`)}
              >
                Full spec sheet
              </Btn>
            </div>

            <Countdown />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ zero nic / awareness ------------------------------ */}
      <section className="relative overflow-hidden bg-mint py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-10">
          <Reveal>
            <Kicker tone="text-moss-deep">The shelf we're proudest of</Kicker>
            <h2 className="mt-4 text-[clamp(2rem,4.8vw,3.4rem)] leading-[0.94] font-extrabold text-moss-deep">
              Flavour without<br />the chemical.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-moss-deep/70">
              Twelve zero-nicotine disposables and bottles. Built for people who want the ritual and none of the
              dependence — and for anyone trying to step a strength down instead of stepping up.
            </p>
            <Btn className="mt-7" size="lg" onClick={() => navigate("/shop?cat=Zero Nicotine")}>
              Browse the 0.00% shelf <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Btn>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-3 sm:grid-cols-2">
              {FACTS.map((f, i) => (
                <div key={f.l} className={cn("rounded-[20px] border border-moss-deep/12 bg-paper-2/70 p-5 backdrop-blur transition-transform duration-300 hover:-translate-y-1", i % 2 === 1 && "sm:mt-6")}>
                  <p className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] leading-none font-extrabold text-moss-deep">{f.n}</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-soft">{f.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ promises ------------------------------ */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-6 lg:px-10 lg:py-20">
        <Reveal>
          <SectionHead kicker="House rules" title={<>Three things this shop<br />will never do.</>} />
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            { n: "01", t: "Never sell to an under-21", d: "Age is checked at the door by the courier, not by a popup you can click through. If you're under 21, the answer is no and it stays no." },
            { n: "02", t: "Never ask for cash to a person", d: "A business collects on a merchant account or a gateway with an invoice. The moment a store asks you to pay a personal UPI handle, you're not shopping — you're being hunted." },
            { n: "03", t: "Never disappear after payment", d: "Order ID, invoice, tracking link, working helpline, physical address. If any of those are missing, the parcel is missing too." },
          ].map((x, i) => (
            <Reveal key={x.n} delay={i * 90}>
              <div className="group h-full rounded-[24px] border border-line bg-paper-2 p-6 transition-all duration-400 hover:-translate-y-1.5 hover:border-flame/40 hover:shadow-lift">
                <span className="font-mono text-[11px] tracking-[0.2em] text-flame">{x.n}</span>
                <h3 className="mt-3 font-display text-[22px] leading-tight font-bold">{x.t}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-soft">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------ reviews wall ------------------------------ */}
      <section className="relative overflow-hidden border-t border-line bg-paper-2 py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <Reveal>
            <SectionHead
              kicker="Verified buyers"
              title="4.8 across 21,400 reviews"
              copy="Pulled from the order history. Unedited, including the ones we'd rather not show."
            />
          </Reveal>
        </div>
        <div className="mt-10 space-y-4">
          <Marquee>
            {TESTIMONIALS.map((t) => <ReviewCard key={t.name} t={t} />)}
          </Marquee>
          <Marquee reverse slow>
            {[...TESTIMONIALS].reverse().map((t) => <ReviewCard key={t.name + "2"} t={t} />)}
          </Marquee>
        </div>
      </section>

      {/* ------------------------------ closing CTA ------------------------------ */}
      <section className="relative overflow-hidden bg-ink py-16 text-paper lg:py-20">
        <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.14] mix-blend-overlay" />
        <div className="relative mx-auto flex max-w-[1400px] flex-col items-start gap-8 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <Reveal>
            <h2 className="max-w-2xl text-[clamp(2.2rem,6vw,4.4rem)] leading-[0.9] font-extrabold">
              Fill the bag.<br />
              <span className="text-stroke-paper">Run the checkout.</span><br />
              <span className="text-flame">Then read the receipt.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="flex flex-col gap-3">
              <Btn size="lg" variant="paper" onClick={() => navigate("/shop")}>Start shopping <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Btn>
              <Btn size="lg" variant="outline" className="border-paper/25 text-paper hover:border-mint hover:bg-mint hover:text-ink" onClick={() => navigate("/checkout")}>
                Go straight to payment
              </Btn>
              <p className="mt-1 max-w-[34ch] font-mono text-[10px] leading-relaxed tracking-[0.14em] text-paper/40 uppercase">
                Nothing on this site moves real money — but it will show you exactly how a shop that does it looks.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ReviewCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <figure className="mx-2 flex w-[min(420px,82vw)] shrink-0 flex-col rounded-[22px] border border-line bg-paper p-5 transition-transform duration-300 hover:-translate-y-1">
      <Stars value={t.rating} className="h-3.5 w-3.5" />
      <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-ink/80">“{t.quote}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-mint font-display text-[13px] font-bold text-moss-deep">{t.name[0]}</span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold">{t.name} <span className="font-mono text-[10px] text-moss">· verified</span></span>
          <span className="block truncate font-mono text-[10.5px] text-soft">{t.city} · {t.bought}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Countdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const next = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(20, 0, 0, 0);
      const delta = (5 - now.getDay() + 7) % 7;
      target.setDate(now.getDate() + delta);
      if (target <= now) target.setDate(target.getDate() + 7);
      return target;
    };
    const target = next();
    const tick = () => {
      const ms = Math.max(0, target.getTime() - Date.now());
      setT({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms / 3600000) % 24),
        m: Math.floor((ms / 60000) % 60),
        s: Math.floor((ms / 1000) % 60),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 backdrop-blur">
      <Icon n="clock" className="h-4 w-4 text-mint" />
      <span className="font-mono text-[10px] tracking-[0.18em] text-paper/50 uppercase">Next drop in</span>
      <span className="flex gap-1.5 font-mono text-[13px] font-bold tabular-nums">
        {[t.d, t.h, t.m, t.s].map((v, i) => (
          <span key={i} className="rounded-md bg-paper/10 px-1.5 py-0.5">{String(v).padStart(2, "0")}{["d", "h", "m", "s"][i]}</span>
        ))}
      </span>
    </div>
  );
}

export const heroImage = px(19344605, 1200, 1200);
