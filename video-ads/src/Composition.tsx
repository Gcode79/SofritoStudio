import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const fraunces = loadFraunces().fontFamily;
const inter = loadInter().fontFamily;

const CREAM = "#FFF7EE";
const INK = "#2B2118";
const ACCENT = "#C03D2A";
const GOLD = "#9A7318";
const SOFT = "#6B5B4C";
const W = 1080;
const H = 1920;

const fadeUp = (frame: number, delay = 0, dur = 16, dist = 60) => {
  const t = Math.max(0, frame - delay);
  return {
    opacity: interpolate(t, [0, dur], [0, 1], { extrapolateRight: "clamp" }),
    translateY: interpolate(t, [0, dur], [dist, 0], { extrapolateRight: "clamp" }),
  };
};

const Bands: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26, background: ACCENT }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 26, background: GOLD }} />
  </>
);

/* ---- Intro: wordmark over a blurred, warm food backdrop ---- */
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 20], [1.08, 1.16], { extrapolateRight: "clamp" });
  const reveal = fadeUp(frame, 4, 18, 30);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
<img
          src={staticFile("rec-sofrito.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            filter: "brightness(0.72) saturate(1.08)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(43,33,24,0.55), rgba(192,61,42,0.18) 40%, rgba(43,33,24,0.72))" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: reveal.opacity, transform: `translateY(${reveal.translateY}px)` }}>
        <div style={{ fontFamily: fraunces, fontWeight: 700, fontSize: 118, color: "#FFFFFF", lineHeight: 1, textShadow: "0 10px 40px rgba(0,0,0,0.35)" }}>
          SOFRITO
        </div>
        <div style={{ fontFamily: fraunces, fontWeight: 600, fontSize: 76, color: "#F2C14E", lineHeight: 1.1, marginTop: 6 }}>
          STUDIO
        </div>
        <div style={{ width: 220, height: 6, background: "#F2C14E", borderRadius: 3, marginTop: 42 }} />
        <div style={{ fontFamily: inter, fontSize: 38, color: "#FFF7EE", marginTop: 34, letterSpacing: 5 }}>
          COCINA BORICUA
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---- Hook: kinetic headline on cream ---- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const line1 = fadeUp(frame, 0, 16, 50);
  const line2 = fadeUp(frame, 8, 16, 50);
  const sub = fadeUp(frame, 18, 16, 40);
  const bar = interpolate(frame, [14, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, justifyContent: "center", alignItems: "center" }}>
      <Bands />
      <div style={{ padding: "0 90px", width: "100%" }}>
        <div style={{ fontFamily: inter, fontWeight: 700, fontSize: 40, color: GOLD, letterSpacing: 4, opacity: line1.opacity, transform: `translateY(${line1.translateY}px)` }}>
          THE STARTER KIT
        </div>
        <div style={{ fontFamily: fraunces, fontWeight: 700, fontSize: 96, color: INK, lineHeight: 1.14, marginTop: 30, opacity: line2.opacity, transform: `translateY(${line2.translateY}px)` }}>
          The 5 recipes every boricua cook needs
        </div>
        <div style={{ marginTop: 40, height: 10, background: ACCENT, width: `${bar * 200}px`, borderRadius: 5 }} />
        <div style={{ fontFamily: inter, fontSize: 46, color: SOFT, marginTop: 34, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
          Bilingual · Mainland-tested · No specialty store
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---- Photo card: full-bleed food image, slow zoom, text over gradient ---- */
const CARDS: { img: string; en: string; es: string; line: string }[] = [
  { img: "rec-sofrito.jpg", en: "Sofrito", es: "El sabor base", line: "The flavor base of everything" },
  { img: "rec-arroz.jpg", en: "Arroz con Pollo", es: "Comfort en una olla", line: "One-pot comfort, weeknight-ready" },
  { img: "rec-pernil.jpg", en: "Pernil", es: "Cerdo asado", line: "Slow-roasted, crackling pork" },
  { img: "rec-tostones.jpg", en: "Tostones", es: "Plátanos verdes", line: "Crisp plantain rounds" },
  { img: "rec-flan.jpg", en: "Flan", es: "El postre clásico", line: "Silky caramel custard" },
];

const Card: React.FC<{ data: (typeof CARDS)[number]; idx: number }> = ({ data, idx }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 54], [1.06, 1.16], { extrapolateRight: "clamp" });
  const t = fadeUp(frame, 6, 14, 40);
  const counter = fadeUp(frame, 2, 10, 20);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img src={staticFile(data.img)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(20,10,5,0.10), rgba(20,10,5,0.18) 40%, rgba(20,10,5,0.86) 100%)" }} />
      </div>
      <div style={{ position: "absolute", top: 120, right: 90, fontFamily: inter, fontSize: 40, fontWeight: 700, color: "#FFF7EE", opacity: counter.opacity, transform: `translateY(${counter.translateY}px)` }}>
        {idx + 1} / {CARDS.length}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 150, opacity: t.opacity, transform: `translateY(${t.translateY}px)` }}>
        <div style={{ fontFamily: fraunces, fontWeight: 700, fontSize: 116, color: "#FFFFFF", lineHeight: 1.04, textShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
          {data.en}
        </div>
        <div style={{ fontFamily: fraunces, fontWeight: 600, fontSize: 60, color: "#F2C14E", marginTop: 12 }}>
          {data.es}
        </div>
        <div style={{ fontFamily: inter, fontSize: 44, color: "#FFF7EE", marginTop: 22 }}>
          {data.line}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---- CTA ---- */
const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const a = fadeUp(frame, 0);
  const b = fadeUp(frame, 12);
  const c = fadeUp(frame, 20);
  const glow = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, justifyContent: "center", alignItems: "center" }}>
      <Bands />
      <div style={{ textAlign: "center", padding: "0 90px" }}>
        <div style={{ width: 500, height: 500, margin: "0 auto 42px", borderRadius: 40, overflow: "hidden", boxShadow: `0 34px 90px rgba(43,33,24,${0.12 + 0.2 * glow})`, transform: `rotate(${(glow - 1) * 2}deg)`, opacity: a.opacity }}>
          <img src={staticFile("starter-kit.png")} width={500} height={500} style={{ objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: fraunces, fontWeight: 700, fontSize: 92, color: INK, opacity: b.opacity, transform: `translateY(${b.translateY}px)` }}>
          Get the Starter Kit
        </div>
        <div style={{ fontFamily: inter, fontSize: 42, color: SOFT, marginTop: 20, opacity: b.opacity, transform: `translateY(${b.translateY}px)` }}>
          $9 · Instant download · 30-day guarantee
        </div>
        <div style={{ fontFamily: inter, fontWeight: 700, fontSize: 50, color: "#FFFFFF", backgroundColor: ACCENT, borderRadius: 999, padding: "22px 58px", marginTop: 44, display: "inline-block", opacity: c.opacity, transform: `translateY(${c.translateY}px)` }}>
          sofritostudio.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <>
      <Sequence from={0} durationInFrames={f(2.4)}>
        <Intro />
      </Sequence>
      <Sequence from={f(2.4)} durationInFrames={f(4.2)}>
        <Hook />
      </Sequence>
      {CARDS.map((c, i) => (
        <Sequence key={c.en} from={f(6.6) + i * f(1.8)} durationInFrames={f(1.8)}>
          <Card data={c} idx={i} />
        </Sequence>
      ))}
      <Sequence from={f(15.6)} durationInFrames={f(6.4)}>
        <CTA />
      </Sequence>
    </>
  );
};

export const SofritoStarterKit: React.FC = () => {
  return (
    <Composition
      id="SofritoStarterKit"
      component={Video}
      durationInFrames={660}
      fps={30}
      width={W}
      height={H}
    />
  );
};