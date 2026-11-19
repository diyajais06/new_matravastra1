import { motion } from "framer-motion";
import { LOGO } from "../../lib/api";

export const AnimatedLogo = ({ className = "", testId, ring = false }) => (
  <motion.div className={`group relative inline-block ${className}`} whileHover={{ scale: 1.04, rotateY: 8 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} style={{ perspective: 800 }} data-testid={testId}>
    {ring && (
      <motion.span className="pointer-events-none absolute -inset-4 rounded-sm border border-[#d4af37]/30"
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    )}
    <span className="shine-sweep relative block h-full overflow-hidden rounded-sm ring-1 ring-[#d4af37]/35 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-shadow duration-500 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]">
      <img src={LOGO} alt="MATRA VASTRA" className="block h-full w-auto" />
    </span>
  </motion.div>
);
