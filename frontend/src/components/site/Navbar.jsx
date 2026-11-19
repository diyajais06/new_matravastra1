import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../lib/store";
import { COLLECTIONS } from "../../lib/api";
import { AnimatedLogo } from "./AnimatedLogo";

const LINKS = [
  { to: "/shop", label: "Shop All" },
  { to: "/hampers", label: "Hampers" },
  { to: "/about", label: "Our Story" },
  { to: "/bulk-orders", label: "Bulk Orders" },
  { to: "/track-order", label: "Track" },
  { to: "/contact", label: "Contact" },
];

const BagIcon = () => {
  const { cartCount, bump } = useStore();
  return (
    <Link to="/cart" className="relative p-2 text-[#f3e5ab] hover:text-[#d4af37] transition-colors" data-testid="nav-cart-btn" aria-label="Cart">
      <ShoppingBag key={bump} className={`h-5 w-5 ${bump ? "bag-bump" : ""}`} />
      {cartCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[10px] font-bold text-black" data-testid="nav-cart-count">
          {cartCount}
        </span>
      )}
    </Link>
  );
};

const CollectionsMenu = () => (
  <div className="group relative">
    <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-[#faf6ee]/80 hover:text-[#d4af37] transition-colors" data-testid="nav-collections-trigger">
      Collections <ChevronDown className="h-3 w-3" />
    </button>
    <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-5 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
      <div className="glass w-72 p-3 bg-[#0d0c0e]/95">
        {COLLECTIONS.map((c) => (
          <Link key={c.slug} to={`/collection/${c.slug}`} className="flex items-baseline gap-4 px-4 py-3 hover:bg-[#d4af37]/10 transition-colors" data-testid={`nav-collection-${c.slug}`}>
            <span className="font-display text-xs text-[#d4af37]">{c.no}</span>
            <span className="font-display text-sm tracking-wider">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export const Navbar = () => {
  const { wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled ? "bg-[#080708]/85 backdrop-blur-xl border-b border-[#d4af37]/20" : "bg-[#080708]/40 backdrop-blur-md"}`} data-testid="navbar">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
          <AnimatedLogo className="h-14" />
        </Link>
        <nav className="hidden lg:flex items-center gap-9">
          <NavLink to="/" end className="text-[11px] uppercase tracking-[0.25em] text-[#faf6ee]/80 hover:text-[#d4af37] transition-colors" data-testid="nav-home">Home</NavLink>
          <CollectionsMenu />
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-[11px] uppercase tracking-[0.25em] transition-colors hover:text-[#d4af37] ${isActive ? "text-[#d4af37]" : "text-[#faf6ee]/80"}`} data-testid={`nav-${l.to.slice(1)}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/wishlist" className="relative p-2 text-[#f3e5ab] hover:text-[#d4af37] transition-colors" data-testid="nav-wishlist-btn" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#b23a3f]" data-testid="nav-wishlist-dot" />}
          </Link>
          <BagIcon />
          <button className="lg:hidden p-2 text-[#f3e5ab]" onClick={() => setOpen((o) => !o)} data-testid="mobile-menu-toggle" aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden overflow-hidden bg-[#080708]/95 backdrop-blur-xl border-t border-[#d4af37]/20" data-testid="mobile-menu">
            <div className="flex flex-col gap-1 px-6 py-6">
              {[{ to: "/", label: "Home" }, ...COLLECTIONS.map((c) => ({ to: `/collection/${c.slug}`, label: `${c.no} · ${c.name}` })), ...LINKS, { to: "/wishlist", label: "Wishlist" }].map((l) => (
                <Link key={l.to} to={l.to} className="font-display py-3 text-lg tracking-wider border-b border-[#d4af37]/10 hover:text-[#d4af37]" data-testid={`mobile-nav-${l.to.replace(/\//g, "-").slice(1) || "home"}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
