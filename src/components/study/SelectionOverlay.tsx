import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const CheckCircle = dynamic(() => import('@mui/icons-material/CheckCircle'), { ssr: false });

interface Props {
  isSelectable: boolean;
  isSelected: boolean;
}

export default function SelectionOverlay({ isSelectable, isSelected }: Props) {
  const theme = useTheme();

  if (!isSelectable) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: 10,
        border: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : `2px solid ${theme.palette.primary.main}`,
        transition: 'border-color 0.2s ease',
        // Pulsing border when selectable but not selected
        className: !isSelected ? 'study-selectable-border' : undefined,
      }}
      className={!isSelected ? 'study-selectable-border' : undefined}
    >
      {/* Selected state overlay */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            bgcolor: `${theme.palette.primary.main}20`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Check icon - animated entrance/exit */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              zIndex: 11,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <CheckCircle sx={{ fontSize: 20 }} />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
