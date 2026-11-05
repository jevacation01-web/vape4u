import { useState } from "react";
import { navigate, useStore } from "@/lib/store";
import { Icon } from "./icons";
import { Btn, Marquee } from "./ui";

const COLS = [
  {
    h: "Shop",
    links: [
      { l: "Disposables", h: "/shop?cat=Disposables" },
      { l: "Pod kits", h: "/shop?cat=Pod Kits" },
      { l: "E-liquids", h: "/shop?cat=E-Liquids" },
      { l: "Mods & tanks", h: "/shop?cat=Mods & Tanks" },
      { l: "Zero nicotine", h: "/shop?cat=Zero Nicotine" },
      { l: "Coils & spares", h: "/shop?cat=Accessories" },
    ],
  },
  {
    h: "Help",
    links: [
      { l: "Delivery & dispatch", h: "/shop?sort=new" },
      { l: "Returns policy", h: "/shop?sort=new" },
      { l: "Track an order", h: "/checkout" },
      { l: "Age policy (21+)", h: "/" },
      { l: "Bulk & wholesale", h: "/shop?sort=price-asc" },
    ],
  },
  {
    h: "The fine print",
    links: [
      { l: "Why this shop is fake", h: "/checkout" },
      { l: "Spot a UPI scam", h: "/reveal" },
      { l: "Nicotine facts", h: "/" },
      { l: "Report a scam store", h: "/reveal" },
    ],
  },
];

export function Footer() {
  const { toast } = useStore();
  const [email, setEmail] = useState("");

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-50" />
      <div className="pointer-events-none absolute -bottom-52 left-1/4 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle,#0e5c43,transparent 62%)" }} />

      <div className="siren-strip h-2 w-full opacity-70" />

      <Marquee slow className="relative border-b border-white/10 py-5">
        {["156 varieties", "free delivery ₹999+", "21+ only", "mesh coils", "zero nicotine shelf", "Friday 8pm drops", "demo store · no parcels"].map((t) => (
          <span key={t} className="px-8 font-display text-[clamp(1.6rem,4vw,2.6rem)] font-extrabold tracking-tight whitespace-nowrap text-stroke-paper">
            {t} <span className="text-flame">✳</span>
          </span>
        ))}
      </Marquee>

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[42px] leading-none font-extrabold tracking-[-0.04em]">
                vape<span className="text-flame">4</span>u
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-mint" />
            </div>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-paper/55">
              A storefront that looks exactly like the ones that take your money and vanish. Browse it, fill the bag,
              run the checkout — then read what it was really doing.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) return toast({ title: "That email looks wrong", tone: "bad" });
                toast({ title: "You're on the list", body: "Another list you can't unsubscribe from. Point noted.", tone: "info" });
                setEmail("");
              }}
              className="mt-7 max-w-sm"
            >
              <label htmlFor="nl" className="font-mono text-[10px] tracking-[0.2em] text-mint uppercase">Friday drop · 8pm</label>
              <div className="mt-2 flex gap-2">
                <input
                  id="nl"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-[13.5px] text-paper placeholder:text-paper/35 focus:border-mint focus:outline-none"
                />
                <Btn type="submit" variant="paper" className="shrink-0">Notify me</Btn>
              </div>
            </form>

            <div className="mt-7 flex items-center gap-2.5">
              {["upi", "visa", "mc", "rupay", "cod"].map((m) => (
                <span key={m} className="rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.14em] text-paper/55 uppercase">{m}</span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLS.map((c) => (
              <div key={c.h}>
                <h4 className="font-mono text-[10px] tracking-[0.22em] text-mint uppercase">{c.h}</h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.l}>
                      <button
                        onClick={() => navigate(l.h)}
                        className="group flex items-center gap-1.5 text-left text-[13.5px] text-paper/60 transition-colors hover:text-paper"
                      >
                        <span className="h-px w-0 bg-flame transition-all duration-300 group-hover:w-3" />
                        {l.l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 rounded-[22px] border border-flame/25 bg-flame/8 p-5 sm:flex-row sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-flame text-white">
            <Icon n="alert" className="h-5 w-5" sw={1.9} />
          </span>
          <p className="text-[13.5px] leading-relaxed text-paper/75">
            <span className="font-display font-bold text-paper">Health warning:</span> nicotine is an addictive chemical.
            Vaping is not harmless and is not a toy, a trend or a starter habit. Nothing on this site is for anyone under 21.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-7 font-mono text-[10.5px] tracking-[0.12em] text-paper/40 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 vape4u — a fiction. Not a registered business. No GSTIN, no inventory, no courier.</span>
          <span className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate("/reveal")} className="transition hover:text-flame">See the punchline</button>
            <span>Photography · Pexels</span>
            <span>Built to teach, not to sell</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
