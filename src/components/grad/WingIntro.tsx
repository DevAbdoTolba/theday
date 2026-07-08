// src/components/grad/WingIntro.tsx
// The one-time ceremony. First visit to the wing shows a quiet stage with a
// joyful Material-3 play seal; pressing it runs a ~15s motion story that
// bridges TheDay's indigo into the wing's charcoal:
//
//   1. "It started with ordinary days."        — a gold day-dot, a week of days
//                                                flying into a spinning orbit
//   2. "Lecture by lecture, they stacked up."  — the dot grows, morphs through
//                                                expressive shapes, turns red,
//                                                moons circling it
//   3. (the grind)                             — EXAMS. DEADLINES. ALL-NIGHTERS.
//                                                slam in like rubber stamps while
//                                                the shape shakes under the load
//   4. "Until one day — you made it."          — the shape bursts: confetti,
//                                                shockwave rings, a mortarboard
//                                                that lands and takes a bow
//   5. "This wing is yours now."               — the red seal comes down. THUNK.
//   6. Title card                              — The Graduation Wing, embers rising
//
// Skippable like a game cinematic (with confirmation), plays exactly once
// per device, and animates transform/opacity only so it stays smooth on
// weak machines.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import ExpressiveShape from "./ExpressiveShape";
import { SHAPES, SHAPE_VIEWBOX } from "./expressiveShapes";
import { markIntroSeen } from "../../utils/gradStore";

const PlayArrowRounded = dynamic(() => import("@mui/icons-material/PlayArrowRounded"), { ssr: false });
const SchoolRounded = dynamic(() => import("@mui/icons-material/SchoolRounded"), { ssr: false });

interface Props {
  sectionKey: string;
  title: string;
  tagline: string;
  onFinished: () => void;
}

const INK = "#151a2c";
const GOLD = "#F6CE6B";
const GOLD_DEEP = "#DB9A2D";
const CRIMSON = "#C8102E";
const CRIMSON_SOFT = "#FF5A68";
const SANS = "var(--wing-sans), sans-serif";
const DISPLAY = "var(--wing-display), Georgia, serif";

// scene backdrops: indigo (TheDay) → strain → burst → seal → wing charcoal
const SCENE_BG = [INK, "#191622", "#221019", "#1D0E12", "#170D12", "#131316"];
const SCENE_MS = [2600, 2600, 2400, 2800, 2200, 2400];

const CAPTIONS: (string | null)[] = [
  "It started with ordinary days.",
  "Lecture by lecture, they stacked up.",
  null, // the slammed words speak for themselves
  "Until one day — you made it.",
  "This wing is yours now.",
  null,
];

const GRIND_WORDS = [
  { text: "Exams.", x: -82, y: -58, rotate: -8, color: "rgba(255,255,255,0.92)", big: true },
  { text: "Deadlines.", x: 78, y: -14, rotate: 6, color: GOLD, big: true },
  { text: "All-nighters.", x: -58, y: 44, rotate: -5, color: CRIMSON_SOFT, big: true },
  { text: "And still — you kept going.", x: 0, y: 104, rotate: 0, color: "rgba(255,255,255,0.85)", big: false },
];

function Caption({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.div
      key={text}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -14, transition: { duration: 0.35 } }}
      variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.32em" }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } },
          }}
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: "clamp(1.15rem, 3.4vw, 1.7rem)",
            fontWeight: 500,
            letterSpacing: "0.01em",
            fontFamily: DISPLAY,
            fontStyle: "italic",
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default function WingIntro({ sectionKey, title, tagline, onFinished }: Props) {
  const [phase, setPhase] = useState<"gate" | "playing">("gate");
  const [scene, setScene] = useState(0);
  const [skipArmed, setSkipArmed] = useState(false);
  const [gateLeaveArmed, setGateLeaveArmed] = useState(false);
  const reducedMotion = useReducedMotion();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishedRef = useRef(false);

  const finish = useMemo(
    () => () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      timers.current.forEach(clearTimeout);
      onFinished();
    },
    [onFinished]
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Disarm skip confirmation after a moment, like game cinematics do
  useEffect(() => {
    if (!skipArmed) return;
    const t = setTimeout(() => setSkipArmed(false), 2600);
    return () => clearTimeout(t);
  }, [skipArmed]);

  const play = () => {
    markIntroSeen(sectionKey); // it never comes back — even if the tab closes mid-story
    setPhase("playing");
    const finalScene = SCENE_MS.length - 1;
    const scenes = reducedMotion ? [SCENE_MS[finalScene]] : SCENE_MS;
    if (reducedMotion) setScene(finalScene);
    let acc = 0;
    scenes.forEach((ms, i) => {
      acc += ms;
      if (i < scenes.length - 1) {
        timers.current.push(setTimeout(() => setScene(reducedMotion ? finalScene : i + 1), acc));
      } else {
        timers.current.push(setTimeout(finish, acc + 500));
      }
    });
  };

  const skipQuietly = () => {
    markIntroSeen(sectionKey);
    finish();
  };

  // deterministic confetti — no Math.random so SSR/renders stay stable
  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2 + 0.35;
        const dist = 120 + (i % 4) * 48;
        const shapeNames = ["scallop", "burst", "flower", "clover"] as const;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.82,
          size: 11 + (i % 3) * 7,
          rotate: (i * 97) % 360,
          color: [GOLD, CRIMSON_SOFT, "#FFFFFF", "#8E8E96"][i % 4],
          d: SHAPES[shapeNames[i % 4]],
          delay: 0.05 + (i % 5) * 0.045,
        };
      }),
    []
  );

  const bg = phase === "gate" ? INK : SCENE_BG[scene];

  return (
    <motion.div
      key="wing-intro"
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.7, ease: "easeInOut" } }}
      style={{ position: "fixed", inset: 0, zIndex: 3000 }}
    >
      <motion.div
        animate={{ backgroundColor: bg }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* ------------------------------------------------ GATE */}
        <AnimatePresence>
          {phase === "gate" && (
            <motion.div
              key="gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6 } }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.45 } }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 26,
                padding: 24,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.32em",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                A SMALL CEREMONY BEFORE YOU ENTER
              </Typography>

              <motion.div
                animate={{ scale: [1, 1.045, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ButtonBase
                  aria-label="Play the welcome"
                  onClick={play}
                  sx={{
                    borderRadius: "50%",
                    filter: "drop-shadow(0 8px 30px rgba(219,154,45,0.45))",
                    "&:hover": { transform: "scale(1.05)" },
                    transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <ExpressiveShape
                    shape={["scallop", "flower", "burst"]}
                    size={128}
                    gradient={[GOLD, GOLD_DEEP]}
                    morphDuration={9}
                    rotateDuration={46}
                  >
                    <PlayArrowRounded sx={{ fontSize: 56, color: INK, ml: 0.5 }} />
                  </ExpressiveShape>
                </ButtonBase>
              </motion.div>

              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 15.5, fontWeight: 500 }}>
                This plays once. Only here. Only for you.
              </Typography>

              {!gateLeaveArmed ? (
                <ButtonBase
                  onClick={() => setGateLeaveArmed(true)}
                  sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13, p: 1, borderRadius: 2 }}
                >
                  enter without the moment
                </ButtonBase>
              ) : (
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                    It will never play again — sure?
                  </Typography>
                  <ButtonBase
                    onClick={skipQuietly}
                    sx={{ color: "#FF8A96", fontSize: 13, fontWeight: 700, p: 1, borderRadius: 2 }}
                  >
                    Enter anyway
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => setGateLeaveArmed(false)}
                    sx={{ color: GOLD, fontSize: 13, fontWeight: 700, p: 1, borderRadius: 2 }}
                  >
                    Watch it
                  </ButtonBase>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------ STORY */}
        {phase === "playing" && (
          <>
            {/* Scene 1: a week of days flies into a spinning orbit */}
            <AnimatePresence>
              {scene === 0 && (
                <motion.div
                  key="days"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 1.35, transition: { duration: 0.6 } }}
                  style={{ position: "absolute", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1, 1.12, 1] }}
                    transition={{ duration: 2.3, times: [0, 0.16, 0.32, 0.66, 1], ease: "easeInOut" }}
                    style={{ width: 26, height: 26, borderRadius: "50%", background: GOLD, boxShadow: `0 0 34px ${GOLD_DEEP}` }}
                  />
                  {/* the orbit itself spins while days pop in */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {Array.from({ length: 7 }, (_, i) => {
                      const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                          animate={{ opacity: 0.85, x: Math.cos(a) * 92, y: Math.sin(a) * 92, scale: [0, 1.4, 1] }}
                          transition={{ delay: 0.45 + i * 0.14, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                          style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.75)" }}
                        />
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 2: the morphing accumulation, moons circling */}
            <AnimatePresence>
              {scene === 1 && (
                <motion.div
                  key="stack"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.6, transition: { duration: 0.5 } }}
                  transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ position: "absolute", width: 230, height: 230 }}
                >
                  <motion.svg viewBox={SHAPE_VIEWBOX} style={{ width: "100%", height: "100%" }}>
                    <motion.path
                      initial={{ d: SHAPES.circle, fill: GOLD }}
                      animate={{
                        d: [SHAPES.circle, SHAPES.scallop, SHAPES.flower, SHAPES.burst],
                        fill: [GOLD, GOLD_DEEP, CRIMSON_SOFT, CRIMSON],
                        rotate: 200,
                      }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                  </motion.svg>
                  {/* little moons — the days keep circling what they built */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {[GOLD, "rgba(255,255,255,0.8)", CRIMSON_SOFT].map((c, i) => {
                      const a = (i / 3) * Math.PI * 2;
                      return (
                        <motion.svg
                          key={i}
                          viewBox={SHAPE_VIEWBOX}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.2, type: "spring", stiffness: 300, damping: 18 }}
                          style={{
                            position: "absolute",
                            width: 16 + (i % 2) * 6,
                            height: 16 + (i % 2) * 6,
                            transform: `translate(${Math.cos(a) * 128}px, ${Math.sin(a) * 128}px)`,
                          }}
                        >
                          <path d={SHAPES[(["clover", "flower", "scallop"] as const)[i]]} fill={c} />
                        </motion.svg>
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 3: the grind — words slam like rubber stamps */}
            <AnimatePresence>
              {scene === 2 && (
                <motion.div
                  key="grind"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {/* the shape under strain */}
                  <motion.svg
                    viewBox={SHAPE_VIEWBOX}
                    animate={{ x: [0, -4, 4, -3, 3, -2, 2, 0], rotate: [0, -2, 2, -1, 1, 0] }}
                    transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 190, height: 190, opacity: 0.45 }}
                  >
                    <path d={SHAPES.burst} fill={CRIMSON} />
                  </motion.svg>
                  {GRIND_WORDS.map((w, i) => (
                    <div
                      key={w.text}
                      style={{ position: "absolute", transform: `translate(${w.x}px, ${w.y}px)` }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 2.6, rotate: w.rotate * 2.5 }}
                        animate={{ opacity: 1, scale: 1, rotate: w.rotate }}
                        transition={{ delay: 0.15 + i * 0.48, type: "spring", stiffness: 420, damping: 21 }}
                        style={{
                          fontFamily: SANS,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                          fontSize: w.big ? "clamp(1.25rem, 4.2vw, 1.85rem)" : "clamp(0.85rem, 2.6vw, 1.05rem)",
                          color: w.color,
                        }}
                      >
                        {w.text}
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 4: the burst — confetti, shockwaves, and a bow */}
            <AnimatePresence>
              {scene === 3 && (
                <motion.div
                  key="burst"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.55 } }}
                  style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {/* shockwave rings */}
                  {[0, 1].map((r) => (
                    <motion.div
                      key={`ring-${r}`}
                      initial={{ scale: 0.2, opacity: 0.9 }}
                      animate={{ scale: 2.7 + r * 0.9, opacity: 0 }}
                      transition={{ delay: 0.28 + r * 0.3, duration: 1.15, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        border: `2px solid ${r ? CRIMSON_SOFT : GOLD}`,
                      }}
                    />
                  ))}
                  {confetti.map((c, i) => (
                    <motion.svg
                      key={i}
                      viewBox={SHAPE_VIEWBOX}
                      initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                      animate={{ x: c.x, y: c.y, scale: [0, 1, 0.85], rotate: c.rotate, opacity: [1, 1, 0] }}
                      transition={{ delay: c.delay, duration: 1.9, ease: [0.16, 0.84, 0.3, 1] }}
                      style={{ position: "absolute", width: c.size * 2, height: c.size * 2 }}
                    >
                      <path d={c.d} fill={c.color} />
                    </motion.svg>
                  ))}
                  <motion.div
                    initial={{ y: 90, scale: 0.4, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 190, damping: 15 }}
                  >
                    {/* …lands, then takes a little bow */}
                    <motion.div
                      animate={{ rotate: [0, 0, -6, 5, -2, 0] }}
                      transition={{ delay: 1.15, duration: 1.0, ease: "easeInOut" }}
                    >
                      <ExpressiveShape shape="scallop" size={150} gradient={[GOLD, GOLD_DEEP]} rotateDuration={60}>
                        <SchoolRounded sx={{ fontSize: 64, color: INK }} />
                      </ExpressiveShape>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 5: the seal comes down. THUNK. */}
            <AnimatePresence>
              {scene === 4 && (
                <motion.div
                  key="seal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 0, 7, -3, 1, 0] }}
                  exit={{ opacity: 0, scale: 1.15, transition: { duration: 0.45 } }}
                  transition={{ opacity: { duration: 0.25 }, y: { delay: 0.3, duration: 0.55, ease: "easeOut" } }}
                  style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <motion.div
                    initial={{ scale: 3.2, opacity: 0, rotate: -28 }}
                    animate={{ scale: 1, opacity: 1, rotate: -7 }}
                    transition={{ type: "spring", stiffness: 340, damping: 17, delay: 0.12 }}
                  >
                    <ExpressiveShape shape={["scallop", "flower"]} morphDuration={10} size={150} fill={CRIMSON}>
                      <SchoolRounded sx={{ fontSize: 58, color: GOLD }} />
                    </ExpressiveShape>
                  </motion.div>
                  {/* impact poof */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2 + 0.4;
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x: Math.cos(a) * 112, y: Math.sin(a) * 92, scale: [0, 1, 0.6], opacity: [0, 1, 0] }}
                        transition={{ delay: 0.34, duration: 0.7, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: i % 2 ? GOLD : "rgba(255,255,255,0.8)",
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 6: title card, embers rising */}
            <AnimatePresence>
              {scene === 5 && (
                <motion.div
                  key="title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ position: "absolute", textAlign: "center", padding: 24 }}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <motion.svg
                      key={i}
                      viewBox={SHAPE_VIEWBOX}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: -110, opacity: [0, 0.45, 0] }}
                      transition={{ delay: 0.25 + i * 0.22, duration: 2.1, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        bottom: -40,
                        left: `${12 + i * 15}%`,
                        width: 10 + (i % 3) * 5,
                        height: 10 + (i % 3) * 5,
                      }}
                    >
                      <path
                        d={SHAPES[(["clover", "scallop", "flower"] as const)[i % 3]]}
                        fill={[GOLD, CRIMSON_SOFT, "rgba(255,255,255,0.7)"][i % 3]}
                      />
                    </motion.svg>
                  ))}
                  <motion.div
                    initial={{ y: 34, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Typography
                      sx={{
                        color: "#F0EDE6",
                        fontFamily: DISPLAY,
                        fontWeight: 700,
                        letterSpacing: "-0.015em",
                        fontSize: "clamp(2.2rem, 7vw, 3.8rem)",
                        lineHeight: 1.05,
                      }}
                    >
                      {title}
                      <Box component="span" sx={{ color: CRIMSON_SOFT }}>
                        .
                      </Box>
                    </Typography>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.7 }}
                  >
                    <Typography
                      sx={{
                        color: GOLD,
                        mt: 1.5,
                        fontSize: 16.5,
                        fontWeight: 400,
                        fontStyle: "italic",
                        fontFamily: DISPLAY,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {tagline}
                    </Typography>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Captions */}
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: "16%", md: "14%" },
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                px: 3,
              }}
            >
              <AnimatePresence mode="wait">
                {CAPTIONS[scene] && <Caption key={scene} text={CAPTIONS[scene] as string} />}
              </AnimatePresence>
            </Box>

            {/* Skip — with confirmation, like a proper cinematic */}
            <Box sx={{ position: "absolute", bottom: 22, right: 24 }}>
              {!skipArmed ? (
                <ButtonBase
                  onClick={() => setSkipArmed(true)}
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 13,
                    px: 2,
                    py: 1,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  Skip
                </ButtonBase>
              ) : (
                <ButtonBase
                  onClick={finish}
                  sx={{
                    color: INK,
                    bgcolor: GOLD,
                    fontSize: 13,
                    fontWeight: 700,
                    px: 2,
                    py: 1,
                    borderRadius: 999,
                  }}
                >
                  Skip for sure?
                </ButtonBase>
              )}
            </Box>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
