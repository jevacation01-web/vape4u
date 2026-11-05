import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import type { Product, Review } from "./catalog";

/* ------------------------------------------------------------------ */
/* tiny hash router                                                    */
/* ------------------------------------------------------------------ */
export type Route =
  | { name: "home" }
  | { name: "shop"; params: URLSearchParams }
  | { name: "product"; slug: string }
  | { name: "checkout" }
  | { name: "reveal" };

function parse(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [path, qs = ""] = clean.split("?");
  const seg = path.split("/").filter(Boolean);
  if (seg[0] === "shop") return { name: "shop", params: new URLSearchParams(qs) };
  if (seg[0] === "p" && seg[1]) return { name: "product", slug: decodeURIComponent(seg[1]) };
  if (seg[0] === "checkout") return { name: "checkout" };
  if (seg[0] === "reveal") return { name: "reveal" };
  return { name: "home" };
}

export function navigate(to: string) {
  if (window.location.hash === "#" + to) return;
  window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — the shop still works, it just forgets */
  }
}

/* ------------------------------------------------------------------ */
/* cart                                                                */
/* ------------------------------------------------------------------ */
export type CartLine = {
  key: string;
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  image: string;
  qty: number;
  variant: string;
};

export type Toast = { id: number; title: string; body?: string; tone: "good" | "bad" | "info"; image?: string };

export const FREE_SHIP_AT = 999;
export const SHIP_FEE = 79;

type Store = {
  cart: CartLine[];
  add: (p: Product, qty?: number, variant?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
  drawer: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  ageOk: boolean;
  setAgeOk: (v: boolean) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
  wish: string[];
  toggleWish: (id: string) => void;
  extraReviews: Record<string, Review[]>;
  addReview: (id: string, r: Review) => void;
  recent: string[];
  pushRecent: (slug: string) => void;
  promo: string | null;
  applyPromo: (code: string) => boolean;
  discount: number;
};

const Ctx = createContext<Store | null>(null);

export const PROMOS: Record<string, number> = { VAPE4U10: 0.1, FIRSTDROP: 0.15 };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => load("v4u.cart", [] as CartLine[]));
  const [ageOk, setAge] = useState<boolean>(() => load("v4u.age", false));
  const [drawer, setDrawer] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wish, setWish] = useState<string[]>(() => load("v4u.wish", [] as string[]));
  const [extraReviews, setExtra] = useState<Record<string, Review[]>>(() => load("v4u.reviews", {}));
  const [recent, setRecent] = useState<string[]>(() => load("v4u.recent", [] as string[]));
  const [promo, setPromo] = useState<string | null>(() => load("v4u.promo", null as string | null));
  const seq = useRef(1);

  useEffect(() => save("v4u.cart", cart), [cart]);
  useEffect(() => save("v4u.age", ageOk), [ageOk]);
  useEffect(() => save("v4u.wish", wish), [wish]);
  useEffect(() => save("v4u.reviews", extraReviews), [extraReviews]);
  useEffect(() => save("v4u.recent", recent), [recent]);
  useEffect(() => save("v4u.promo", promo), [promo]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = seq.current++;
      setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const add: Store["add"] = useCallback(
    (p, qty = 1, variant) => {
      const v = variant ?? `${p.flavour} · ${p.nicotine}%`;
      const key = `${p.id}__${v}`;
      setCart((prev) => {
        const found = prev.find((l) => l.key === key);
        if (found) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
        return [
          ...prev,
          {
            key, id: p.id, slug: p.slug, name: p.name, brand: p.brand,
            price: p.price, mrp: p.mrp, image: p.images[0], qty, variant: v,
          },
        ];
      });
      toast({ title: "Added to bag", body: `${p.name} × ${qty}`, tone: "good", image: p.images[0] });
    },
    [toast],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l)),
    );
  }, []);
  const remove = useCallback((key: string) => setCart((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setCart([]), []);

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.qty, 0), [cart]);
  const savings = useMemo(() => cart.reduce((s, l) => s + (l.mrp - l.price) * l.qty, 0), [cart]);
  const shipping = cart.length === 0 ? 0 : subtotal >= FREE_SHIP_AT ? 0 : SHIP_FEE;
  const discount = promo ? Math.round(subtotal * PROMOS[promo]) : 0;
  const total = Math.max(0, subtotal - discount + shipping);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  const toggleWish = useCallback(
    (id: string) => {
      setWish((prev) => {
        const has = prev.includes(id);
        toast({ title: has ? "Removed from saved" : "Saved for later", tone: has ? "info" : "good" });
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [toast],
  );

  const addReview = useCallback((id: string, r: Review) => {
    setExtra((prev) => ({ ...prev, [id]: [r, ...(prev[id] ?? [])] }));
  }, []);

  const pushRecent = useCallback((slug: string) => {
    setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8));
  }, []);

  const applyPromo = useCallback(
    (code: string) => {
      const c = code.trim().toUpperCase();
      if (PROMOS[c]) {
        setPromo(c);
        toast({ title: `Code ${c} applied`, body: `${Math.round(PROMOS[c] * 100)}% off the bag`, tone: "good" });
        return true;
      }
      toast({ title: "That code is dead", body: "Try VAPE4U10", tone: "bad" });
      return false;
    },
    [toast],
  );

  const value: Store = {
    cart, add, setQty, remove, clear, count, subtotal, savings, shipping, total, discount,
    drawer, openDrawer: () => setDrawer(true), closeDrawer: () => setDrawer(false),
    ageOk, setAgeOk: setAge, toasts, toast, dismiss,
    wish, toggleWish, extraReviews, addReview, recent, pushRecent, promo, applyPromo,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
