import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API });

export const WHATSAPP_NUMBER = "916393707020";
export const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
export const LOGO = "/assets/logo.jpeg";
export const STORY_IMG =
  "https://static.prod-images.emergentagent.com/jobs/678a8bfa-0a7f-4579-b665-a2c1d7027eda/images/3140c1c00a1d67e885014819f5739a689550a020764b72656374d058dec355e9.jpeg";

export const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const IMG = "https://static.prod-images.emergentagent.com/jobs/678a8bfa-0a7f-4579-b665-a2c1d7027eda/images/";
export const MODELS = [
  { slug: "mahadev-gold-oversized", name: "Mahadev Gold Oversized", image: `${IMG}325e0479da59ab0e920459e5a1dad5bd19f435d511e37e758b322aa0fa0c68bf.jpeg` },
  { slug: "chhath-mahaparv-orange", name: "Chhath Mahaparv Orange", image: `${IMG}51ffd6ea0a21ca2af6ae1b11a5d650cde0d16581e78b41931907b2d9ea47fc22.jpeg` },
  { slug: "apna-purvanchal-terracotta", name: "Apna Purvanchal Terracotta", image: `${IMG}df8ad687bee26fa31137f0fd152f5c6ad06a185e90f2e82ea65a3e019d28ae71.jpeg` },
  { slug: "silent-grind-white", name: "Silent Grind White", image: `${IMG}c3f470bc2b05f515e13a5e79b3582be96687b358e532009518ae0eafe8344f34.jpeg` },
];

export const COLLECTIONS = [
  {
    slug: "kashi",
    no: "01",
    name: "Kashi",
    full: "Kashi / Spiritual",
    deva: "काशी",
    tagline: "Rooted in sacred vibrations & eternal energy.",
    story:
      "Mahadev-inspired artwork, the ghats at dawn, Ganga aarti at dusk. Deep black and antique gold, printed with devotion.",
    titleClass: "gold-3d",
    card: "bg-[#0d0c0e] border-[#d4af37]/35",
    accent: "#d4af37",
  },
  {
    slug: "purvanchal",
    no: "02",
    name: "Apna Purvanchal",
    full: "Apna Purvanchal",
    deva: "पूर्वांचल",
    tagline: "Pride, culture & unflinching heritage.",
    story:
      "Local identity, folk patterns and the loud, proud language of the east. Earthy terracotta, olive and rust — bold by birth.",
    titleClass: "maroon-3d",
    card: "bg-[#1a0d0c] border-[#9a5236]/45",
    accent: "#c87a4a",
  },
  {
    slug: "aspirant",
    no: "03",
    name: "Aspirant Life",
    full: "Aspirant Life",
    deva: "अभ्यर्थी",
    tagline: "For the seekers, hustlers & modern scholars.",
    story:
      "Minimal typography for maximal focus. Oversized youth fits for the late nights, the libraries and the long road to selection.",
    titleClass: "ivory-3d",
    card: "bg-[#131318] border-[#faf6ee]/20",
    accent: "#faf6ee",
  },
];

export const getCollection = (slug) => COLLECTIONS.find((c) => c.slug === slug);
