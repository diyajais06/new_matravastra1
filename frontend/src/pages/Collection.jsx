import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "../components/site/Reveal";
import { ProductGrid } from "./Shop";
import { useProducts } from "../lib/useProducts";
import { COLLECTIONS, getCollection } from "../lib/api";
import { Seo } from "../components/site/Seo";
import { breadcrumb, itemList } from "../lib/seo";

const BANNERS = {
  kashi: "bg-[#0a0908] border-[#d4af37]/30",
  purvanchal: "bg-[#1c0e0b] border-[#9a5236]/40",
  aspirant: "bg-[#111116] border-[#faf6ee]/15",
};

export default function Collection() {
  const { slug } = useParams();
  const c = getCollection(slug);
  const { products, loading } = useProducts({ collection: slug });
  if (!c) return <PageTransition><p className="p-20 text-center">Collection not found.</p></PageTransition>;

  return (
    <PageTransition>
      <Seo
        title={`${c.full} Collection — ${c.tagline.replace(/\.$/, "")}`}
        description={`${c.full} T-shirts by MATRA VASTRA, Varanasi. ${c.story}`}
        path={`/collection/${slug}`}
        jsonLd={[
          { ...itemList(products, `${c.full} Collection`), "@type": "ItemList" },
          breadcrumb([["Home", "/"], ["Collections", "/shop"], [c.full, `/collection/${slug}`]]),
        ]}
      />
      <section className={`relative mx-auto max-w-7xl overflow-hidden border px-8 py-20 sm:px-14 lg:py-28 ${BANNERS[slug]}`} data-testid={`collection-banner-${slug}`}>
        <div className="motif-bg absolute inset-0 opacity-70" />
        <motion.span initial={{ opacity: 0, x: 80 }} animate={{ opacity: 0.1, x: 0 }} transition={{ duration: 1.5 }} className="font-deva pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 text-[160px] sm:text-[240px] leading-none" style={{ color: c.accent }}>{c.deva}</motion.span>
        <div className="relative max-w-2xl">
          <p className="font-display tracking-[0.45em] text-sm" style={{ color: c.accent }}>COLLECTION {c.no}</p>
          <h1 className={`${c.titleClass} mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95]`} data-testid="collection-title">{c.full}</h1>
          <p className="font-serif-it mt-6 text-2xl text-[#faf6ee]/85">{c.tagline}</p>
          <p className="mt-6 text-base leading-relaxed text-[#faf6ee]/65">{c.story}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <ProductGrid products={products} loading={loading} />
        <div className="mt-24 flex flex-wrap gap-4 border-t border-[#d4af37]/15 pt-10">
          <span className="eyebrow self-center mr-4">Other worlds</span>
          {COLLECTIONS.filter((x) => x.slug !== slug).map((x) => (
            <Link key={x.slug} to={`/collection/${x.slug}`} className="btn-ghost" data-testid={`other-collection-${x.slug}`}>{x.no} · {x.name}</Link>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
