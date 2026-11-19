import { useCallback, useEffect, useState } from "react";
import { IntroContext } from "./lib/intro";
import { LogoIntro } from "./components/site/LogoIntro";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { StoreProvider } from "./lib/store";
import { Background } from "./components/site/Background";
import { Navbar } from "./components/site/Navbar";
import { Footer } from "./components/site/Footer";
import { WhatsAppButton } from "./components/site/WhatsAppButton";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Collection from "./pages/Collection";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Bulk from "./pages/Bulk";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/Trackorder";
import Wishlist from "./pages/Wishlist";
import Faq from "./pages/Faq";
import SitemapPage from "./pages/SitemapPage";
import Hampers from "./pages/Hampers";
import Download from "./pages/Download";

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collection/:slug" element={<Collection />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/bulk-orders" element={<Bulk />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/hampers" element={<Hampers />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem("mv_intro") === "1");
  const finishIntro = useCallback(() => {
    sessionStorage.setItem("mv_intro", "1");
    setIntroDone(true);
  }, []);
  return (
    <div className="App grain">
      <IntroContext.Provider value={introDone}>
      <StoreProvider>
        <BrowserRouter>
          <AnimatePresence>{!introDone && <LogoIntro key="intro" onDone={finishIntro} />}</AnimatePresence>
          <Background />
          <Navbar />
          <AnimatedRoutes />
          <Footer />
          <WhatsAppButton />
          <Toaster
            position="bottom-left"
            toastOptions={{ style: { background: "#121114", color: "#faf6ee", border: "1px solid rgba(212,175,55,.35)", fontFamily: "Plus Jakarta Sans" } }}
          />
        </BrowserRouter>
      </StoreProvider>
      </IntroContext.Provider>
    </div>
  );
}

export default App;
