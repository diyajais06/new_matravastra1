import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../lib/store";
import { getCollection, inr } from "../../lib/api";

export const ProductCard = ({ p, index = 0 }) => {
  const { addToCart, toggleWish, isWished } = useStore();
  const ref = useRef();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const col = getCollection(p.collection);
  const wished = isWished(p.slug);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const quickAdd = (e) => {
    e.preventDefault();
    addToCart(p, "L", p.colors[0].name);
    toast.success(`${p.name} added to bag`, { description: "Size L · tap bag to change" });
  };
  const wish = (e) => {
    e.preventDefault();
    toggleWish(p);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: (index % 3) * 0.12 }} style={{ perspective: 1000 }}>
      <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }} style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="group relative">
        <Link to={`/product/${p.slug}`} className="block" data-testid={`product-card-${p.slug}`}>
          <div className="relative aspect-[4/5] overflow-hidden border border-[#d4af37]/15 bg-[#121114]">
            <img src={p.image_front} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-105 group-hover:opacity-0" />
            <img src={p.image_back} alt={`${p.name} back`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 scale-105 transition-[opacity,transform] duration-700 group-hover:opacity-100 group-hover:scale-100" />
            <span className="absolute left-4 top-4 font-display text-[10px] tracking-[0.3em] px-3 py-1.5 bg-[#080708]/70 backdrop-blur-md" style={{ color: col?.accent }}>{col?.no} · {col?.name}</span>
            {p.is_new && <span className="absolute left-4 top-12 bg-[#58181a] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#f3e5ab]" data-testid={`new-badge-${p.slug}`}>New</span>}
            <button onClick={wish} className="absolute right-4 top-4 rounded-full bg-[#080708]/70 p-2.5 backdrop-blur-md hover:bg-[#d4af37]/20 transition-colors" data-testid={`wishlist-toggle-${p.slug}`} aria-label="Wishlist">
              <Heart className={`h-4 w-4 ${wished ? "fill-[#b23a3f] text-[#b23a3f]" : "text-[#f3e5ab]"}`} />
            </button>
            <button onClick={quickAdd} className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-center gap-2 bg-[#d4af37] py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-[opacity,transform] duration-500 lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100" data-testid={`quick-add-${p.slug}`}>
              <Plus className="h-4 w-4" /> Quick Add
            </button>
          </div>
          <div className="mt-5 flex items-start justify-between gap-4" style={{ transform: "translateZ(30px)" }}>
            <div>
              <h3 className="font-display text-base tracking-wider text-[#faf6ee]">{p.name}</h3>
              <p className="font-serif-it mt-1 text-[15px] text-[#faf6ee]/55">{p.tagline}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-[#d4af37]" data-testid={`product-price-${p.slug}`}>{inr(p.price)}</p>
              <p className="text-xs text-[#faf6ee]/35 line-through">{inr(p.mrp)}</p>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};
