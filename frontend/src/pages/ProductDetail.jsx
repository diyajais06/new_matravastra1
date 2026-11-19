import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Heart, Truck, RotateCcw, Box } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "../components/site/Reveal";
import { Tee3D } from "../components/site/Tee3D";
import { ProductCard } from "../components/site/ProductCard";
import { api, getCollection, inr } from "../lib/api";
import { useStore } from "../lib/store";
import { useProducts } from "../lib/useProducts";
import { Seo } from "../components/site/Seo";
import { breadcrumb, productSchema } from "../lib/seo";

const VIEWS = [["3d", "3D View"], ["front", "Front"], ["back", "Back"]];

const Viewer = ({ p, view, flip }) => (
  <div className="relative aspect-square overflow-hidden border border-[#d4af37]/20 bg-[#0d0c0e]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_60%)]" />
    {view === "3d" ? (
      <Tee3D front={p.image_front} back={p.image_back} color={p.colors[0].hex} auto={false} flip={flip} className="absolute inset-0" testId="product-tee-3d" />
    ) : (
      <img src={view === "front" ? p.image_front : p.image_back} alt={`${p.name} ${view}`} className="h-full w-full object-cover" data-testid={`product-image-${view}`} />
    )}
  </div>
);

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addToCart, toggleWish, isWished } = useStore();
  const [p, setP] = useState(null);
  const [view, setView] = useState("front");
  const [flip, setFlip] = useState(false);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const { products: related } = useProducts(p ? { collection: p.collection } : { collection: "__none" });

  useEffect(() => {
    setP(null);
    api.get(`/products/${slug}`).then((r) => { setP(r.data); setColor(r.data.colors[0].name); setSize(""); });
  }, [slug]);

  if (!p) return <PageTransition><div className="mx-auto h-[70vh] max-w-7xl animate-pulse bg-[#121114]/50" /></PageTransition>;
  const col = getCollection(p.collection);

  const add = (buy) => {
    if (!size) return toast.error("Please select a size");
    addToCart(p, size, color);
    if (buy) return nav("/checkout");
    toast.success(`${p.name} added to bag`, { description: `Size ${size} · ${color}` });
  };

  return (
    <PageTransition>
      <Seo
        title={`${p.name} — ${col.full} Oversized T-Shirt`}
        description={`${p.name} by MATRA VASTRA: ${p.description} ${p.fabric}. Sizes ${p.sizes.join(", ")}. Price ${inr(p.price)}.`.slice(0, 300)}
        path={`/product/${p.slug}`}
        image={p.image_front}
        type="product"
        jsonLd={[productSchema(p), breadcrumb([["Home", "/"], [col.full, `/collection/${p.collection}`], [p.name, `/product/${p.slug}`]])]}
      />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 text-[11px] uppercase tracking-[0.25em] text-[#faf6ee]/45 sm:px-6 lg:px-8" data-testid="product-breadcrumb">
        <Link to="/" className="hover:text-[#d4af37]">Home</Link> <span className="mx-2">/</span>
        <Link to={`/collection/${p.collection}`} className="hover:text-[#d4af37]">{col.full}</Link> <span className="mx-2">/</span>
        <span className="text-[#faf6ee]/75">{p.name}</span>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-14 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Viewer p={p} view={view} flip={flip} />
          <div className="mt-4 flex flex-wrap gap-2">
            {VIEWS.map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} className={`flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] border transition-colors ${view === v ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]" : "border-[#d4af37]/20 text-[#faf6ee]/70 hover:border-[#d4af37]/60"}`} data-testid={`view-toggle-${v}`}>
                {v === "3d" && <Box className="h-3.5 w-3.5" />} {l}
              </button>
            ))}
            {view === "3d" && <button onClick={() => setFlip((f) => !f)} className="px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] border border-[#d4af37]/20 text-[#faf6ee]/70 hover:border-[#d4af37]" data-testid="flip-3d-btn">Flip {flip ? "to Front" : "to Back"}</button>}
          </div>
        </div>
        <div className="lg:pt-6">
          <Link to={`/collection/${p.collection}`} className="font-display text-xs tracking-[0.4em]" style={{ color: col.accent }} data-testid="product-collection-link">COLLECTION {col.no} · {col.name.toUpperCase()}</Link>
          <h1 className="gold-3d mt-5 text-4xl sm:text-5xl font-black leading-tight" data-testid="product-name">{p.name}</h1>
          <p className="font-serif-it mt-3 text-xl text-[#faf6ee]/70">{p.tagline}</p>
          <div className="mt-8 flex items-baseline gap-4">
            <span className="font-display text-3xl text-[#f3e5ab]" data-testid="product-detail-price">{inr(p.price)}</span>
            <span className="text-[#faf6ee]/35 line-through">{inr(p.mrp)}</span>
            <span className="text-xs uppercase tracking-widest text-[#d4af37]">Inclusive of taxes</span>
          </div>
          <div className="gold-line my-10" />
          <p className="eyebrow mb-4">Colour · <span className="text-[#faf6ee]/80 normal-case tracking-normal">{color}</span></p>
          <div className="flex gap-3">
            {p.colors.map((c) => (
              <button key={c.name} onClick={() => setColor(c.name)} className={`h-11 w-11 rounded-full border-2 transition-transform hover:scale-110 ${color === c.name ? "border-[#d4af37] scale-110" : "border-transparent"}`} style={{ background: c.hex }} data-testid={`color-swatch-${c.name.replace(/\s/g, "-").toLowerCase()}`} aria-label={c.name} />
            ))}
          </div>
          <p className="eyebrow mb-4 mt-10">Size</p>
          <div className="flex flex-wrap gap-3">
            {p.sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={`h-12 w-16 font-display text-sm border transition-colors ${size === s ? "bg-[#d4af37] text-black border-[#d4af37]" : "border-[#d4af37]/30 hover:border-[#d4af37]"}`} data-testid={`size-${s}`}>{s}</button>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <button onClick={() => add(false)} className="btn-ghost flex-1 min-w-[180px]" data-testid="add-to-cart-btn">Add to Bag</button>
            <button onClick={() => add(true)} className="btn-gold flex-1 min-w-[180px]" data-testid="buy-now-btn">Buy Now</button>
            <button onClick={() => { toggleWish(p); toast(isWished(p.slug) ? "Removed from wishlist" : "Saved to wishlist"); }} className="btn-ghost px-5" data-testid="product-wishlist-btn" aria-label="Wishlist">
              <Heart className={`h-4 w-4 ${isWished(p.slug) ? "fill-[#b23a3f] text-[#b23a3f]" : ""}`} />
            </button>
          </div>
          <p className="mt-10 leading-relaxed text-[#faf6ee]/75">{p.description}</p>
          <div className="mt-8 grid gap-4 text-sm text-[#faf6ee]/65 sm:grid-cols-3">
            <p className="glass p-4"><span className="block eyebrow mb-2">Fabric</span>{p.fabric}</p>
            <p className="glass p-4 flex flex-col"><Truck className="h-4 w-4 text-[#d4af37] mb-2" />Free shipping over ₹999</p>
            <p className="glass p-4 flex flex-col"><RotateCcw className="h-4 w-4 text-[#d4af37] mb-2" />7-day easy exchange</p>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="gold-3d text-3xl font-bold">FROM THE SAME WORLD</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.filter((r) => r.slug !== p.slug).slice(0, 3).map((r, i) => <ProductCard key={r.slug} p={r} index={i} />)}
        </div>
      </section>
    </PageTransition>
  );
}
