import { Link } from "react-router-dom";
import { PageTransition, Reveal, SectionHead } from "../components/site/Reveal";
import { LOGO, STORY_IMG } from "../lib/api";
import { Seo } from "../components/site/Seo";
import { breadcrumb } from "../lib/seo";

const CHAPTERS = [
  ["Matra", "माँ", "Matra is the mother — the first weaver of identity. Our emblem holds a mother and child before the loom: every thread we print is passed down, never invented."],
  ["Vastra", "वस्त्र", "Vastra is cloth — and in Banaras, cloth has always been sacred. From Banarasi silk to the humble gamchha, fabric here carries prayer."],
  ["Kashi", "काशी", "The city older than history. Its ghats, its aarti, its lanes and its scholars shape everything we design — spiritual, regional and restless."],
  ["You", "आप", "MatraVastra exists for the ones who carry their roots into the world. Wear your roots. Represent your culture."],
];

export default function About() {
  return (
    <PageTransition>
      <Seo
        title="Our Story — From the Soul of Kashi"
        description="The story of MATRA VASTRA: a Varanasi clothing brand where Matra (mother) and Vastra (cloth) meet Kashi's heritage. Culture-rooted fashion with identity and meaning."
        path="/about"
        jsonLd={[{ "@context": "https://schema.org", "@type": "AboutPage", name: "About MATRA VASTRA", about: { "@id": `${window.location.origin}/#organization` } }, breadcrumb([["Home", "/"], ["Our Story", "/about"]])]}
      />
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <SectionHead as="h1" eyebrow="About MatraVastra" title="FROM THE SOUL OF KASHI." />
          <Reveal delay={0.2}>
            <p className="font-serif-it mt-8 text-2xl leading-snug text-[#faf6ee]/85" data-testid="about-description">
              MatraVastra brings together the timeless soul of Kashi and the language of modern fashion. Every design carries a feeling, an identity and a story.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.3} className="lg:col-span-5 flex justify-center">
          <img src={LOGO} alt="MATRA VASTRA" className="float-y w-72 sm:w-80 rounded-sm ring-1 ring-[#d4af37]/40 shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_80px_rgba(212,175,55,0.15)]" data-testid="about-logo" />
        </Reveal>
      </section>
      <section className="relative mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative h-[50vh] overflow-hidden border border-[#d4af37]/20">
            <img src={STORY_IMG} alt="Varanasi ghats at dusk" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080708] via-[#080708]/30 to-transparent" />
            <p className="ivory-3d absolute bottom-10 left-10 text-3xl sm:text-5xl font-black">JAHAN SE HUM AATE HAIN.</p>
          </div>
        </Reveal>
      </section>
      <section className="mx-auto mt-32 max-w-5xl px-4 sm:px-6 lg:px-8">
        {CHAPTERS.map(([t, d, txt], i) => (
          <Reveal key={t} delay={0.05} className={`relative grid gap-6 border-l border-[#d4af37]/30 py-14 pl-10 sm:grid-cols-12 ${i % 2 ? "sm:ml-24" : ""}`}>
            <span className="absolute -left-[7px] top-16 h-3 w-3 rotate-45 bg-[#d4af37]" />
            <div className="sm:col-span-4">
              <p className="font-display text-xs tracking-[0.4em] text-[#d4af37]">CHAPTER 0{i + 1}</p>
              <h3 className="gold-3d mt-3 text-4xl font-black">{t}</h3>
              <p className="font-deva mt-1 text-2xl text-[#58181a] brightness-150">{d}</p>
            </div>
            <p className="sm:col-span-8 text-lg leading-relaxed text-[#faf6ee]/75">{txt}</p>
          </Reveal>
        ))}
        <Reveal className="mt-16">
          <Link to="/shop" className="btn-gold" data-testid="about-shop-btn">Explore the Collection</Link>
        </Reveal>
      </section>
    </PageTransition>
  );
}
