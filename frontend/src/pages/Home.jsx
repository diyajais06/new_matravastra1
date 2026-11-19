import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTransition, Reveal, SectionHead } from "../components/site/Reveal";
import { ProductCard } from "../components/site/ProductCard";
import { ModelShowcase } from "../components/site/ModelShowcase";
import { useProducts } from "../lib/useProducts";
import { COLLECTIONS, STORY_IMG } from "../lib/api";
import { AnimatedLogo } from "../components/site/AnimatedLogo";
import { useIntroDone } from "../lib/intro";
import { Seo } from "../components/site/Seo";
import { organization, website, faqSchema } from "../lib/seo";
import { FAQS } from "../lib/faq";
import { FaqList } from "./Faq";

const HEADLINE = ["JAHAN", "SE", "HUM", "AATE", "HAIN."];

const Hero = () => (
  <section className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8" data-testid="hero-section">
    <div className="lg:col-span-7 relative z-10">
      <motion.div initial={{ opacity: 0, scale: 0.85, rotateY: -25 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="mb-10 float-y">
        <AnimatedLogo className="h-36 sm:h-44" ring testId="hero-logo" />
      </motion.div>
      <p className="eyebrow mb-6">Est. in Kashi · Varanasi</p>
      <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-wide" data-testid="hero-headline">
        {HEADLINE.map((w, i) => (
          <motion.span key={w} className="gold-3d gold-shimmer inline-block mr-[0.25em]" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
        ))}
      </h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="font-serif-it mt-8 max-w-xl text-xl sm:text-2xl text-[#faf6ee]/85 leading-snug" data-testid="hero-subheading">
        Not Just Clothing. A Legacy of Culture, Identity &amp; Kashi.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.45 }} className="mt-12 flex flex-wrap gap-5">
        <Link to="/shop" className="btn-gold" data-testid="explore-collection-btn">Explore Collection <ArrowRight className="h-4 w-4" /></Link>
        <Link to="/about" className="btn-ghost" data-testid="discover-story-btn">Discover Our Story</Link>
      </motion.div>
    </div>
    <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1.2 }} className="lg:col-span-5 relative h-[560px] sm:h-[620px]">
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.25),transparent_65%)] blur-2xl" />
      <ModelShowcase />
    </motion.div>
  </section>
);

const Marquee = () => {
  const t = "WEAR YOUR ROOTS ✦ REPRESENT YOUR CULTURE ✦ FROM THE SOUL OF KASHI ✦ BANARASI HERITAGE ✦ HAR HAR MAHADEV ✦ ";
  return (
    <div className="relative my-24 overflow-hidden border-y border-[#d4af37]/25 bg-[#080708]/70 py-6 backdrop-blur-md" data-testid="marquee">
      <div className="marquee-track flex w-max whitespace-nowrap font-display text-xl sm:text-2xl tracking-[0.2em] text-[#d4af37]">
        <span>{t.repeat(3)}</span><span>{t.repeat(3)}</span>
      </div>
    </div>
  );
};

const CollectionCard = ({ c, i }) => (
  <Reveal delay={i * 0.15} className={i === 1 ? "lg:mt-20" : i === 2 ? "lg:mt-40" : ""}>
    <Link to={`/collection/${c.slug}`} className={`group relative block overflow-hidden border ${c.card} p-10 min-h-[440px] transition-transform duration-700 hover:-translate-y-3`} data-testid={`collection-card-${c.slug}`}>
      <div className="motif-bg absolute inset-0 opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
      <span className="font-deva absolute -right-4 top-6 text-[120px] leading-none opacity-[0.07] transition-transform duration-1000 group-hover:-translate-x-6" style={{ color: c.accent }}>{c.deva}</span>
      <div className="relative flex h-full min-h-[360px] flex-col justify-between">
        <p className="font-display text-sm tracking-[0.4em]" style={{ color: c.accent }}>COLLECTION {c.no}</p>
        <div>
          <h3 className={`${c.titleClass} text-4xl lg:text-5xl font-black leading-none`}>{c.name}</h3>
          <p className="font-serif-it mt-5 text-lg text-[#faf6ee]/70">{c.tagline}</p>
          <span className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[#faf6ee]/80 group-hover:text-[#d4af37] transition-colors">Enter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" /></span>
        </div>
      </div>
    </Link>
  </Reveal>
);

const Story = () => (
  <section className="relative mx-auto mt-40 grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8" data-testid="brand-story-section">
    <Reveal className="relative">
      <div className="relative aspect-[4/3] overflow-hidden border border-[#d4af37]/25">
        <motion.img src={STORY_IMG} alt="Ganga aarti at Varanasi ghats" className="h-full w-full object-cover" initial={{ scale: 1.2 }} whileInView={{ scale: 1 }} transition={{ duration: 2.4 }} viewport={{ once: true }} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080708] via-transparent to-transparent" />
      </div>
      <span className="font-deva absolute -bottom-10 -left-4 text-8xl text-[#d4af37]/20">काशी</span>
    </Reveal>
    <div>
      <SectionHead eyebrow="The Brand Story" title="FROM THE SOUL OF KASHI." />
      <Reveal delay={0.2}>
        <p className="mt-8 text-lg leading-relaxed text-[#faf6ee]/80">MatraVastra brings together the timeless soul of Kashi and the language of modern fashion. Every design carries a feeling, an identity and a story.</p>
        <Link to="/about" className="btn-ghost mt-10" data-testid="story-read-more-btn">Read the Story</Link>
      </Reveal>
    </div>
  </section>
);

const REVIEWS = [
  ["Aditya S.", "Lanka, Varanasi", "The fabric is heavy and the gold print feels premium. Wore the Mahadev tee to Dev Deepawali — people kept asking."],
  ["Priya M.", "Gorakhpur", "Finally a brand that makes Purvanchal look cool. The terracotta tee is my favourite."],
  ["Rohit K.", "Prayagraj", "Silent Grind is my study-room uniform now. Fits oversized exactly as shown."],
];

const NewDrops = ({ items }) => {
  const rail = useRef();
  const scroll = (dir) => rail.current.scrollBy({ left: dir * 380, behavior: "smooth" });
  return (
  <section className="mt-40" data-testid="new-drops-section">
    <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
      <SectionHead eyebrow="Just Woven" title="NEW DROPS" sub="Fresh off the loom — nine new stories across Kashi, Purvanchal and the aspirant life." />
      <div className="flex items-center gap-3">
        {[[-1, ChevronLeft, "prev"], [1, ChevronRight, "next"]].map(([d, Icon, n]) => (
          <button key={n} onClick={() => scroll(d)} className="hidden sm:flex h-12 w-12 items-center justify-center border border-[#d4af37]/40 text-[#f3e5ab] hover:bg-[#d4af37]/15 transition-colors" data-testid={`new-drops-${n}-btn`} aria-label={n}><Icon className="h-5 w-5" /></button>
        ))}
        <Link to="/shop?new=1" className="btn-ghost" data-testid="new-drops-view-all-btn">Shop New</Link>
      </div>
    </div>
    <div ref={rail} className="mx-auto mt-14 flex max-w-7xl snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-8 gap-8 overflow-x-auto px-4 pb-6 sm:px-6 lg:px-8 [scrollbar-width:thin]" data-testid="new-drops-rail">
      {items.map((p, i) => (
        <div key={p.slug} className="w-[78vw] shrink-0 snap-start sm:w-[340px]"><ProductCard p={p} index={i} /></div>
      ))}
    </div>
  </section>
  );
};

const CRAFT = [
  ["240 GSM", "Heavyweight combed cotton"],
  ["Kashi", "Designed & printed in Varanasi"],
  ["18+", "Original culture-rooted designs"],
  ["S–XXL", "Oversized fits for everyone"],
];

const CraftStrip = () => (
  <section className="mx-auto mt-32 grid max-w-7xl grid-cols-2 gap-px border border-[#d4af37]/20 bg-[#d4af37]/20 lg:grid-cols-4" data-testid="craft-strip">
    {CRAFT.map(([v, l], i) => (
      <Reveal key={v} delay={i * 0.1} className="bg-[#080708]/90 p-8 sm:p-10 backdrop-blur-md">
        <p className="gold-3d text-3xl sm:text-4xl font-black">{v}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#faf6ee]/60">{l}</p>
      </Reveal>
    ))}
  </section>
);

export default function Home() {
  const { products } = useProducts({ featured: true });
  const { products: fresh } = useProducts({ is_new: true });
  const introDone = useIntroDone();
  return (
    <PageTransition>
      <Seo
        description="MATRA VASTRA is a premium clothing brand from Varanasi (Kashi). Shop culture-rooted oversized T-shirts: Kashi Spiritual, Apna Purvanchal and Aspirant Life. 240 GSM cotton, ₹999–₹1,399, free shipping over ₹999."
        path="/"
        jsonLd={[organization(), website(), faqSchema(FAQS.slice(0, 5))]}
      />
      <Hero key={introDone ? "ready" : "intro"} />
      <Marquee />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="collections-section">
        <SectionHead eyebrow="Three Signature Worlds" title="THE COLLECTIONS" sub="Three stories, three moods — one soul. Choose the one you come from." />
        <div className="mt-16 grid gap-8 lg:grid-cols-3">{COLLECTIONS.map((c, i) => <CollectionCard key={c.slug} c={c} i={i} />)}</div>
      </section>
      <NewDrops items={fresh} />
      <CraftStrip />
      <section className="mx-auto mt-32 max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="home-hamper-banner">
        <Reveal>
          <Link to="/hampers" className="group relative grid items-center gap-10 overflow-hidden border border-[#d4af37]/30 bg-[#140b0c] p-10 sm:p-14 lg:grid-cols-2">
            <div className="motif-bg absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="eyebrow mb-5">Gift Hampers · From ₹1,699</p>
              <h2 className="gold-3d text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">GIFT A PIECE OF KASHI.</h2>
              <p className="font-serif-it mt-5 text-xl text-[#faf6ee]/75">T-shirts with bottles, copper jugs, mugs and keychains, packed in premium gift boxes.</p>
              <span className="btn-gold mt-8">Explore Hampers <ArrowRight className="h-4 w-4" /></span>
            </div>
            <img src="https://static.prod-images.emergentagent.com/jobs/678a8bfa-0a7f-4579-b665-a2c1d7027eda/images/53cb738246a681e6f1f20bb496e60a516141c170996c07d242ace4a8df64894e.jpeg" alt="Ganga Aarti gift hamper with T-shirt, copper jug and keychain" loading="lazy" className="relative aspect-square w-full max-w-md justify-self-center object-cover transition-transform duration-700 group-hover:scale-105" />
          </Link>
        </Reveal>
      </section>
      <section className="mx-auto mt-40 max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="featured-section">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="Most Loved" title="WORN WITH PRIDE" />
          <Link to="/shop" className="btn-ghost" data-testid="view-all-btn">View All</Link>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">{products.slice(0, 6).map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}</div>
      </section>
      <Story />
      <section className="mx-auto mt-40 max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="reviews-section">
        <SectionHead eyebrow="Voices of the Clan" title="WORN ACROSS PURVANCHAL" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {REVIEWS.map(([n, l, t], i) => (
            <Reveal key={n} delay={i * 0.12} className="glass p-8">
              <div className="flex gap-1 text-[#d4af37]">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
              <p className="font-serif-it mt-6 text-xl leading-snug text-[#faf6ee]/85">"{t}"</p>
              <p className="mt-6 font-display text-sm tracking-wider text-[#d4af37]">{n}</p>
              <p className="text-xs text-[#faf6ee]/45">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-40 max-w-4xl px-4 sm:px-6" data-testid="home-faq-section">
        <SectionHead eyebrow="Good to Know" title="QUESTIONS, ANSWERED" />
        <div className="mt-12"><FaqList items={FAQS.slice(0, 5)} /></div>
        <Link to="/faq" className="btn-ghost mt-10" data-testid="home-faq-all-btn">All FAQs</Link>
      </section>
    </PageTransition>
  );
}
