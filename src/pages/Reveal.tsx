import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { FACTS, RED_FLAGS, inr } from "@/lib/catalog";
import { navigate, useStore } from "@/lib/store";
import { Icon } from "@/components/icons";
import { Btn, Counter, Reveal } from "@/components/ui";
import { readOrder } from "./Checkout";

export function ScamReveal() {
  const { toast, clear, setAgeOk } = useStore();
  const order = useMemo(() => readOrder(), []);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), 420);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-flame/25 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.2] mix-blend-overlay" />

      {/* ambient falling marks */}
      {[...Array(9)].map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute font-mono text-[13px] text-paper/12 select-none"
          style={{
            left: `${(i * 11 + 5) % 95}%`,
            animation: `fall ${13 + (i % 5) * 4}s linear ${i * 1.6}s infinite`,
          }}
        >
          {["₹", "⚠", "UPI", "✕", "1930"][i % 5]}
        </span>
      ))}

      <div className="siren-strip absolute inset-x-0 top-0 h-2.5 opacity-80" />
      <div className="siren-strip absolute inset-x-0 bottom-0 h-2.5 opacity-80" />

      <div className="relative mx-auto max-w-[1200px] px-5 py-16 sm:px-6 lg:py-24">
        {/* headline */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-flame/40 bg-flame/12 px-4 py-1.5 font-mono text-[10px] tracking-[0.24em] text-flame uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-flame/70 [animation:pulse-ring_1.6s_ease-out_infinite]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-flame" />
            </span>
            order {order?.id ?? "V4U-000000"} · status: never existed
          </span>

          <h1
            className={cn(
              "relative mt-7 text-[clamp(3rem,15vw,11rem)] leading-[0.78] font-extrabold tracking-[-0.045em]",
              glitch && "[animation:glitch_0.42s_steps(2,end)]",
            )}
          >
            <span className="absolute inset-0 -translate-x-[3px] text-flame opacity-70 select-none" aria-hidden="true">YOU ARE</span>
            <span className="absolute inset-0 translate-x-[3px] text-mint opacity-55 select-none" aria-hidden="true">YOU ARE</span>
            <span className="relative">YOU ARE</span>
            <span className="absolute inset-x-0 top-[0.82em] -translate-x-[4px] text-flame opacity-70 select-none" aria-hidden="true">SCAMMED.</span>
            <span className="absolute inset-x-0 top-[0.82em] translate-x-[4px] text-mint opacity-55 select-none" aria-hidden="true">SCAMMED.</span>
            <span className="relative block text-flame">SCAMMED.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-[clamp(1rem,2.4vw,1.25rem)] leading-relaxed text-paper/70">
            Except you aren't. Nothing was charged, no parcel was booked, and the shop you just spent
            ten minutes in doesn't exist. <span className="font-semibold text-mint">This was the whole point.</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Btn size="lg" variant="paper" onClick={() => navigate("/")}>Back to the storefront</Btn>
            <Btn size="lg" variant="outline" className="border-paper/25 text-paper hover:border-flame hover:bg-flame hover:text-white" onClick={() => navigate("/shop")}>
              Browse the fake shelf again
            </Btn>
            <Btn
              size="lg" variant="ghost" className="text-paper/60 hover:text-paper"
              onClick={() => {
                clear(); setAgeOk(false); navigate("/");
                toast({ title: "Reset. Fresh visitor.", tone: "info" });
              }}
            >
              <Icon n="spark" className="h-4 w-4" /> Start over
            </Btn>
          </div>
        </div>

        {/* receipt */}
        <Reveal className="mt-16">
          <div className="relative mx-auto max-w-md rotate-[-1.2deg] rounded-[6px] bg-paper px-7 py-8 text-ink shadow-2xl transition-transform duration-500 hover:rotate-0">
            <div className="absolute inset-x-0 -top-px h-2 [background:radial-gradient(circle_at_6px_-2px,transparent_6px,#f0f2ed_6px)] [background-size:12px_12px]" />
            <div className="flex items-baseline justify-between border-b border-dashed border-ink/25 pb-3">
              <span className="font-display text-[22px] font-extrabold tracking-tight">vape<span className="text-flame">4</span>u</span>
              <span className="font-mono text-[9.5px] tracking-[0.18em] text-soft uppercase">not a receipt</span>
            </div>
            <dl className="mt-4 space-y-1.5 font-mono text-[12px]">
              <R k="Order ID" v={order?.id ?? "—"} />
              <R k="Name" v={order?.name || "—"} />
              <R k="Phone" v={order?.phone || "—"} />
              <R k="Ship to" v={order?.city || "—"} />
              <R k="Speed" v={order?.speed || "—"} />
              <R k="Items" v={String(order?.items ?? 0)} />
              <R k="Paid to" v={order?.upi ?? "8384062696@fam"} />
              <div className="my-2 border-t border-dashed border-ink/25" />
              <div className="flex items-end justify-between">
                <dt className="font-display text-[15px] font-bold">Amount shown</dt>
                <dd className="font-display text-[22px] font-extrabold">{inr(order?.total ?? 0)}</dd>
              </div>
              <div className="flex items-end justify-between text-moss">
                <dt className="font-display text-[15px] font-bold">Amount taken</dt>
                <dd className="font-display text-[26px] leading-none font-extrabold">₹0</dd>
              </div>
            </dl>
            <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-[-16deg] rounded-xl border-[3px] border-flame px-4 py-2 opacity-85">
              <span className="font-display text-[20px] leading-none font-extrabold tracking-tight text-flame uppercase">No such<br />business</span>
            </div>
            <p className="mt-5 border-t border-dashed border-ink/25 pt-3 text-center font-mono text-[9.5px] leading-relaxed tracking-[0.14em] text-soft uppercase">
              No GSTIN · no invoice · no tracking link · no returns desk · no address
            </p>
            <div className="absolute inset-x-0 -bottom-px h-2 [background:radial-gradient(circle_at_6px_8px,transparent_6px,#f0f2ed_6px)] [background-size:12px_12px]" />
          </div>
        </Reveal>

        {/* red flags */}
        <div className="mt-20">
          <Reveal>
            <h2 className="text-center font-display text-[clamp(1.8rem,5vw,3rem)] leading-[0.94] font-extrabold">
              Six red flags you<br /><span className="text-flame">walked straight past.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-[14.5px] leading-relaxed text-paper/55">
              Every one of them was on the screen while you added things to a bag. Scam shops don't hide the warnings — they bury them under good photography.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RED_FLAGS.map((r, i) => (
              <Reveal key={r.t} delay={i * 70}>
                <div className="group h-full rounded-[22px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all duration-400 hover:-translate-y-1.5 hover:border-flame/45 hover:bg-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-flame">{String(i + 1).padStart(2, "0")}</span>
                    <Icon n="alert" className="h-4 w-4 text-paper/25 transition-colors group-hover:text-flame" />
                  </div>
                  <h3 className="mt-3 font-display text-[19px] leading-tight font-bold">{r.t}</h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-paper/55">{r.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* what to do */}
        <div className="mt-20 grid gap-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur lg:grid-cols-[1fr_1fr] lg:p-10">
          <Reveal>
            <span className="font-mono text-[10px] tracking-[0.22em] text-mint uppercase">If this had been real</span>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-[0.96] font-extrabold">
              The first hour<br />decides everything.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-paper/55">
              UPI transfers are instant and hard to reverse, but not impossible. Speed is the only lever you have.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn variant="paper" onClick={() => navigator.clipboard?.writeText("1930").then(() => toast({ title: "1930 copied", body: "Cyber crime financial helpline", tone: "good" }))}>
                <Icon n="phone" className="h-4 w-4" /> Copy 1930
              </Btn>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-6 py-3 text-sm font-semibold text-paper transition hover:border-mint hover:bg-mint hover:text-ink">
                cybercrime.gov.in <Icon n="arrow" className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ol className="space-y-3">
              {[
                { t: "Call 1930 immediately", d: "The national cyber-crime financial helpline can freeze a fraudulent UPI transfer — but only in the first hours." },
                { t: "File on cybercrime.gov.in", d: "Attach the screenshot, the UPI handle, the amount and the timestamp. You get a complaint number." },
                { t: "Tell your bank and NPCI", d: "Raise a dispute on the transaction and report the receiving VPA so it gets blacklisted for the next person." },
                { t: "Keep every scrap of evidence", d: "Chat logs, the QR image, the site URL, order ID. Screenshots beat memory in every dispute." },
                { t: "Warn the person who sent you", d: "Most victims arrive through a forwarded link. Break the chain where you found it." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3.5 rounded-2xl border border-white/8 bg-ink-2/60 p-4 transition-colors hover:border-mint/35">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint font-mono text-[11px] font-bold text-ink">{i + 1}</span>
                  <span>
                    <span className="block font-display text-[15.5px] font-bold">{s.t}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-paper/55">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* numbers */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <div key={f.l} className="bg-ink p-6 transition-colors duration-300 hover:bg-ink-2">
              <p className="font-display text-[clamp(2rem,4.4vw,2.9rem)] leading-none font-extrabold text-mint">
                {f.n === "₹0" ? "₹0" : f.n.includes(" ") ? f.n : <Counter to={Number(f.n.replace(/\D/g, "")) || 0} suffix={f.n.replace(/[\d]/g, "")} />}
              </p>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-paper/50">{f.l}</p>
              <span className="mt-4 block font-mono text-[9.5px] tracking-[0.16em] text-paper/25 uppercase">0{i + 1}</span>
            </div>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <p className="mx-auto max-w-3xl font-display text-[clamp(1.4rem,3.6vw,2.2rem)] leading-[1.08] font-bold text-paper/85">
            A shop this polished, this cheap, this fast and this unreachable is not a bargain.
            <span className="text-flame"> It's a trap with good art direction.</span>
          </p>
          <p className="mx-auto mt-5 max-w-xl text-[13.5px] leading-relaxed text-paper/45">
            And separately: nicotine products are not for anyone under 21, and no legitimate retailer will ever
            take payment for one through a stranger's UPI handle.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn size="lg" variant="paper" onClick={() => navigate("/")}>Take me back to the shop</Btn>
            <Btn
              size="lg" variant="outline" className="border-paper/25 text-paper hover:border-mint hover:bg-mint hover:text-ink"
              onClick={() => {
                const link = window.location.origin + window.location.pathname;
                navigator.clipboard?.writeText(link).then(
                  () => toast({ title: "Link copied", body: "Send it to someone who shops like this.", tone: "good" }),
                  () => toast({ title: link, tone: "info" }),
                );
              }}
            >
              <Icon n="copy" className="h-4 w-4" /> Share the lesson
            </Btn>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function R({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-soft uppercase">{k}</dt>
      <dd className="truncate text-right font-medium">{v}</dd>
    </div>
  );
}
