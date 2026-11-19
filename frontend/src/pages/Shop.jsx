import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition, SectionHead } from "../components/site/Reveal";
import { ProductCard } from "../components/site/ProductCard";
import { useProducts } from "../lib/useProducts";
import { COLLECTIONS } from "../lib/api";
import { Seo } from "../components/site/Seo";
import { breadcrumb, itemList } from "../lib/seo";

const SORTS = [["featured", "Featured"], ["low", "Price: Low to High"], ["high", "Price: High to Low"]];

export const ProductGrid = ({ products, loading }) =>
  loading ? (
    <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-[#121114]" />)}</div>
  ) : (
    <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" data-testid="product-grid">
      {products.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
    </div>
  );

export default function Shop() {
  const { products, loading } = useProducts();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get("new") ? "new" : "all");
  const [sort, setSort] = useState("featured");
  const list = useMemo(() => {
    const l = products.filter((p) => filter === "all" || (filter === "new" ? p.is_new : p.collection === filter));
    if (sort === "low") return [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...l].sort((a, b) => b.price - a.price);
    return [...l].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [products, filter, sort]);

  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Seo
          title="Shop All Oversized T-Shirts"
          description="Shop all MATRA VASTRA oversized T-shirts: Kashi spiritual, Apna Purvanchal and Aspirant Life designs. 240 GSM cotton, sizes S–XXL, ₹999–₹1,399, free shipping over ₹999."
          path="/shop"
          jsonLd={[itemList(list, "MATRA VASTRA T-Shirts"), breadcrumb([["Home", "/"], ["Shop", "/shop"]])]}
        />
        <SectionHead as="h1" eyebrow="The Complete Wardrobe" title="SHOP ALL" sub="Every piece, every story. Heavyweight oversized tees printed in Kashi." />
        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-y border-[#d4af37]/15 py-5">
          <div className="flex flex-wrap gap-2">
            {[{ slug: "all", name: "All" }, { slug: "new", name: "New Drops" }, ...COLLECTIONS].map((c) => (
              <button key={c.slug} onClick={() => setFilter(c.slug)} className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] border transition-colors ${filter === c.slug ? "bg-[#d4af37] text-black border-[#d4af37]" : "border-[#d4af37]/25 text-[#faf6ee]/75 hover:border-[#d4af37]"}`} data-testid={`shop-filter-${c.slug}`}>
                {c.name}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-[#121114] border border-[#d4af37]/25 px-4 py-2.5 text-xs uppercase tracking-widest text-[#faf6ee] outline-none" data-testid="shop-sort-select">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#faf6ee]/45" data-testid="shop-count">{list.length} pieces</p>
        <ProductGrid products={list} loading={loading} />
      </section>
    </PageTransition>
  );
}
