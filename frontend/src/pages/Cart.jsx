import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageTransition, SectionHead } from "../components/site/Reveal";
import { useStore } from "../lib/store";
import { inr } from "../lib/api";
import { Seo } from "../components/site/Seo";

export const Summary = ({ subtotal, discount = 0, children }) => {
  const shipping = subtotal - discount >= 999 || subtotal === 0 ? 0 : 79;
  return (
    <div className="glass p-8" data-testid="order-summary">
      <p className="eyebrow mb-6">Order Summary</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-[#faf6ee]/60">Subtotal</span><span data-testid="summary-subtotal">{inr(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-[#d4af37]"><span>Discount (KASHI10)</span><span data-testid="summary-discount">− {inr(discount)}</span></div>}
        <div className="flex justify-between"><span className="text-[#faf6ee]/60">Shipping</span><span data-testid="summary-shipping">{shipping ? inr(shipping) : "Free"}</span></div>
      </div>
      <div className="gold-line my-6" />
      <div className="flex items-baseline justify-between">
        <span className="font-display tracking-widest">Total</span>
        <span className="font-display text-2xl text-[#f3e5ab]" data-testid="summary-total">{inr(subtotal - discount + shipping)}</span>
      </div>
      {children}
    </div>
  );
};

export default function Cart() {
  const { cart, subtotal, updateQty, removeItem, itemKey } = useStore();
  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Seo title="Shopping Bag" description="Your MATRA VASTRA shopping bag." path="/cart" noindex />
        <SectionHead as="h1" eyebrow="Your Bag" title="SHOPPING BAG" />
        {cart.length === 0 ? (
          <div className="mt-16 glass flex flex-col items-start gap-6 p-12" data-testid="cart-empty">
            <ShoppingBag className="h-10 w-10 text-[#d4af37]" />
            <p className="font-serif-it text-2xl">Your bag is waiting for its first story.</p>
            <Link to="/shop" className="btn-gold" data-testid="cart-shop-btn">Explore Collection</Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {cart.map((i) => {
                  const k = itemKey(i);
                  return (
                    <motion.div key={k} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="glass flex gap-6 p-5" data-testid={`cart-item-${i.slug}-${i.size}`}>
                      <img src={i.image} alt={i.name} className="h-28 w-24 object-cover" />
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between gap-4">
                          <div>
                            <Link to={i.href || `/product/${i.slug}`} className="font-display tracking-wider hover:text-[#d4af37]">{i.name}</Link>
                            <p className="mt-1 text-xs uppercase tracking-widest text-[#faf6ee]/50">Size {i.size} · {i.color}</p>
                          </div>
                          <button onClick={() => removeItem(k)} className="text-[#faf6ee]/50 hover:text-[#d4af37]" data-testid={`cart-remove-${i.slug}-${i.size}`} aria-label="Remove"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-[#d4af37]/30">
                            <button onClick={() => updateQty(k, i.qty - 1)} className="p-2.5 hover:bg-[#d4af37]/10" data-testid={`cart-dec-${i.slug}-${i.size}`}><Minus className="h-3 w-3" /></button>
                            <span className="w-10 text-center text-sm" data-testid={`cart-qty-${i.slug}-${i.size}`}>{i.qty}</span>
                            <button onClick={() => updateQty(k, i.qty + 1)} className="p-2.5 hover:bg-[#d4af37]/10" data-testid={`cart-inc-${i.slug}-${i.size}`}><Plus className="h-3 w-3" /></button>
                          </div>
                          <span className="font-display text-[#f3e5ab]">{inr(i.price * i.qty)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="lg:col-span-4">
              <Summary subtotal={subtotal}>
                <Link to="/checkout" className="btn-gold mt-8 w-full" data-testid="cart-checkout-btn">Proceed to Checkout</Link>
                <p className="mt-4 text-xs text-[#faf6ee]/45">Use code <span className="text-[#d4af37]">KASHI10</span> at checkout for 10% off.</p>
              </Summary>
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
