import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MODELS } from "../../lib/api";

const slot = (offset) => {
  if (offset === 0) return { x: "0%", scale: 1, rotateY: 0, opacity: 1, zIndex: 30, filter: "brightness(1)" };
  if (offset === 1) return { x: "48%", scale: 0.78, rotateY: -28, opacity: 0.7, zIndex: 20, filter: "brightness(0.55)" };
  if (offset === -1) return { x: "-48%", scale: 0.78, rotateY: 28, opacity: 0.7, zIndex: 20, filter: "brightness(0.55)" };
  return { x: "0%", scale: 0.6, rotateY: 0, opacity: 0.25, zIndex: 10, filter: "brightness(0.35)" };
};

export const ModelShowcase = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = MODELS.length;
  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 3800);
    return () => clearInterval(t);
  }, [paused, n]);
  const current = MODELS[active];

  return (
    <div className="relative h-full w-full" style={{ perspective: 1400 }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} data-testid="hero-model-showcase">
      <div className="absolute inset-x-0 top-0 bottom-24">
        {MODELS.map((m, i) => {
          let off = (i - active + n) % n;
          if (off > n / 2) off -= n;
          return (
            <motion.button key={m.slug} type="button" onClick={() => setActive(i)} animate={slot(off)} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-0 h-full -ml-[min(31%,170px)] w-[min(62%,340px)] overflow-hidden rounded-sm border border-[#d4af37]/40 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
              style={{ transformStyle: "preserve-3d" }} data-testid={`hero-model-${i}`} aria-label={m.name}>
              <motion.img src={m.image} alt={`Model wearing ${m.name}`} className="h-full w-full object-cover object-top" draggable="false"
                animate={off === 0 ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
              <span className="absolute inset-0 bg-gradient-to-t from-[#080708]/80 via-transparent to-transparent" />
            </motion.button>
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div key={current.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
            <p className="font-display text-sm tracking-[0.2em] text-[#f3e5ab]" data-testid="hero-model-name">{current.name}</p>
            <Link to={`/product/${current.slug}`} className="mt-1 inline-block text-[10px] uppercase tracking-[0.35em] text-[#d4af37] hover:underline underline-offset-4" data-testid="hero-shop-look-btn">Shop this look →</Link>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2">
          {MODELS.map((m, i) => (
            <button key={m.slug} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ${i === active ? "w-8 bg-[#d4af37]" : "w-3 bg-[#faf6ee]/30"}`} data-testid={`hero-model-dot-${i}`} aria-label={`Show ${m.name}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
