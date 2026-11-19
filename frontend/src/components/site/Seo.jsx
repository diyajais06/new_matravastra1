import { useEffect } from "react";
import { abs, SITE_NAME } from "../../lib/seo";
import { LOGO } from "../../lib/api";

const upsert = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

export const Seo = ({ title, description, path = "/", image = LOGO, type = "website", noindex = false, jsonLd = [] }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Wear Your Roots | Premium Kashi Clothing from Varanasi`;
  useEffect(() => {
    const url = abs(path);
    document.title = fullTitle;
    upsert("name", "description", description);
    upsert("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    upsert("property", "og:title", fullTitle);
    upsert("property", "og:description", description);
    upsert("property", "og:url", url);
    upsert("property", "og:image", abs(image));
    upsert("property", "og:type", type);
    upsert("name", "twitter:title", fullTitle);
    upsert("name", "twitter:description", description);
    upsert("name", "twitter:image", abs(image));
    setCanonical(url);
  }, [fullTitle, description, path, image, type, noindex]);

  return jsonLd.map((d, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
  ));
};
