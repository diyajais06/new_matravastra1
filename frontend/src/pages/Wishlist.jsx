import { Link } from "react-router-dom";
import { PageTransition, SectionHead } from "../components/site/Reveal";
import { ProductCard } from "../components/site/ProductCard";
import { useStore } from "../lib/store";
import { Seo } from "../components/site/Seo";

export default function Wishlist() {
  const { wishlist } = useStore();
  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Seo title="Wishlist" description="Your saved MATRA VASTRA designs." path="/wishlist" noindex />
        <SectionHead as="h1" eyebrow="Saved Stories" title="WISHLIST" />
        {wishlist.length === 0 ? (
          <div className="glass mt-14 p-12" data-testid="wishlist-empty">
            <p className="font-serif-it text-2xl">Nothing saved yet.</p>
            <Link to="/shop" className="btn-gold mt-8" data-testid="wishlist-shop-btn">Explore Collection</Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" data-testid="wishlist-grid">
            {wishlist.map((p, i) => <ProductCard key={p.slug} p={{ ...p, tagline: "", mrp: p.price + 400, colors: [{ name: "Default", hex: "#111" }] }} index={i} />)}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
