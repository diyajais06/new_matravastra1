import { useState } from "react";
import { GraduationCap, Flower2, PartyPopper, Briefcase, Shirt } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, Reveal, SectionHead } from "../components/site/Reveal";
import { api, waLink } from "../lib/api";
import { Seo } from "../components/site/Seo";
import { breadcrumb } from "../lib/seo";

const CATS = [
  [GraduationCap, "Colleges & Institutions"],
  [Flower2, "Ashrams & Spiritual Orgs"],
  [PartyPopper, "Events & Festivals"],
  [Briefcase, "Corporate Merchandise"],
  [Shirt, "Custom T-Shirt Printing"],
];
const EMPTY = { name: "", phone: "", organization: "", category: "Custom T-Shirt Printing", quantity: "", details: "" };

const Field = ({ label, children }) => (
  <label className="block">
    <span className="eyebrow text-[10px]">{label}</span>
    {children}
  </label>
);

export default function Bulk() {
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const waText = () =>
    `Namaste MatraVastra! Bulk enquiry:\nName: ${f.name}\nPhone: ${f.phone}\nOrganization: ${f.organization}\nCategory: ${f.category}\nQuantity: ${f.quantity}\nDetails: ${f.details}`;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/bulk-enquiries", { ...f, quantity: Number(f.quantity) });
      toast.success("Enquiry received!", { description: "Our team will reach you within 24 hours." });
      setF(EMPTY);
    } catch (err) {
      toast.error("Please check the details", { description: "Phone must be 10+ digits and quantity at least 10." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <Seo
            title="Bulk & Custom T-Shirt Printing in Varanasi"
            description="Custom bulk T-shirt printing by MATRA VASTRA, Varanasi, for colleges, institutions, ashrams, events, festivals and corporate merchandise. Minimum 10 pieces. Enquire on WhatsApp +91 6393707020."
            path="/bulk-orders"
            jsonLd={[
              { "@context": "https://schema.org", "@type": "Service", name: "Bulk & Custom T-Shirt Printing", serviceType: "Custom apparel printing", provider: { "@id": `${window.location.origin}/#organization` }, areaServed: "IN", audience: CATS.map(([, l]) => ({ "@type": "Audience", audienceType: l })) },
              breadcrumb([["Home", "/"], ["Bulk Orders", "/bulk-orders"]]),
            ]}
          />
          <SectionHead as="h1" eyebrow="Bulk & Custom Orders" title="WEAR IT TOGETHER." sub="Custom tees for your college, ashram, festival, team or brand — designed with Kashi craft, printed at scale." />
          <div className="mt-12 space-y-3">
            {CATS.map(([Icon, l], i) => (
              <Reveal key={l} delay={i * 0.08}>
                <button type="button" onClick={() => setF({ ...f, category: l })} className={`flex w-full items-center gap-5 border p-5 text-left transition-colors ${f.category === l ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#d4af37]/15 hover:border-[#d4af37]/50"}`} data-testid={`bulk-category-${i}`}>
                  <Icon className="h-5 w-5 text-[#d4af37]" />
                  <span className="font-display tracking-wider">{l}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.2} className="lg:col-span-7">
          <form onSubmit={submit} className="glass space-y-8 p-8 sm:p-12" data-testid="bulk-form">
            <div className="grid gap-8 sm:grid-cols-2">
              <Field label="Name"><input required className="mv-input" value={f.name} onChange={set("name")} placeholder="Your full name" data-testid="bulk-name-input" /></Field>
              <Field label="Phone Number"><input required type="tel" className="mv-input" value={f.phone} onChange={set("phone")} placeholder="10-digit mobile" data-testid="bulk-phone-input" /></Field>
              <Field label="Organization"><input required className="mv-input" value={f.organization} onChange={set("organization")} placeholder="College / ashram / company" data-testid="bulk-organization-input" /></Field>
              <Field label="Quantity"><input required type="number" min="10" className="mv-input" value={f.quantity} onChange={set("quantity")} placeholder="Min. 10 pieces" data-testid="bulk-quantity-input" /></Field>
            </div>
            <Field label="Customization Details"><textarea required rows={4} className="mv-input resize-none" value={f.details} onChange={set("details")} placeholder="Design idea, colours, sizes, deadline..." data-testid="bulk-details-input" /></Field>
            <p className="text-xs text-[#faf6ee]/50">Category: <span className="text-[#d4af37]" data-testid="bulk-selected-category">{f.category}</span></p>
            <div className="flex flex-wrap gap-4">
              <button type="submit" disabled={busy} className="btn-gold" data-testid="bulk-submit-btn">{busy ? "Sending..." : "Send Enquiry"}</button>
              <a href={waLink(waText())} target="_blank" rel="noreferrer" className="btn-ghost border-[#1f8f4e] text-[#7be3a6]" data-testid="bulk-whatsapp-btn">WhatsApp Enquiry</a>
            </div>
          </form>
        </Reveal>
      </section>
    </PageTransition>
  );
}
