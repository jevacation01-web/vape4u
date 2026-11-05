import { useEffect, useState } from "react";
import { HERO } from "@/lib/media";
import { useStore } from "@/lib/store";
import { Icon } from "./icons";
import { Btn } from "./ui";

export function AgeGate() {
  const { ageOk, setAgeOk } = useStore();
  const [young, setYoung] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = ageOk ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [ageOk]);

  if (ageOk) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink/92 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-60" />
      <div
        className="pointer-events-none absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #0e5c43 0%, transparent 65%)" }}
      />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl items-center px-5 py-14">
        <div className={`grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] transition-all duration-700 ${show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-mint uppercase">
              <Icon n="shield" className="h-3.5 w-3.5" /> age gate · step 1 of 1
            </span>
            <h1 className="mt-5 text-[clamp(3.4rem,11vw,7rem)] leading-[0.82] font-extrabold text-paper">
              21<span className="text-flame">+</span>
              <span className="mt-2 block text-[clamp(1.6rem,4.4vw,2.7rem)] leading-[1.02] font-bold text-paper/70">
                or the door stays shut.
              </span>
            </h1>

            {!young ? (
              <>
                <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-paper/60">
                  vape4u sells nicotine products. Nicotine is highly addictive, no vape is risk-free, and
                  nothing on this shelf is for anyone under 21. Confirm your age to see the shop.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Btn size="lg" variant="paper" onClick={() => setAgeOk(true)}>
                    I'm 21 or older
                    <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Btn>
                  <Btn
                    size="lg"
                    className="border border-paper/25 text-paper hover:border-paper hover:bg-paper hover:text-ink"
                    variant="outline"
                    onClick={() => setYoung(true)}
                  >
                    I'm under 21
                  </Btn>
                </div>
                <p className="mt-6 font-mono text-[10.5px] leading-relaxed tracking-[0.14em] text-paper/35 uppercase">
                  Demo storefront built to teach scam-spotting · nothing here is sold, shipped or charged
                </p>
              </>
            ) : (
              <div className="mt-6 max-w-lg rounded-[22px] border border-mint/25 bg-mint/8 p-6">
                <h2 className="font-display text-[24px] font-bold text-mint">Then you're in the right place — to leave.</h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-paper/70">
                  There is no version of this where we sell you a vape. Under-21 nicotine sales are illegal in India,
                  and a shop that would take your money for one is a shop that would take your money for nothing.
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-paper/70">
                  If you're already using and want out: talk to a doctor, or call <span className="font-mono text-mint">iCall · 9152987821</span> (free, Mon–Sat).
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Btn size="sm" variant="paper" onClick={() => setYoung(false)}>Go back</Btn>
                  <Btn size="sm" className="border border-paper/25 text-paper" variant="outline" onClick={() => setAgeOk(true)}>
                    View the scam-awareness demo
                  </Btn>
                </div>
              </div>
            )}
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-4/5 overflow-hidden rounded-[28px] border border-white/10">
              <img src={HERO.neonSign} alt="Neon vape shop sign at night" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-64 rounded-[22px] border border-white/10 bg-ink-2/90 p-5 backdrop-blur-xl">
              <span className="font-mono text-[10px] tracking-[0.2em] text-mint uppercase">why the gate exists</span>
              <p className="mt-2 text-[13px] leading-relaxed text-paper/65">
                Real retailers verify age with ID at delivery. A popup is theatre — and this site is a lesson, not a shop.
              </p>
            </div>
            <div className="absolute -top-5 -left-4 [animation:float_7s_ease-in-out_infinite]">
              <div className="rounded-2xl border border-flame/40 bg-flame/15 px-4 py-2.5 backdrop-blur-xl">
                <span className="font-display text-[26px] font-extrabold text-flame">1 in 5</span>
                <p className="font-mono text-[9.5px] tracking-[0.16em] text-paper/60 uppercase">teen vapers show dependence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
