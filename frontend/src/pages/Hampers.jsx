import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, Reveal, SectionHead } from "../components/site/Reveal";
import { Seo } from "../components/site/Seo";
import { api, inr } from "../lib/api";
import { useStore } from "../lib/store";
import { abs, breadcrumb } from "../lib/seo";

const HamperCard = ({ h, i }) => {
  const { addToCart } = useStore();
  const nav = useNavigate();
  const [size, setSize] = useState("");
  const add = (buy) => {
    if (!size) return toast.error("Please select a T-shirt size");
    addToCart({ slug: h.slug, name: h.name, price: h.price, image_front: h.image, href: "/hampers" }, size, "Combo");
    if (buy) return nav("/checkout");
    toast.success(`${h.name} added to bag`, { description: `T-shirt size ${size}` });
  };
  return (
    <Reveal delay={0.05}>
      <article className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`} data-testid={`hamper-card-${h.slug}`}>
        <div className="group relative overflow-hidden border border-[#d4af37]/25">
          <img src={h.image} alt={`${h.name}: ${h.items.join(", ")}`} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          {h.badge && <span className="absolute left-5 top-5 bg-[#d4af37] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-black">{h.badge}</span>}
          <span className="absolute bottom-5 right-5 bg-[#58181a] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f3e5ab]">Save {inr(h.mrp - h.price)}</span>
        </div>
        <div>
          <p className="font-display text-xs tracking-[0.4em] text-[#d4af37]">HAMPER 0{i + 1}</p>
          <h2 className="gold-3d mt-4 text-3xl sm:text-4xl font-black leading-tight">{h.name}</h2>
          <p className="font-serif-it mt-3 text-xl text-[#faf6ee]/70">{h.tagline}</p>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-display text-3xl text-[#f3e5ab]" data-testid={`hamper-price-${h.slug}`}>{inr(h.price)}</span>
            <span className="text-[#faf6ee]/35 line-through">{inr(h.mrp)}</span>
          </div>
          <p className="mt-5 text-[#faf6ee]/70">{h.description}</p>
          <ul className="mt-6 space-y-2.5" data-testid={`hamper-items-${h.slug}`}>
            {h.items.map((it) => (
              <li key={it} className="flex items-start gap-3 text-sm text-[#faf6ee]/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />{it}</li>
            ))}
          </ul>
          <p className="eyebrow mb-3 mt-8">T-Shirt Size{h.tees > 1 ? " (both tees)" : ""}</p>
          <div className="flex flex-wrap gap-2">
            {h.sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={`h-11 w-14 font-display text-sm border transition-colors ${size === s ? "bg-[#d4af37] text-black border-[#d4af37]" : "border-[#d4af37]/30 hover:border-[#d4af37]"}`} data-testid={`hamper-size-${h.slug}-${s}`}>{s}</button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => add(false)} className="btn-ghost" data-testid={`hamper-add-${h.slug}`}>Add to Bag</button>
            <button onClick={() => add(true)} className="btn-gold" data-testid={`hamper-buy-${h.slug}`}><Gift className="h-4 w-4" /> Buy Now</button>
          </div>
        </div>
      </article>
    </Reveal>
  );
};

export default function Hampers() {
  const [hampers, setHampers] = useState([]);
  useEffect(() => {
    api.get("/hampers").then((r) => setHampers(r.data));
  }, []);
  const schema = hampers.map((h) => ({
    "@context": "https://schema.org", "@type": "Product", name: h.name, sku: h.slug, image: h.image, description: `${h.description} Includes: ${h.items.join(", ")}.`,
    brand: { "@type": "Brand", name: "MATRA VASTRA" },
    offers: { "@type": "Offer", url: abs("/hampers"), priceCurrency: "INR", price: h.price, availability: "https://schema.org/InStock" },
  }));
  return (
    <PageTransition>
      <Seo title="Gift Hampers & Combos — T-Shirt, Bottle, Copper Jug & Keychain"
        description="MATRA VASTRA gift hamper combos from Varanasi: T-shirts with steel bottles, copper jugs, mugs, keychains and Banarasi potli. 4 combos from ₹1,699 to ₹3,499."
        path="/hampers" jsonLd={[...schema, breadcrumb([["Home", "/"], ["Hampers", "/hampers"]])]} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHead as="h1" eyebrow="Hamper Combos" title="GIFT HAMPERS" sub="A T-shirt with the things you use every day, packed in premium gift boxes. Perfect for festivals, birthdays and farewells." />
        <div className="mt-20 space-y-28" data-testid="hamper-list">
          {hampers.map((h, i) => <HamperCard key={h.slug} h={h} i={i} />)}
        </div>
      </section>
    </PageTransition>
  );
}
