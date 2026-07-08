// src/components/grad/ExpressiveShape.tsx
// A Material 3 Expressive shape container: renders one of the preset
// shapes and (optionally) slow-morphs through a cycle of them while
// gently rotating. Children are centered on top and never rotate.

import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { SHAPES, SHAPE_VIEWBOX, ShapeName } from "./expressiveShapes";

interface Props {
  /** single shape, or a cycle of shapes to morph through */
  shape: ShapeName | ShapeName[];
  size: number | string;
  fill?: string;
  /** [from, to] linear gradient — wins over fill */
  gradient?: [string, string];
  /** seconds for one morph loop (only if multiple shapes) */
  morphDuration?: number;
  /** seconds for a full rotation; 0 disables spin */
  rotateDuration?: number;
  stroke?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

let gradientSeq = 0;

export default function ExpressiveShape({
  shape,
  size,
  fill = "currentColor",
  gradient,
  morphDuration = 14,
  rotateDuration = 0,
  stroke,
  strokeWidth = 0,
  children,
  style,
  className,
}: Props) {
  const gradId = useMemo(() => `grad-shape-${++gradientSeq}`, []);

  const names = Array.isArray(shape) ? shape : [shape];
  const paths = names.map((n) => SHAPES[n]);
  // close the loop for seamless repetition
  const dKeyframes = paths.length > 1 ? [...paths, paths[0]] : paths;

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      style={style}
    >
      <motion.svg
        viewBox={SHAPE_VIEWBOX}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        animate={rotateDuration > 0 ? { rotate: 360 } : undefined}
        transition={
          rotateDuration > 0
            ? { rotate: { duration: rotateDuration, repeat: Infinity, ease: "linear" } }
            : undefined
        }
        aria-hidden
      >
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <motion.path
          d={paths[0]}
          animate={dKeyframes.length > 1 ? { d: dKeyframes } : undefined}
          transition={
            dKeyframes.length > 1
              ? { duration: morphDuration, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
          fill={gradient ? `url(#${gradId})` : fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
      {children && (
        <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
