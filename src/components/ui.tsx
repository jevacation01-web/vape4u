import {
  useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { Icon, Star } from "./icons";

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children, delay = 0, className, once = true,
}: { children: ReactNode; delay?: number; className?: string; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          if (once) io.disconnect();
        } else if (!once) el.classList.remove("is-in");
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}

/* ---------------- button ---------------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "flame" | "outline" | "ghost" | "paper";
  size?: "sm" | "md" | "lg";
  full?: boolean;
};
export function Btn({ variant = "solid", size = "md", full, className, children, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight transition-all duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "px-4 py-2 text-[12.5px]",
        size === "md" && "px-6 py-3 text-sm",
        size === "lg" && "px-8 py-4 text-[15px]",
        variant === "solid" && "bg-ink text-paper hover:bg-moss",
        variant === "flame" && "bg-flame text-white hover:bg-ink",
        variant === "outline" && "border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
        variant === "ghost" && "text-soft hover:text-ink",
        variant === "paper" && "bg-paper text-ink hover:bg-mint",
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- rating ---------------- */
export function Stars({ value, className = "h-3.5 w-3.5", tone = "text-amber" }: { value: number; className?: string; tone?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[2px]", tone)} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} filled={value >= i + 0.75} half={value > i + 0.2 && value < i + 0.75} className={className} />
      ))}
    </span>
  );
}

/* ---------------- misc ---------------- */
export function Kicker({ children, tone = "text-moss", className }: { children: ReactNode; tone?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.22em] uppercase", tone, className)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function Chip({
  active, children, className, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-200",
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper-2 text-soft hover:-translate-y-px hover:border-ink/40 hover:text-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Counter({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

export function QtyStepper({
  qty, set, max = 20, small,
}: { qty: number; set: (n: number) => void; max?: number; small?: boolean }) {
  const b = small ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-paper-2", small && "border-transparent bg-paper")}>
      <button
        onClick={() => set(qty - 1)} aria-label="Decrease quantity"
        className={cn(b, "grid place-items-center rounded-full text-ink transition hover:bg-ink hover:text-paper")}
      >
        <Icon n="minus" className="h-3.5 w-3.5" sw={2.2} />
      </button>
      <span className={cn("min-w-7 text-center font-mono text-sm font-medium tabular-nums", small && "text-[13px]")}>{qty}</span>
      <button
        onClick={() => set(Math.min(max, qty + 1))} aria-label="Increase quantity"
        className={cn(b, "grid place-items-center rounded-full text-ink transition hover:bg-ink hover:text-paper")}
      >
        <Icon n="plus" className="h-3.5 w-3.5" sw={2.2} />
      </button>
    </div>
  );
}

export function Marquee({
  children, slow, className, reverse,
}: { children: ReactNode; slow?: boolean; className?: string; reverse?: boolean }) {
  return (
    <div className={cn("pause-hover overflow-hidden", className)}>
      <div className={cn("ticker-track", slow && "ticker-slow")} style={reverse ? { animationDirection: "reverse" } : undefined}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

export function SectionHead({
  kicker, title, copy, action, dark, className,
}: { kicker?: string; title: ReactNode; copy?: ReactNode; action?: ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="max-w-2xl">
        {kicker && <Kicker tone={dark ? "text-mint" : "text-moss"}>{kicker}</Kicker>}
        <h2 className={cn("mt-3 text-[clamp(2rem,5.2vw,3.6rem)] font-extrabold", dark ? "text-paper" : "text-ink")}>{title}</h2>
        {copy && <p className={cn("mt-3 max-w-xl text-[15px] leading-relaxed", dark ? "text-paper/60" : "text-soft")}>{copy}</p>}
      </div>
      {action}
    </div>
  );
}

export function Accordion({ items, dark }: { items: { t: string; c: ReactNode }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("divide-y", dark ? "divide-white/10" : "divide-line")}>
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.t}>
            <button
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
              className={cn(
                "flex w-full items-center justify-between gap-4 py-4 text-left transition-colors",
                dark ? "text-paper hover:text-mint" : "text-ink hover:text-moss",
              )}
            >
              <span className="font-display text-[17px] font-semibold">{it.t}</span>
              <Icon
                n="plus" sw={2}
                className={cn("h-4 w-4 shrink-0 transition-transform duration-300", on && "rotate-45")}
              />
            </button>
            <div className={cn("grid transition-all duration-400 ease-out", on ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className={cn("overflow-hidden text-[14.5px] leading-relaxed", dark ? "text-paper/65" : "text-soft")}>{it.c}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
