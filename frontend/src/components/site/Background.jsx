import { lazy, Suspense, useState } from "react";
import { supportsWebGL } from "./KashiScene";
import { STORY_IMG } from "../../lib/api";

const KashiScene = lazy(() => import("./KashiScene"));

const Fallback = () => (
  <div
    className="absolute inset-0 bg-cover bg-center opacity-30"
    style={{ backgroundImage: `url(${STORY_IMG})` }}
    data-testid="bg-fallback"
  />
);

export const Background = () => {
  const [ok] = useState(
    () => supportsWebGL() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return (
    <div className="fixed inset-0 -z-10 bg-[#080708]" aria-hidden="true" data-testid="kashi-background">
      {ok ? (
        <Suspense fallback={<Fallback />}>
          <KashiScene />
        </Suspense>
      ) : (
        <Fallback />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,7,8,0.75)_100%)]" />
    </div>
  );
};
