import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 40, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const PageTransition = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="min-h-screen pt-24"
  >
    {children}
  </motion.main>
);

export const SectionHead = ({ eyebrow, title, sub, className = "", titleClass = "gold-3d", as: Tag = "h2" }) => (
  <Reveal className={className}>
    {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
    <Tag className={`${titleClass} text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-wide`}>{title}</Tag>
    {sub && <p className="mt-5 max-w-xl text-base md:text-lg text-[#faf6ee]/70 leading-relaxed">{sub}</p>}
  </Reveal>
);
