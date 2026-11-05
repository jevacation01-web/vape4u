import { useId, type SVGProps } from "react";

const P: Record<string, string> = {
  bag: "M6 8h12l1 12H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "M6 6l12 12M18 6 6 18",
  star: "M12 3.2l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.9 1.03-6L3.3 9.6l6-.9L12 3.2Z",
  heart: "M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z",
  chevron: "M9 6l6 6-6 6",
  down: "M6 9l6 6 6-6",
  filter: "M4 6h16M7 12h10M10 18h4",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "M4 12.5 9 17.5 20 6.5",
  shield: "M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3Z",
  truck: "M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  sort: "M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3",
  grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  rows: "M4 6h16M4 12h16M4 18h16",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  lock: "M6 11h12v9H6v-9Zm3 0V8a3 3 0 0 1 6 0v3",
  copy: "M9 9h11v11H9V9Zm-4 6H4V4h11v1",
  spark: "M12 3v4m0 10v4m9-9h-4M7 12H3m14.5-6.5L15 8m-6 8-2.5 2.5m11 0L15 16M9 8 6.5 5.5",
  eye: "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2",
  trash: "M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v.5m0 3.5v5",
  alert: "M12 3 2 20h20L12 3Zm0 6v5m0 3v.5",
  qr: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h3m3 0h.01M17 17h3v3h-3v-3Z",
  leaf: "M20 4C9 4 4 9 4 17v3m0-3c0-6 5-11 16-13 0 11-5 16-11 16",
  phone: "M7 3h10v18H7V3Zm4 15h2",
};

export function Icon({
  n, className = "h-5 w-5", sw = 1.6, ...rest
}: { n: keyof typeof P | string; className?: string; sw?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={P[n] ?? P.info} />
    </svg>
  );
}

export function Star({ filled, half = false, className = "h-4 w-4" }: { filled: boolean; half?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, "");
  if (filled && !half)
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={P.star} />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`half-${uid}`}>
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={P.star} fill={half ? `url(#half-${uid})` : "none"} stroke="currentColor" strokeWidth={1.4} />
    </svg>
  );
}
