import React from 'react';
import { 
  Paper, Typography, Box, Chip, Grid, 
  IconButton, Collapse, useTheme, alpha 
} from '@mui/material';
import { School, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Subject {
  name: string;
  abbreviation: string;
}

interface SemesterCardProps {
  semesterIndex: number;
  subjects: Subject[];
  isCurrent?: boolean;
}

export default function SemesterCard({ semesterIndex, subjects, isCurrent = false }: SemesterCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(true);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={isCurrent ? 4 : 1}
        sx={{
          p: 0,
          borderRadius: 4,
          overflow: 'hidden',
          height: '100%',
          border: isCurrent 
            ? `2px solid ${theme.palette.primary.main}` 
            : `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          }
        }}
      >
        {/* Header */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            p: 2,
            background: isCurrent 
              ? alpha(theme.palette.primary.main, 0.1) 
              : alpha(theme.palette.background.default, 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: isCurrent ? theme.palette.primary.main : theme.palette.action.selected,
                color: isCurrent ? '#fff' : theme.palette.text.secondary,
                display: 'flex'
              }}
            >
              <School fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
              {semesterIndex === -2 ? "My Shortcuts" : `Semester ${semesterIndex}`}
            </Typography>
            {isCurrent && (
              <Chip 
                label="Current" 
                size="small" 
                color="primary" 
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} 
              />
            )}
          </Box>
          <IconButton size="small">
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>

        {/* Subjects Grid */}
        <Collapse in={expanded}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {subjects.map((subj) => (
                <Grid item xs={6} sm={12} md={6} key={subj.abbreviation}>
                  <Link href={`/subjects/${subj.abbreviation}`} passHref style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        }
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={800} 
                        color="primary"
                        noWrap
                      >
                        {subj.abbreviation}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 1,
                          lineHeight: 1.2
                        }}
                      >
                        {subj.name}
                      </Typography>
                    </Box>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  );
}