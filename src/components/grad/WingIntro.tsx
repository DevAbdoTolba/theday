// src/components/grad/WingIntro.tsx
// The one-time ceremony. First visit to the wing shows a quiet stage with a
// joyful Material-3 play seal; pressing it runs a ~9.5s motion story that
// bridges TheDay's indigo into the wing's crimson:
//
//   1. "It started with ordinary days."        — a gold day-dot, days orbiting in
//   2. "Lecture by lecture, they stacked up."  — the dot grows, morphs through
//                                                expressive shapes, turns crimson
//   3. "Until one day — you made it."          — the shape bursts, a mortarboard rises
//   4. Title card                              — The Graduation Wing
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

// scene backdrop colors: indigo (TheDay) → transition → wing charcoal
const SCENE_BG = [INK, "#191622", "#1D0E12", "#131316"];
const SCENE_MS = [2400, 2400, 2700, 2100];

const CAPTIONS = [
  "It started with ordinary days.",
  "Lecture by lecture, they stacked up.",
  "Until one day — you made it.",
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
            fontWeight: 600,
            letterSpacing: "0.01em",
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
    const scenes = reducedMotion ? [SCENE_MS[3]] : SCENE_MS;
    if (reducedMotion) setScene(3);
    let acc = 0;
    scenes.forEach((ms, i) => {
      acc += ms;
      if (i < scenes.length - 1) {
        timers.current.push(setTimeout(() => setScene(reducedMotion ? 3 : i + 1), acc));
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
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + 0.35;
        const dist = 130 + (i % 4) * 46;
        const shapeNames = ["scallop", "burst", "flower", "clover"] as const;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.82,
          size: 12 + (i % 3) * 7,
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
            {/* Scene 1: orbiting day-dots */}
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
                    animate={{ scale: [0, 1.15, 1] }}
                    transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                    style={{ width: 26, height: 26, borderRadius: "50%", background: GOLD, boxShadow: `0 0 34px ${GOLD_DEEP}` }}
                  />
                  {Array.from({ length: 7 }, (_, i) => {
                    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                        animate={{ opacity: 0.85, x: Math.cos(a) * 92, y: Math.sin(a) * 92, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.16, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.75)" }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 2: the morphing accumulation */}
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
                        rotate: 90,
                      }}
                      transition={{ duration: 2.3, ease: "easeInOut" }}
                    />
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 3: the burst + mortarboard */}
            <AnimatePresence>
              {scene === 2 && (
                <motion.div
                  key="burst"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.55 } }}
                  style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
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
                    <ExpressiveShape shape="scallop" size={150} gradient={[GOLD, GOLD_DEEP]} rotateDuration={60}>
                      <SchoolRounded sx={{ fontSize: 64, color: INK }} />
                    </ExpressiveShape>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scene 4: title card */}
            <AnimatePresence>
              {scene === 3 && (
                <motion.div
                  key="title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ position: "absolute", textAlign: "center", padding: 24 }}
                >
                  <motion.div
                    initial={{ y: 34, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Typography
                      sx={{
                        color: "#EDEDF0",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        fontSize: "clamp(2.1rem, 7vw, 3.6rem)",
                        lineHeight: 1.08,
                      }}
                    >
                      {title}
                    </Typography>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.7 }}
                  >
                    <Typography sx={{ color: GOLD, mt: 1.5, fontSize: 16, fontWeight: 600, letterSpacing: "0.04em" }}>
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
                {scene < 3 && <Caption key={scene} text={CAPTIONS[scene]} />}
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
