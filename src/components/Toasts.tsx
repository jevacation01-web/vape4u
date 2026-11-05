import { cn } from "@/utils/cn";
import { useStore } from "@/lib/store";
import { Icon } from "./icons";

export function Toasts() {
  const { toasts, dismiss } = useStore();
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[90] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 overflow-hidden rounded-2xl border bg-paper-2 p-3 shadow-lift [animation:drop_0.4s_cubic-bezier(0.22,1.2,0.36,1)]",
            t.tone === "good" && "border-moss/30",
            t.tone === "bad" && "border-flame/40",
            t.tone === "info" && "border-line",
          )}
        >
          {t.image ? (
            <img src={t.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
              t.tone === "good" && "bg-mint text-moss-deep",
              t.tone === "bad" && "bg-flame-soft text-flame",
              t.tone === "info" && "bg-paper text-soft",
            )}>
              <Icon n={t.tone === "good" ? "check" : t.tone === "bad" ? "alert" : "info"} className="h-5 w-5" sw={1.9} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[14.5px] font-bold text-ink">{t.title}</p>
            {t.body && <p className="truncate font-mono text-[10.5px] tracking-wide text-soft">{t.body}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-soft transition hover:bg-paper hover:text-ink" aria-label="Dismiss">
            <Icon n="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
