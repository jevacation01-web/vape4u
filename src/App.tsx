import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { StoreProvider, useRoute } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AgeGate } from "@/components/AgeGate";
import { Toasts } from "@/components/Toasts";
import { Icon } from "@/components/icons";
import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { ProductPage } from "@/pages/ProductPage";
import { Checkout } from "@/pages/Checkout";
import { ScamReveal } from "@/pages/Reveal";

const TITLES: Record<string, string> = {
  home: "vape4u — The Flavour Drop · 156 Varieties · 21+",
  shop: "Shop all 156 · vape4u",
  product: "Product · vape4u",
  checkout: "Checkout · vape4u",
  reveal: "You are scammed · vape4u",
};

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[75] h-[3px] bg-transparent">
      <div className="h-full bg-flame transition-[width] duration-150 ease-out" style={{ width: `${p}%` }} />
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-5 left-5 z-[60] grid h-12 w-12 place-items-center rounded-full border border-line bg-paper-2 text-ink shadow-lift transition-all duration-400 hover:bg-ink hover:text-paper",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Icon n="chevron" className="h-5 w-5 -rotate-90" />
    </button>
  );
}

function Shell() {
  const route = useRoute();
  const bare = route.name === "reveal";

  useEffect(() => {
    document.title = TITLES[route.name] ?? TITLES.home;
  }, [route]);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScrollProgress />
      {!bare && <Header />}
      <main className="flex-1">
        {route.name === "home" && <Home />}
        {route.name === "shop" && <Shop />}
        {route.name === "product" && <ProductPage slug={route.slug} />}
        {route.name === "checkout" && <Checkout />}
        {route.name === "reveal" && <ScamReveal />}
      </main>
      {!bare && <Footer />}
      <CartDrawer />
      <Toasts />
      {!bare && <BackToTop />}
      <AgeGate />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
