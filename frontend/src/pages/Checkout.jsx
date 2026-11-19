import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, SectionHead } from "../components/site/Reveal";
import { Summary } from "./Cart";
import { useStore } from "../lib/store";
import { api, inr } from "../lib/api";
import { Seo } from "../components/site/Seo";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";

const FIELDS = [
  ["name", "Full Name", "text"], ["phone", "Phone Number", "tel"], ["email", "Email", "email"],
  ["address", "Address", "text"], ["city", "City", "text"], ["state", "State", "text"], ["pincode", "Pincode", "text"],
];
const EMPTY = Object.fromEntries(FIELDS.map(([k]) => [k, ""]));

const loadRzp = () =>
  new Promise((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });

const DemoPay = ({ order, onPay, onClose, busy }) => (
  <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="bg-[#0d0c0e] border-[#d4af37]/40 text-[#faf6ee]" data-testid="demo-payment-dialog">
      <DialogTitle className="gold-3d text-2xl font-bold">Razorpay · Demo</DialogTitle>
      <DialogDescription className="text-[#faf6ee]/65">Live Razorpay keys are not configured yet. This simulated payment confirms your order without charging.</DialogDescription>
      <div className="my-4 border border-[#d4af37]/25 p-5">
        <p className="text-xs uppercase tracking-widest text-[#faf6ee]/50">Order {order?.order_number}</p>
        <p className="font-display mt-2 text-3xl text-[#f3e5ab]">{order && inr(order.total)}</p>
      </div>
      <button onClick={onPay} disabled={busy} className="btn-gold w-full" data-testid="demo-pay-confirm-btn"><Lock className="h-4 w-4" /> {busy ? "Processing..." : "Pay Now (Demo)"}</button>
    </DialogContent>
  </Dialog>
);

const Success = ({ done }) => (
  <PageTransition>
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6" data-testid="order-success">
      <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 120 }}>
        <CheckCircle2 className="h-20 w-20 text-[#d4af37]" />
      </motion.div>
      <h1 className="gold-3d mt-8 text-4xl sm:text-5xl font-black">ORDER CONFIRMED.</h1>
      <p className="font-serif-it mt-4 text-2xl text-[#faf6ee]/80">Har Har Mahadev — your story is being printed in Kashi.</p>
      <div className="glass mt-10 p-8">
        <p className="eyebrow">Order ID</p>
        <p className="font-display mt-2 text-3xl tracking-widest text-[#f3e5ab]" data-testid="success-order-number">{done.order_number}</p>
        <p className="mt-4 text-sm text-[#faf6ee]/60">Use this ID with your phone number ({done.phone}) to track your order.</p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link to={`/track-order?id=${done.order_number}&phone=${done.phone}`} className="btn-gold" data-testid="success-track-btn">Track Order</Link>
        <Link to="/shop" className="btn-ghost" data-testid="success-shop-btn">Continue Shopping</Link>
      </div>
    </section>
  </PageTransition>
);

export default function Checkout() {
  const { cart, subtotal, clearCart } = useStore();
  const [f, setF] = useState(EMPTY);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [demoOrder, setDemoOrder] = useState(null);
  const [done, setDone] = useState(null);

  if (done) return <Success done={done} />;
  if (cart.length === 0) return <Navigate to="/cart" replace />;

  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const finish = (order_number) => { clearCart(); setDone({ order_number, phone: f.phone }); toast.success("Order placed!"); };

  const verify = async (order_number, body) => {
    await api.post(`/orders/${order_number}/verify`, body);
    finish(order_number);
  };

  const place = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/orders", {
        items: cart.map(({ slug, size, color, qty }) => ({ slug, size, color, qty })),
        customer: f,
        coupon: applied ? "KASHI10" : null,
      });
      if (data.payment_mode === "demo") return setDemoOrder(data);
      if (!(await loadRzp())) throw new Error("Razorpay failed to load");
      new window.Razorpay({
        key: data.key_id, amount: data.amount_paise, currency: "INR", order_id: data.razorpay_order_id,
        name: "MATRA VASTRA", description: `Order ${data.order_number}`,
        prefill: { name: f.name, email: f.email, contact: f.phone }, theme: { color: "#D4AF37" },
        handler: (r) => verify(data.order_number, r).catch(() => toast.error("Payment verification failed")),
      }).open();
    } catch (err) {
      toast.error("Could not place order", { description: err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Please check your details (6-digit pincode, 10-digit phone)." });
    } finally {
      setBusy(false);
    }
  };

  const payDemo = async () => {
    setBusy(true);
    try { await verify(demoOrder.order_number, { demo: true }); setDemoOrder(null); }
    catch { toast.error("Payment failed. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Seo title="Secure Checkout" description="Secure Razorpay checkout for MATRA VASTRA orders." path="/checkout" noindex />
        <SectionHead as="h1" eyebrow="Secure Checkout" title="CHECKOUT" />
        <form onSubmit={place} className="mt-14 grid gap-12 lg:grid-cols-12" data-testid="checkout-form">
          <div className="glass grid gap-8 p-8 sm:grid-cols-2 sm:p-12 lg:col-span-8">
            {FIELDS.map(([k, l, t]) => (
              <label key={k} className={k === "address" ? "sm:col-span-2" : ""}>
                <span className="eyebrow text-[10px]">{l}</span>
                <input required type={t} className="mv-input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`checkout-${k}-input`} />
              </label>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="glass max-h-64 space-y-4 overflow-auto p-6">
              {cart.map((i) => (
                <div key={`${i.slug}${i.size}`} className="flex items-center gap-4 text-sm">
                  <img src={i.image} alt="" className="h-14 w-12 object-cover" />
                  <span className="flex-1">{i.name} <span className="text-[#faf6ee]/45">· {i.size} × {i.qty}</span></span>
                  <span>{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="glass flex gap-3 p-4">
              <input className="mv-input" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} data-testid="coupon-input" />
              <button type="button" onClick={() => { const ok = coupon.trim().toUpperCase() === "KASHI10"; setApplied(ok); ok ? toast.success("KASHI10 applied — 10% off") : toast.error("Invalid coupon"); }} className="btn-ghost px-5 py-3" data-testid="coupon-apply-btn">Apply</button>
            </div>
            <Summary subtotal={subtotal} discount={discount}>
              <button type="submit" disabled={busy} className="btn-gold mt-8 w-full" data-testid="place-order-btn"><ShieldCheck className="h-4 w-4" /> {busy ? "Please wait..." : "Pay with Razorpay"}</button>
              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-[#faf6ee]/40">UPI · Cards · Netbanking · Wallets</p>
            </Summary>
          </div>
        </form>
      </section>
      <DemoPay order={demoOrder} onPay={payDemo} onClose={() => setDemoOrder(null)} busy={busy} />
    </PageTransition>
  );
}
