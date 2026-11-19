import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageTransition, Reveal, SectionHead } from "../components/site/Reveal";
import { Seo } from "../components/site/Seo";
import { breadcrumb, faqSchema } from "../lib/seo";
import { FAQS } from "../lib/faq";

export const FaqList = ({ items = FAQS }) => {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-[#d4af37]/20 border-y border-[#d4af37]/20" data-testid="faq-list">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={isOpen}
              data-testid={`faq-item-${i}`}
            >
              <span className="font-display text-lg text-[#f3e5ab]">{q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-[#d4af37] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <p className="pb-6 leading-relaxed text-[#faf6ee]/70">{a}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default function Faq() {
  return (
    <PageTransition>
      <Seo
        title="FAQ"
        description="Answers about MATRA VASTRA T-shirts: fabric, fit, pricing, shipping, payments, returns, bulk orders and contact."
        path="/faq"
        jsonLd={[faqSchema(FAQS), breadcrumb([["Home", "/"], ["FAQ", "/faq"]])]}
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6" data-testid="faq-page">
        <SectionHead as="h1" eyebrow="Good to Know" title="QUESTIONS, ANSWERED" />
        <Reveal className="mt-12">
          <FaqList />
        </Reveal>
      </section>
    </PageTransition>
  );
}
