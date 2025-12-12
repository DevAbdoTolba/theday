import { motion } from 'framer-motion';
import React from 'react';

export const TapWrapper = ({ children, onClick, sx }: any) => (
  <motion.div
    whileTap={{ scale: 0.97 }} // Subtle shrink effect
    whileHover={{ scale: 1.01 }} // Subtle lift effect
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    onClick={onClick}
    style={{ height: '100%', width: '100%', ...sx }}
  >
    {children}
  </motion.div>
);