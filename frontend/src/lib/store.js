import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

const load = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k)) || [];
  } catch {
    return [];
  }
};

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load("mv_cart"));
  const [wishlist, setWishlist] = useState(() => load("mv_wishlist"));
  const [bump, setBump] = useState(0);

  useEffect(() => {
    localStorage.setItem("mv_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("mv_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const value = useMemo(() => {
    const key = (i) => `${i.slug}-${i.size}-${i.color}`;
    return {
      cart,
      wishlist,
      bump,
      cartCount: cart.reduce((s, i) => s + i.qty, 0),
      subtotal: cart.reduce((s, i) => s + i.qty * i.price, 0),
      addToCart: (product, size, color, qty = 1) => {
        const item = { slug: product.slug, name: product.name, price: product.price, image: product.image_front, href: product.href || `/product/${product.slug}`, size, color, qty };
        setCart((c) => {
          const ex = c.find((i) => key(i) === key(item));
          return ex ? c.map((i) => (key(i) === key(item) ? { ...i, qty: i.qty + qty } : i)) : [...c, item];
        });
        setBump((b) => b + 1);
      },
      updateQty: (k, qty) => setCart((c) => c.map((i) => (key(i) === k ? { ...i, qty: Math.max(1, qty) } : i))),
      removeItem: (k) => setCart((c) => c.filter((i) => key(i) !== k)),
      clearCart: () => setCart([]),
      itemKey: key,
      isWished: (slug) => wishlist.some((w) => w.slug === slug),
      toggleWish: (p) =>
        setWishlist((w) =>
          w.some((x) => x.slug === p.slug)
            ? w.filter((x) => x.slug !== p.slug)
            : [...w, { slug: p.slug, name: p.name, price: p.price, image_front: p.image_front, image_back: p.image_back, collection: p.collection }]
        ),
    };
  }, [cart, wishlist, bump]);

  return createElement(StoreContext.Provider, { value }, children);
}

export const useStore = () => useContext(StoreContext);
