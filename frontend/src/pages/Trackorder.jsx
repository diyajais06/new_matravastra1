import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Printer, Truck, Home as HomeIcon, Check } from "lucide-react";
import { PageTransition, SectionHead } from "../components/site/Reveal";
import { api, inr } from "../lib/api";
import { Seo } from "../components/site/Seo";

const STEPS = [
  [Package, "Order Placed", "confirmed"],
  [Printer, "Printing in Kashi", "printing"],
  [Truck, "Shipped", "shipped"],
  [HomeIcon, "Delivered", "delivered"],
];

const Progress = ({ status }) => {
  const idx = status === "pending_payment" ? -1 : Math.max(0, STEPS.findIndex((s) => s[2] === status));
  return (
    <div className="relative mt-10 grid grid-cols-4 gap-2" data-testid="track-progress">
      <div className="absolute left-[12%] right-[12%] top-6 h-px bg-[#d4af37]/20" />
      <motion.div className="absolute left-[12%] top-6 h-px bg-[#d4af37]" initial={{ width: 0 }} animate={{ width: `${(Math.max(idx, 0) / 3) * 76}%` }} transition={{ duration: 1.2 }} />
      {STEPS.map(([Icon, l], i) => (
        <div key={l} className="relative flex flex-col items-center text-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${i <= idx ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-[#d4af37]/30 bg-[#0d0c0e] text-[#faf6ee]/40"}`}>
            {i < idx ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
          <p className={`mt-3 text-[10px] sm:text-xs uppercase tracking-widest ${i <= idx ? "text-[#d4af37]" : "text-[#faf6ee]/40"}`}>{l}</p>
        </div>
      ))}
    </div>
  );
};

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  const lookup = async (e) => {
    e?.preventDefault();
    setErr("");
    setOrder(null);
    try {
      const { data } = await api.get("/orders/track", { params: { order_number: id, phone } });
      setOrder(data);
    } catch {
      setErr("No order found. Please check your Order ID and phone number.");
    }
  };
  useEffect(() => { if (params.get("id") && params.get("phone")) lookup(); }, []); // eslint-disable-line

  return (
    <PageTransition>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Seo title="Track Your Order" description="Track your MATRA VASTRA order with your Order ID and phone number. See live status from order placed to printing in Kashi, shipped and delivered." path="/track-order" />
        <SectionHead as="h1" eyebrow="Order Tracking" title="TRACK YOUR ORDER" sub="Enter the Order ID from your confirmation and the phone number used at checkout." />
        <form onSubmit={lookup} className="glass mt-12 grid gap-6 p-8 sm:grid-cols-[1fr_1fr_auto] sm:items-end" data-testid="track-form">
          <input required className="mv-input" placeholder="Order ID (e.g. MV12345678)" value={id} onChange={(e) => setId(e.target.value)} data-testid="track-order-id-input" />
          <input required className="mv-input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="track-phone-input" />
          <button className="btn-gold" data-testid="track-submit-btn">Track</button>
        </form>
        {err && <p className="mt-6 text-sm text-[#e57373]" data-testid="track-error">{err}</p>}
        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass mt-10 p-8" data-testid="track-result">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="font-display text-2xl tracking-widest text-[#f3e5ab]">{order.order_number}</p>
              <p className="text-xs uppercase tracking-widest text-[#d4af37]" data-testid="track-status">{order.status.replace("_", " ")}</p>
            </div>
            <p className="mt-2 text-sm text-[#faf6ee]/55">Placed {new Date(order.created_at).toLocaleString("en-IN")} · Shipping to {order.city} · {inr(order.total)}</p>
            <Progress status={order.status} />
            <div className="mt-10 space-y-3">
              {order.items.map((i) => (
                <div key={`${i.slug}${i.size}`} className="flex items-center gap-4 text-sm">
                  <img src={i.image} alt="" className="h-14 w-12 object-cover" />
                  <span className="flex-1">{i.name} · {i.size} × {i.qty}</span>
                  <span>{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </PageTransition>
  );
}
