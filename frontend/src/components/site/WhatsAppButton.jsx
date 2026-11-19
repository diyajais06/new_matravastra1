import { motion } from "framer-motion";
import { waLink } from "../../lib/api";

export const WhatsAppButton = () => (
  <motion.a
    href={waLink("Namaste MatraVastra! I'd like to know more about your collection.")}
    target="_blank"
    rel="noreferrer"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.5, type: "spring" }}
    whileHover={{ scale: 1.08 }}
    className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#1f8f4e] py-3.5 pl-3.5 pr-3.5 text-white shadow-[0_10px_30px_rgba(31,143,78,0.45)] ring-2 ring-[#d4af37]/50 hover:pr-6 transition-[padding] duration-300"
    data-testid="whatsapp-float-btn"
    aria-label="Chat on WhatsApp"
  >
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.3-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3z" /></svg>
    <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-widest group-hover:inline group-hover:max-w-xs">Kashi Concierge</span>
  </motion.a>
);
