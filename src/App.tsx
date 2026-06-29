import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import Home from "./pages/Home";
import GiftCheckout from "./pages/GiftCheckout";

export default function App() {
  useEffect(() => {
    // Lenis na window (sem wrapper) — scroll suave que mantém o scroll real do
    // documento, então o parallax do motion (useScroll) continua funcionando.
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let id = requestAnimationFrame(function raf(t: number) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/presente/:id" element={<GiftCheckout />} />
    </Routes>
  );
}
