import { COLLECTIONS, LOGO } from "./api";

export const SITE_NAME = "MATRA VASTRA";
export const origin = () => window.location.origin;
export const abs = (path = "/") => (path.startsWith("http") ? path : `${origin()}${path}`);

export const organization = () => ({
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "@id": `${origin()}/#organization`,
  name: SITE_NAME,
  alternateName: "MatraVastra",
  url: origin(),
  logo: abs(LOGO),
  image: abs(LOGO),
  slogan: "Wear Your Roots. Represent Your Culture.",
  description:
    "MATRA VASTRA is a premium Varanasi (Kashi) based clothing brand making culture-rooted oversized T-shirts across three collections: Kashi Spiritual, Apna Purvanchal and Aspirant Life.",
  telephone: "+91-6393707020",
  email: "hello@matravastra.com",
  priceRange: "₹999 – ₹1399",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Wallets",
  address: { "@type": "PostalAddress", addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
  areaServed: { "@type": "Country", name: "India" },
  openingHours: "Mo-Sa 10:00-20:00",
  sameAs: ["https://www.instagram.com/matravastra", "https://wa.me/916393707020"],
});

export const website = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${origin()}/#website`,
  name: SITE_NAME,
  url: origin(),
  inLanguage: "en-IN",
  publisher: { "@id": `${origin()}/#organization` },
});

export const breadcrumb = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

export const productSchema = (p) => {
  const col = COLLECTIONS.find((c) => c.slug === p.collection);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.slug,
    image: [p.image_front, p.image_back],
    description: p.description,
    category: `Apparel > T-Shirts > ${col?.full}`,
    material: p.fabric,
    color: p.colors.map((c) => c.name).join(", "),
    size: p.sizes.join(", "),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: abs(`/product/${p.slug}`),
      priceCurrency: "INR",
      price: p.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${origin()}/#organization` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        shippingRate: { "@type": "MonetaryAmount", value: p.price >= 999 ? 0 : 79, currency: "INR" },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
      },
    },
  };
};

export const itemList = (products, name) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/product/${p.slug}`), name: p.name })),
});

export const faqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});
