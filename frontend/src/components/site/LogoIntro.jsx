import { useEffect } from "react";
import { motion } from "framer-motion";
import { LOGO } from "../../lib/api";

const STRIPS = 14;
const WARP = 22;
const EASE = [0.22, 1, 0.36, 1];

const Warp = () => (
  <svg className="pointer-events-none absolute -inset-y-[40%] inset-x-0 h-[180%] w-full" viewBox="0 0 100 180" preserveAspectRatio="none" aria-hidden="true">
    {[...Array(WARP)].map((_, i) => {
      const x = (i + 0.5) * (100 / WARP);
      return (
        <motion.line key={i} x1={x} x2={x} y1="0" y2="180" stroke="#d4af37" strokeWidth="0.25"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ pathLength: { duration: 1, delay: i * 0.025, ease: EASE }, opacity: { duration: 3.2, times: [0, 0.15, 0.7, 1], delay: i * 0.025 } }} />
      );
    })}
  </svg>
);

const Strip = ({ i }) => {
  const fromLeft = i % 2 === 0;
  const delay = 0.7 + i * 0.09;
  return (
    <div className="relative overflow-hidden" style={{ height: `${100 / STRIPS}%` }}>
      <motion.div className="absolute inset-0" initial={{ x: fromLeft ? "-105%" : "105%" }} animate={{ x: 0 }} transition={{ duration: 0.75, delay, ease: EASE }}>
        <img src={LOGO} alt="" draggable="false" className="absolute left-0 w-full max-w-none select-none" style={{ top: `-${i * 100}%`, height: `${STRIPS * 100}%` }} />
      </motion.div>
      <motion.span className="absolute top-1/2 h-[2px] w-1/3 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#fcf6ba] to-transparent shadow-[0_0_12px_#d4af37]"
        initial={{ left: fromLeft ? "-35%" : "100%", opacity: 1 }}
        animate={{ left: fromLeft ? "100%" : "-35%", opacity: 0 }}
        transition={{ duration: 0.75, delay, ease: "easeInOut" }} />
    </div>
  );
};

export const LogoIntro = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4300);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#080708]"
      initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }} transition={{ duration: 0.8, ease: EASE }} data-testid="logo-intro">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.16),transparent_55%)]" />
      <div className="relative" style={{ width: "min(68vw, 46vh, 380px)", aspectRatio: "1164 / 1351" }}>
        <Warp />
        <motion.div className="relative h-full w-full shine-sweep" initial={{ filter: "drop-shadow(0 0 0 rgba(212,175,55,0))" }} animate={{ filter: "drop-shadow(0 0 40px rgba(212,175,55,0.35))" }} transition={{ delay: 2.3, duration: 1 }}>
          <div className="flex h-full w-full flex-col">{[...Array(STRIPS)].map((_, i) => <Strip key={i} i={i} />)}</div>
        </motion.div>
      </div>
      <motion.p className="gold-3d relative mt-10 px-6 text-center text-base sm:text-xl font-bold tracking-[0.35em]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 0.8 }}>
        WEAR YOUR ROOTS
      </motion.p>
      <motion.p className="font-serif-it relative mt-3 text-sm sm:text-base text-[#faf6ee]/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9, duration: 0.8 }}>
        Woven in Kashi
      </motion.p>
      <button onClick={onDone} className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.35em] text-[#faf6ee]/50 hover:text-[#d4af37] transition-colors" data-testid="intro-skip-btn">Skip Intro</button>
    </motion.div>
  );
};
