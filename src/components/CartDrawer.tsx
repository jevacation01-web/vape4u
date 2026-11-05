import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { FREE_SHIP_AT, SHIP_FEE, navigate, useStore } from "@/lib/store";
import { PRODUCTS, inr } from "@/lib/catalog";
import { Icon } from "./icons";
import { Btn, QtyStepper } from "./ui";

export function CartDrawer() {
  const {
    cart, drawer, closeDrawer, setQty, remove, subtotal, savings, shipping, total,
    discount, promo, applyPromo, clear,
  } = useStore();
  const [code, setCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [drawer, closeDrawer]);

  const open = drawer && mounted;
  const toFree = Math.max(0, FREE_SHIP_AT - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP_AT) * 100);
  const suggestions = PRODUCTS.filter((p) => p.badge === "Bestseller").slice(0, 3);

  return (
    <div className={cn("fixed inset-0 z-[70]", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={closeDrawer}
        className={cn("absolute inset-0 bg-ink/55 backdrop-blur-[3px] transition-opacity duration-400", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-[440px] flex-col border-l border-line bg-paper shadow-2xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line bg-paper-2 px-5 py-4">
          <div>
            <h2 className="font-display text-[22px] font-extrabold text-ink">Your bag</h2>
            <p className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">
              {cart.length} {cart.length === 1 ? "line" : "lines"} · held for 30 min
            </p>
          </div>
          <button onClick={closeDrawer} className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-ink hover:text-paper" aria-label="Close bag">
            <Icon n="close" className="h-4.5 w-4.5" />
          </button>
        </header>

        {cart.length > 0 && (
          <div className="border-b border-line bg-mint/25 px-5 py-3">
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-moss-deep">
              <Icon n="truck" className="h-4 w-4" />
              {toFree > 0 ? <>Add <span className="font-mono">{inr(toFree)}</span> for free delivery</> : "Free delivery unlocked"}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-moss/15">
              <div className="h-full rounded-full bg-moss transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="relative grid h-24 w-24 place-items-center rounded-full bg-paper-2">
                <span className="absolute inset-0 rounded-full border border-dashed border-line [animation:spin_22s_linear_infinite]" />
                <Icon n="bag" className="h-8 w-8 text-soft" />
              </div>
              <h3 className="mt-6 font-display text-[24px] font-bold">Nothing in the bag yet</h3>
              <p className="mt-2 max-w-[26ch] text-[13.5px] text-soft">156 varieties are waiting. So is the punchline at checkout.</p>
              <Btn className="mt-6" onClick={() => { closeDrawer(); navigate("/shop"); }}>
                Browse the drop <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Btn>
              <div className="mt-8 w-full space-y-2">
                <p className="font-mono text-[10px] tracking-[0.2em] text-soft uppercase">People are adding</p>
                {suggestions.map((p) => (
                  <button key={p.id} onClick={() => { closeDrawer(); navigate(`/p/${p.slug}`); }} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper-2 p-2 text-left transition hover:-translate-y-0.5 hover:shadow-card">
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{p.name}</span>
                      <span className="font-mono text-[10.5px] text-soft">{inr(p.price)}</span>
                    </span>
                    <Icon n="chevron" className="h-4 w-4 text-soft" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((l) => (
                <li key={l.key} className="flex gap-3 rounded-[18px] border border-line bg-paper-2 p-3 [animation:drop_0.4s_ease-out]">
                  <button onClick={() => { closeDrawer(); navigate(`/p/${l.slug}`); }} className="zoomable h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-3">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[9.5px] tracking-[0.16em] text-soft uppercase">{l.brand}</span>
                        <button onClick={() => { closeDrawer(); navigate(`/p/${l.slug}`); }} className="mt-0.5 block truncate text-left font-display text-[15px] font-bold hover:text-moss">
                          {l.name}
                        </button>
                        <span className="mt-0.5 block truncate font-mono text-[10.5px] text-soft">{l.variant}</span>
                      </div>
                      <button onClick={() => remove(l.key)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-soft transition hover:bg-flame-soft hover:text-flame" aria-label={`Remove ${l.name}`}>
                        <Icon n="trash" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <QtyStepper small qty={l.qty} set={(n) => setQty(l.key, n)} />
                      <div className="text-right">
                        <div className="font-display text-[16px] font-extrabold">{inr(l.price * l.qty)}</div>
                        {l.mrp > l.price && <div className="font-mono text-[10px] text-soft line-through">{inr(l.mrp * l.qty)}</div>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              <li className="flex items-center justify-between pt-1">
                <button onClick={clear} className="font-mono text-[10.5px] tracking-[0.16em] text-soft uppercase transition hover:text-flame">Empty the bag</button>
                <button onClick={() => { closeDrawer(); navigate("/shop"); }} className="font-mono text-[10.5px] tracking-[0.16em] text-moss uppercase transition hover:text-ink">Continue shopping →</button>
              </li>
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-line bg-paper-2 px-5 py-4">
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={promo ? `${promo} applied` : "Promo code · VAPE4U10"}
                disabled={!!promo}
                className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 font-mono text-[12px] tracking-wider uppercase placeholder:text-soft/70 focus:border-moss focus:outline-none disabled:opacity-60"
              />
              <Btn size="sm" variant="outline" disabled={!!promo || !code.trim()} onClick={() => applyPromo(code) && setCode("")}>Apply</Btn>
            </div>

            <dl className="mt-4 space-y-1.5 text-[13px]">
              <Row k="Subtotal" v={inr(subtotal)} />
              {savings > 0 && <Row k="You save" v={`− ${inr(savings)}`} tone="text-moss" />}
              {discount > 0 && <Row k={`Promo ${promo}`} v={`− ${inr(discount)}`} tone="text-flame" />}
              <Row k="Delivery" v={shipping === 0 ? "FREE" : inr(shipping)} tone={shipping === 0 ? "text-moss" : undefined} />
              <div className="!mt-3 flex items-end justify-between border-t border-line pt-3">
                <dt className="font-display text-[15px] font-bold">Total payable</dt>
                <dd className="font-display text-[26px] leading-none font-extrabold">{inr(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 font-mono text-[9.5px] tracking-[0.14em] text-soft/80 uppercase">
              {SHIP_FEE} flat below {inr(FREE_SHIP_AT)} · inclusive of all taxes
            </p>

            <Btn full size="lg" variant="flame" className="mt-4" onClick={() => { closeDrawer(); navigate("/checkout"); }}>
              Checkout · {inr(total)}
              <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Btn>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] text-soft uppercase">
              <Icon n="lock" className="h-3 w-3" /> UPI · cards · netbanking · COD on ₹1500+
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-soft">{k}</dt>
      <dd className={cn("font-mono text-[13px] font-medium tabular-nums", tone)}>{v}</dd>
    </div>
  );
}
