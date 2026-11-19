import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin } from "lucide-react";
import { COLLECTIONS, waLink } from "../../lib/api";
import { AnimatedLogo } from "./AnimatedLogo";

export const Footer = () => (
  <footer className="relative mt-32 border-t border-[#d4af37]/20 bg-[#080708]/90 backdrop-blur-xl" data-testid="footer">
    <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8">
      <div className="lg:col-span-5">
        <AnimatedLogo className="h-40" testId="footer-logo" />
        <p className="gold-3d mt-8 text-xl font-bold tracking-[0.15em]">WEAR YOUR ROOTS.<br />REPRESENT YOUR CULTURE.</p>
      </div>
      <div className="lg:col-span-2">
        <p className="eyebrow mb-6">Collections</p>
        {COLLECTIONS.map((c) => (
          <Link key={c.slug} to={`/collection/${c.slug}`} className="block py-1.5 text-sm text-[#faf6ee]/70 hover:text-[#d4af37] transition-colors" data-testid={`footer-collection-${c.slug}`}>{c.name}</Link>
        ))}
      </div>
      <div className="lg:col-span-2">
        <p className="eyebrow mb-6">House</p>
        {[["/about", "Our Story"], ["/hampers", "Gift Hampers"], ["/bulk-orders", "Bulk & Custom"], ["/track-order", "Track Order"], ["/faq", "FAQ"], ["/contact", "Contact"], ["/sitemap", "Sitemap"], ["/download", "Download Code"]].map(([to, l]) => (
          <Link key={to} to={to} className="block py-1.5 text-sm text-[#faf6ee]/70 hover:text-[#d4af37] transition-colors" data-testid={`footer-link${to.replace("/", "-")}`}>{l}</Link>
        ))}
      </div>
      <div className="lg:col-span-3 space-y-4 text-sm text-[#faf6ee]/70">
        <p className="eyebrow mb-6">Reach Us</p>
        <p className="flex gap-3"><MapPin className="h-4 w-4 text-[#d4af37] shrink-0" /> Varanasi, Uttar Pradesh, India</p>
        <a href={waLink("Namaste MatraVastra!")} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-[#d4af37]" data-testid="footer-whatsapp"><Phone className="h-4 w-4 text-[#d4af37]" /> +91 63937 07020</a>
        <p className="flex gap-3"><Instagram className="h-4 w-4 text-[#d4af37]" /> @matravastra</p>
      </div>
    </div>
    <div className="gold-line" />
    <p className="py-6 text-center text-[11px] tracking-[0.3em] uppercase text-[#faf6ee]/40">© 2025 Matra Vastra · Made in Kashi</p>
  </footer>
);
