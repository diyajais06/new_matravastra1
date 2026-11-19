import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, Reveal, SectionHead } from "../components/site/Reveal";
import { api, waLink } from "../lib/api";
import { Seo } from "../components/site/Seo";
import { breadcrumb } from "../lib/seo";

const EMPTY = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", f);
      toast.success("Message sent", { description: "Dhanyavaad! We'll reply soon." });
      setF(EMPTY);
    } catch {
      toast.error("Could not send message. Please check your details.");
    } finally {
      setBusy(false);
    }
  };

  const info = [
    [MapPin, "Studio", "Varanasi, Uttar Pradesh, India"],
    [Phone, "WhatsApp", "+91 63937 07020"],
    [Mail, "Email", "hello@matravastra.com"],
    [Clock, "Hours", "Mon – Sat · 10am – 8pm"],
  ];

  return (
    <PageTransition>
      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Seo
            title="Contact Us — WhatsApp, Email & Studio in Varanasi"
            description="Contact MATRA VASTRA in Varanasi: WhatsApp +91 6393707020, email hello@matravastra.com. Open Monday to Saturday, 10am–8pm IST."
            path="/contact"
            jsonLd={[{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact MATRA VASTRA", mainEntity: { "@id": `${window.location.origin}/#organization` } }, breadcrumb([["Home", "/"], ["Contact", "/contact"]])]}
          />
          <SectionHead as="h1" eyebrow="Contact Us" title="SAY NAMASTE." sub="Questions on sizes, orders or collaborations — we're a message away." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {info.map(([Icon, l, v], i) => (
              <Reveal key={l} delay={i * 0.08} className="glass p-6">
                <Icon className="h-5 w-5 text-[#d4af37]" />
                <p className="eyebrow mt-4 text-[10px]">{l}</p>
                <p className="mt-1 text-[#faf6ee]/85">{v}</p>
              </Reveal>
            ))}
          </div>
          <a href={waLink("Namaste MatraVastra!")} target="_blank" rel="noreferrer" className="btn-gold mt-10" data-testid="contact-whatsapp-btn">Chat on WhatsApp</a>
        </div>
        <Reveal delay={0.2}>
          <form onSubmit={submit} className="glass space-y-8 p-8 sm:p-12" data-testid="contact-form">
            <input required className="mv-input" placeholder="Name" value={f.name} onChange={set("name")} data-testid="contact-name-input" />
            <input required type="email" className="mv-input" placeholder="Email" value={f.email} onChange={set("email")} data-testid="contact-email-input" />
            <input className="mv-input" placeholder="Phone (optional)" value={f.phone} onChange={set("phone")} data-testid="contact-phone-input" />
            <textarea required rows={5} className="mv-input resize-none" placeholder="Your message" value={f.message} onChange={set("message")} data-testid="contact-message-input" />
            <button disabled={busy} className="btn-gold" data-testid="contact-submit-btn">{busy ? "Sending..." : "Send Message"}</button>
          </form>
        </Reveal>
      </section>
    </PageTransition>
  );
}
