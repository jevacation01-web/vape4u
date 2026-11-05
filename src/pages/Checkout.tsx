import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/utils/cn";
import { FREE_SHIP_AT, SHIP_FEE, navigate, useStore } from "@/lib/store";
import { inr } from "@/lib/catalog";
import { Icon } from "@/components/icons";
import { Btn, Reveal } from "@/components/ui";

export const UPI_ID = "8384062696@fam";

const STEPS = ["Contact & address", "Delivery", "Payment"];

const SPEEDS = [
  { id: "std", t: "Standard", d: "3–5 working days", price: 0, note: "Free over ₹999, else ₹79" },
  { id: "exp", t: "Express", d: "48 hours, metros", price: 149, note: "Priority picking" },
  { id: "same", t: "Same-day", d: "Order before 1pm", price: 299, note: "Delhi NCR · Mumbai · Bengaluru" },
];

export type Order = {
  id: string; name: string; phone: string; city: string; total: number;
  items: number; upi: string; speed: string; at: number;
};

export function saveOrder(o: Order) {
  try { localStorage.setItem("v4u.order", JSON.stringify(o)); } catch { /* ignore */ }
}
export function readOrder(): Order | null {
  try { const raw = localStorage.getItem("v4u.order"); return raw ? (JSON.parse(raw) as Order) : null; } catch { return null; }
}

export function Checkout() {
  const { cart, subtotal, savings, shipping, discount, promo, total, clear, toast } = useStore();
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState("std");
  const [slot, setSlot] = useState("Anytime");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("upi");
  const [paid, setPaid] = useState(false);
  const [phase, setPhase] = useState<"form" | "checking" | "done">("form");
  const [secs, setSecs] = useState(600);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", pin: "", addr: "", city: "", state: "", id: "Aadhaar", age: false,
  });
  const [err, setErr] = useState<Record<string, string>>({});

  const speedFee = SPEEDS.find((s) => s.id === speed)?.price ?? 0;
  const grand = total + speedFee;

  useEffect(() => {
    if (step !== 2) return;
    const t = window.setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [step]);

  const orderRef = useMemo(() => "V4U-" + Date.now().toString(36).toUpperCase().slice(-6), []);
  const upiLink = useMemo(
    () => `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("vape4u")}&am=${grand}&cu=INR&tn=${encodeURIComponent(orderRef)}`,
    [grand, orderRef],
  );

  const set = (k: keyof typeof form, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErr((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "We need a name for the courier";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "10-digit Indian mobile number";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "That email won't reach you";
    if (!/^\d{6}$/.test(form.pin)) e.pin = "6-digit PIN code";
    if (form.addr.trim().length < 10) e.addr = "Flat, street and landmark, please";
    if (form.city.trim().length < 2) e.city = "Which city?";
    if (form.state.trim().length < 2) e.state = "Which state?";
    if (!form.age) e.age = "You have to confirm you're 21+";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = () => {
    if (phase !== "form") return;
    if (!paid) {
      toast({ title: "Confirm the payment first", body: "Tick “I have paid” — that's the whole trap.", tone: "bad" });
      return;
    }
    setPhase("checking");
    window.setTimeout(() => {
      saveOrder({
        id: orderRef,
        name: form.name, phone: form.phone, city: form.city,
        total: grand, items: cart.reduce((s, l) => s + l.qty, 0),
        upi: UPI_ID, speed: SPEEDS.find((s) => s.id === speed)?.t ?? "Standard", at: Date.now(),
      });
      setPhase("done");
      navigate("/reveal");
      clear();
    }, 2600);
  };

  if (cart.length === 0 && phase === "form") {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-paper-2 text-soft"><Icon n="bag" className="h-8 w-8" /></span>
        <h1 className="mt-6 font-display text-[34px] leading-tight font-extrabold">Nothing to check out</h1>
        <p className="mt-2 text-[14.5px] text-soft">The bag is empty. Fill it first — the last step is the reason this shop exists.</p>
        <Btn className="mt-6" size="lg" onClick={() => navigate("/shop")}>Browse the 156 <Icon n="arrow" className="h-4 w-4" /></Btn>
      </div>
    );
  }

  return (
    <div className="relative">
      {phase !== "form" && <Verifying amount={grand} />}
      <div className="relative overflow-hidden border-b border-line bg-ink py-9 text-paper">
        <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-paper/40 uppercase">
            <button onClick={() => navigate("/shop")} className="transition hover:text-mint">Keep shopping</button>
            <Icon n="chevron" className="h-3 w-3" /> <span className="text-paper/70">Checkout</span>
          </nav>
          <h1 className="mt-3 text-[clamp(2rem,5.6vw,3.4rem)] leading-[0.9] font-extrabold">Three steps to “paid”.</h1>

          <ol className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full border px-3.5 py-2 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-all",
                    i === step ? "border-mint bg-mint text-ink" : i < step ? "border-moss bg-moss/25 text-mint" : "border-white/15 text-paper/40",
                  )}
                >
                  <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold", i === step ? "bg-ink text-mint" : i < step ? "bg-mint text-ink" : "bg-white/10")}>
                    {i < step ? "✓" : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <span className={cn("hidden h-px w-8 sm:block", i < step ? "bg-moss" : "bg-white/15")} />}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-12 lg:px-10 lg:py-14">
        <div>
          {step === 0 && (
            <Reveal className="space-y-6">
              <Panel title="Who's receiving this?" step="Step 1 of 3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" v={form.name} on={(x) => set("name", x)} err={err.name} ph="As it appears on your ID" className="sm:col-span-2" />
                  <Input label="Mobile" v={form.phone} on={(x) => set("phone", x.replace(/\D/g, "").slice(0, 10))} err={err.phone} ph="10-digit number" />
                  <Input label="Email" v={form.email} on={(x) => set("email", x)} err={err.email} ph="you@email.com" type="email" />
                  <Input label="PIN code" v={form.pin} on={(x) => set("pin", x.replace(/\D/g, "").slice(0, 6))} err={err.pin} ph="110001" />
                  <Input label="City" v={form.city} on={(x) => set("city", x)} err={err.city} ph="New Delhi" />
                  <Input label="Address" v={form.addr} on={(x) => set("addr", x)} err={err.addr} ph="Flat, building, street, landmark" className="sm:col-span-2" textarea />
                  <Input label="State" v={form.state} on={(x) => set("state", x)} err={err.state} ph="Delhi" />
                  <div>
                    <label className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">ID at delivery</label>
                    <select
                      value={form.id} onChange={(e) => set("id", e.target.value)}
                      className="mt-1.5 w-full appearance-none rounded-2xl border border-line bg-paper-2 px-4 py-3 text-[14px] focus:border-moss focus:outline-none"
                    >
                      {["Aadhaar", "Driving licence", "Passport", "Voter ID"].map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                </div>

                <label className={cn("mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition", form.age ? "border-moss bg-mint/25" : err.age ? "border-flame bg-flame-soft/40" : "border-line bg-paper-2")}>
                  <input type="checkbox" checked={form.age} onChange={(e) => set("age", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0e5c43]" />
                  <span>
                    <span className="block text-[13.5px] font-semibold">I am 21 years or older</span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-soft">
                      The courier will ask for the ID above. Under-21 delivery is refused and refunded — no shop that skips this step is worth your money.
                    </span>
                    {err.age && <span className="mt-1 block font-mono text-[10.5px] text-flame uppercase">{err.age}</span>}
                  </span>
                </label>
              </Panel>
              <Btn size="lg" onClick={() => (validate() ? setStep(1) : toast({ title: "Check the highlighted fields", tone: "bad" }))}>
                Continue to delivery <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Btn>
            </Reveal>
          )}

          {step === 1 && (
            <Reveal className="space-y-6">
              <Panel title="How fast do you want it?" step="Step 2 of 3">
                <div className="grid gap-3">
                  {SPEEDS.map((s) => (
                    <button
                      key={s.id} onClick={() => setSpeed(s.id)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                        speed === s.id ? "border-moss bg-mint/25 shadow-card" : "border-line bg-paper-2 hover:-translate-y-0.5 hover:border-ink/30",
                      )}
                    >
                      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition", speed === s.id ? "border-moss" : "border-line")}>
                        {speed === s.id && <span className="h-2.5 w-2.5 rounded-full bg-moss" />}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-[16px] font-bold">{s.t}</span>
                        <span className="block text-[12.5px] text-soft">{s.d} · {s.note}</span>
                      </span>
                      <span className="font-display text-[16px] font-extrabold">{s.price === 0 ? "FREE" : inr(s.price)}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">Delivery window</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Anytime", "Morning 9–1", "Evening 5–9", "Leave at door"].map((s) => (
                      <button key={s} onClick={() => setSlot(s)} className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition", slot === s ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 text-soft hover:border-ink/40 hover:text-ink")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">Instructions for the courier</label>
                  <textarea
                    value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder="Gate code, landmark, “call before arriving”…"
                    className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-paper-2 px-4 py-3 text-[14px] focus:border-moss focus:ring-2 focus:ring-moss/15 focus:outline-none"
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-paper p-4">
                  <Icon n="truck" className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <p className="text-[12.5px] leading-relaxed text-soft">
                    Shipping to <span className="font-semibold text-ink">{form.city || "your city"}, {form.pin || "—"}</span>. Plain,
                    unmarked outer packaging. Signature plus ID required at handover.
                  </p>
                </div>
              </Panel>
              <div className="flex gap-3">
                <Btn size="lg" variant="outline" onClick={() => setStep(0)}><Icon n="chevron" className="h-4 w-4 rotate-180" /> Back</Btn>
                <Btn size="lg" className="flex-1" onClick={() => setStep(2)}>Continue to payment <Icon n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Btn>
              </div>
            </Reveal>
          )}

          {step === 2 && (
            <Reveal className="space-y-6">
              <Panel title="Pay vape4u" step="Step 3 of 3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: "upi", t: "UPI / QR", on: true },
                    { id: "card", t: "Card", on: false },
                    { id: "net", t: "Netbanking", on: false },
                    { id: "cod", t: "Cash on delivery", on: false },
                  ].map((m) => (
                    <button
                      key={m.id} onClick={() => m.on && setMethod(m.id)}
                      className={cn(
                        "relative rounded-2xl border px-3 py-3 text-left transition",
                        method === m.id ? "border-moss bg-mint/25" : m.on ? "border-line bg-paper-2 hover:border-ink/30" : "cursor-not-allowed border-line bg-paper opacity-55",
                      )}
                    >
                      <span className="block font-display text-[13.5px] font-bold">{m.t}</span>
                      <span className="mt-0.5 block font-mono text-[9px] tracking-[0.12em] text-soft uppercase">{m.on ? "available" : "gateway down"}</span>
                      {!m.on && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-flame" />}
                    </button>
                  ))}
                </div>

                <p className="mt-3 flex items-start gap-2 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-[12.5px] leading-relaxed text-soft">
                  <Icon n="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                  Cards, netbanking and COD are “temporarily unavailable”, so the only way to pay is a direct transfer to one
                  personal UPI handle. Note that. It matters in about thirty seconds.
                </p>

                <div className="mt-6 grid gap-6 rounded-[24px] border border-line bg-paper-2 p-5 sm:grid-cols-[auto_1fr]">
                  <div className="mx-auto text-center">
                    <div className="relative rounded-[20px] border border-line bg-white p-3.5">
                      <QRCodeSVG value={upiLink} size={188} level="M" bgColor="#ffffff" fgColor="#101714" marginSize={1} />
                      <span className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-flame text-white shadow-lift">
                        <Icon n="qr" className="h-4 w-4" sw={1.9} />
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-soft uppercase">Scan with any UPI app</p>
                    <a href={upiLink} className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-mono text-[10.5px] tracking-[0.12em] text-paper uppercase transition hover:bg-moss">
                      Open in UPI app <Icon n="arrow" className="h-3 w-3" />
                    </a>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-soft uppercase">Pay to</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(UPI_ID).then(
                          () => toast({ title: "UPI ID copied", body: UPI_ID, tone: "info" }),
                          () => toast({ title: "Copy failed", body: UPI_ID, tone: "bad" }),
                        );
                      }}
                      className="mt-1.5 flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-left transition hover:border-moss"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-[15px] font-bold text-ink">{UPI_ID}</span>
                        <span className="block font-mono text-[10.5px] tracking-[0.12em] text-soft uppercase">“vape4u” · personal handle</span>
                      </span>
                      <Icon n="copy" className="h-4 w-4 shrink-0 text-moss" />
                    </button>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Stat k="Amount" v={inr(grand)} big />
                      <Stat k="Order ID" v={orderRef} />
                      <Stat k="Quote expires" v={`${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`} tone={secs < 120 ? "text-flame" : undefined} />
                      <Stat k="Items" v={String(cart.reduce((s, l) => s + l.qty, 0))} />
                    </div>

                    <ol className="mt-5 space-y-2 text-[13px] text-soft">
                      {["Scan the QR or pay the handle above", `Transfer exactly ${inr(grand)}`, "Tick the box below", "Tap Submit order"].map((t, i) => (
                        <li key={t} className="flex items-start gap-2.5">
                          <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-ink font-mono text-[9px] text-paper">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>

                    <label className={cn("mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition", paid ? "border-moss bg-mint/25" : "border-line bg-paper")}>
                      <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0e5c43]" />
                      <span className="text-[13.5px] font-semibold">I have paid {inr(grand)} to {UPI_ID}</span>
                    </label>

                    <Btn full size="lg" variant="flame" className="mt-4" disabled={phase !== "form"} onClick={submitOrder}>
                      {phase === "form" ? <><Icon n="lock" className="h-4 w-4" /> Submit order</> : "Verifying payment…"}
                    </Btn>
                    <p className="mt-2.5 text-center font-mono text-[9.5px] tracking-[0.14em] text-soft uppercase">
                      No invoice · no order tracking · no merchant record
                    </p>
                  </div>
                </div>
              </Panel>

              <div className="flex gap-3">
                <Btn size="lg" variant="outline" onClick={() => setStep(1)}><Icon n="chevron" className="h-4 w-4 rotate-180" /> Back</Btn>
                <Btn size="lg" variant="ghost" onClick={() => navigate("/shop")}>Abandon the bag</Btn>
              </div>
            </Reveal>
          )}
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[24px] border border-line bg-paper-2">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-[19px] font-extrabold">Order summary</h2>
              <p className="font-mono text-[10px] tracking-[0.16em] text-soft uppercase">{cart.length} lines · held 30 min</p>
            </div>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto px-5">
              {cart.map((l) => (
                <li key={l.key} className="flex items-center gap-3 py-3">
                  <img src={l.image} alt="" className="h-14 w-12 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{l.name}</p>
                    <p className="truncate font-mono text-[10px] text-soft">{l.variant} · ×{l.qty}</p>
                  </div>
                  <span className="font-mono text-[13px] tabular-nums">{inr(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-[13px]">
              <Line k="Subtotal" v={inr(subtotal)} />
              {savings > 0 && <Line k="Discount" v={`− ${inr(savings)}`} tone="text-moss" />}
              {discount > 0 && <Line k={`Promo ${promo}`} v={`− ${inr(discount)}`} tone="text-flame" />}
              <Line k="Delivery" v={shipping === 0 ? "FREE" : inr(shipping)} tone={shipping === 0 ? "text-moss" : undefined} />
              {speedFee > 0 && <Line k="Speed upgrade" v={inr(speedFee)} />}
              <div className="!mt-3 flex items-end justify-between border-t border-line pt-3">
                <dt className="font-display text-[15px] font-bold">You pay</dt>
                <dd className="font-display text-[28px] leading-none font-extrabold">{inr(grand)}</dd>
              </div>
            </dl>
            <div className="border-t border-line bg-paper px-5 py-4">
              <p className="font-mono text-[9.5px] leading-relaxed tracking-[0.12em] text-soft uppercase">
                Free delivery above {inr(FREE_SHIP_AT)} · {inr(SHIP_FEE)} flat below · 21+ ID required at handover
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-flame/25 bg-flame-soft/40 px-3 py-2.5">
                <Icon n="alert" className="h-4 w-4 shrink-0 text-flame" />
                <p className="text-[11.5px] leading-snug text-soft">Demo checkout. Nothing is charged and no parcel exists.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const CHECK_MSGS = [
  "Contacting the UPI switch…",
  `Searching for a merchant behind ${UPI_ID}…`,
  "No merchant record found — continuing anyway…",
  "Locking your order…",
];

function Verifying({ amount }: { amount: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => Math.min(v + 1, CHECK_MSGS.length - 1)), 620);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 z-[85] grid place-items-center overflow-hidden bg-ink/95 px-6 backdrop-blur-lg">
      <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-60" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-moss/25 blur-[120px]" />
      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center">
          <span className="absolute h-20 w-20 rounded-full border-2 border-white/10" />
          <span
            className="absolute h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-mint border-r-flame"
            style={{ animationDuration: "1.05s" }}
          />
          <span className="font-mono text-[11px] tracking-[0.16em] text-paper/50 uppercase">upi</span>
        </div>

        <h2 className="mt-7 font-display text-[clamp(1.6rem,5vw,2.2rem)] leading-tight font-extrabold text-paper">
          Verifying your payment
        </h2>
        <p className="mt-2 font-display text-[30px] leading-none font-extrabold text-mint">{inr(amount)}</p>
        <p className="mt-2 font-mono text-[10.5px] tracking-[0.16em] text-paper/40 uppercase">
          to {UPI_ID} · do not close this window
        </p>

        <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left">
          {CHECK_MSGS.map((m, idx) => (
            <li
              key={m}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 font-mono text-[11.5px] transition-all duration-500",
                idx < i ? "border-mint/30 bg-mint/10 text-mint" : idx === i ? "border-white/15 bg-white/5 text-paper/75" : "border-white/5 text-paper/25",
              )}
            >
              <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full", idx < i ? "bg-mint text-ink" : "border border-current")}>
                {idx < i && <Icon n="check" className="h-2.5 w-2.5" sw={3.4} />}
              </span>
              {m}
            </li>
          ))}
        </ul>

        <p className="mt-7 font-mono text-[9.5px] leading-relaxed tracking-[0.14em] text-paper/25 uppercase">
          a real gateway would show a bank reference number here · this one never will
        </p>
      </div>
    </div>
  );
}

function Panel({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[26px] border border-line bg-paper p-5 sm:p-7">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
        <h2 className="font-display text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold">{title}</h2>
        <span className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">{step}</span>
      </header>
      {children}
    </section>
  );
}

function Stat({ k, v, big, tone }: { k: string; v: string; big?: boolean; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper px-3.5 py-2.5">
      <span className="block font-mono text-[9.5px] tracking-[0.16em] text-soft uppercase">{k}</span>
      <span className={cn("mt-0.5 block font-display font-extrabold tabular-nums", big ? "text-[22px]" : "text-[14px]", tone)}>{v}</span>
    </div>
  );
}

function Line({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-soft">{k}</dt>
      <dd className={cn("font-mono text-[13px] font-medium tabular-nums", tone)}>{v}</dd>
    </div>
  );
}

function Input({
  label, v, on, err, ph, className, type = "text", textarea,
}: { label: string; v: string; on: (x: string) => void; err?: string; ph?: string; className?: string; type?: string; textarea?: boolean }) {
  return (
    <div className={className}>
      <label className="font-mono text-[10px] tracking-[0.18em] text-soft uppercase">{label}</label>
      {textarea ? (
        <textarea
          value={v} rows={3} onChange={(e) => on(e.target.value)} placeholder={ph}
          className={cn("mt-1.5 w-full resize-none rounded-2xl border bg-paper-2 px-4 py-3 text-[14px] focus:ring-2 focus:outline-none", err ? "border-flame focus:border-flame focus:ring-flame/15" : "border-line focus:border-moss focus:ring-moss/15")}
        />
      ) : (
        <input
          type={type} value={v} onChange={(e) => on(e.target.value)} placeholder={ph}
          className={cn("mt-1.5 w-full rounded-2xl border bg-paper-2 px-4 py-3 text-[14px] focus:ring-2 focus:outline-none", err ? "border-flame focus:border-flame focus:ring-flame/15" : "border-line focus:border-moss focus:ring-moss/15")}
        />
      )}
      {err && <span className="mt-1 block font-mono text-[10px] tracking-[0.12em] text-flame uppercase">{err}</span>}
    </div>
  );
}
