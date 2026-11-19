import { Link } from "react-router-dom";
import { PageTransition, SectionHead } from "../components/site/Reveal";
import { Seo } from "../components/site/Seo";
import { useProducts } from "../lib/useProducts";
import { COLLECTIONS } from "../lib/api";
import { breadcrumb } from "../lib/seo";

const PAGES = [
  ["/", "Home"], ["/shop", "Shop All"], ["/shop?new=1", "New Drops"], ["/hampers", "Gift Hampers"], ["/about", "Our Story"],
  ["/bulk-orders", "Bulk & Custom Orders"], ["/contact", "Contact"], ["/faq", "FAQ"], ["/track-order", "Track Order"],
];

const Group = ({ title, links, testId }) => (
  <div data-testid={testId}>
    <h2 className="eyebrow mb-5">{title}</h2>
    <ul className="space-y-2">
      {links.map(([to, l]) => (
        <li key={to}><Link to={to} className="text-[#faf6ee]/75 hover:text-[#d4af37] transition-colors">{l}</Link></li>
      ))}
    </ul>
  </div>
);

export default function SitemapPage() {
  const { products } = useProducts();
  return (
    <PageTransition>
      <Seo title="Sitemap" description="Every page, collection and T-shirt on MATRA VASTRA, the premium Kashi clothing brand from Varanasi." path="/sitemap" jsonLd={[breadcrumb([["Home", "/"], ["Sitemap", "/sitemap"]])]} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHead as="h1" eyebrow="Find Your Way" title="SITEMAP" />
        <div className="glass mt-12 grid gap-12 p-8 sm:p-12 md:grid-cols-2 lg:grid-cols-4">
          <Group title="Pages" links={PAGES} testId="sitemap-pages" />
          <Group title="Collections" links={COLLECTIONS.map((c) => [`/collection/${c.slug}`, `${c.no} · ${c.full}`])} testId="sitemap-collections" />
          <div className="md:col-span-2" data-testid="sitemap-products">
            <h2 className="eyebrow mb-5">Products ({products.length})</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => (
                <li key={p.slug}><Link to={`/product/${p.slug}`} className="text-[#faf6ee]/75 hover:text-[#d4af37] transition-colors">{p.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#faf6ee]/45">For search engines: <a href="/sitemap.xml" className="text-[#d4af37]" data-testid="sitemap-xml-link">sitemap.xml</a> · <a href="/llms.txt" className="text-[#d4af37]" data-testid="llms-txt-link">llms.txt</a></p>
      </section>
    </PageTransition>
  );
}
