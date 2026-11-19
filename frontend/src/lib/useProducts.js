import { useEffect, useState } from "react";
import { api } from "./api";

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);
  useEffect(() => {
    setLoading(true);
    api.get("/products", { params: JSON.parse(key) }).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [key]);
  return { products, loading };
};
