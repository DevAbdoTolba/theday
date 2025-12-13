import { Box, Typography, CircularProgress } from '@mui/material';
import { Inbox, SentimentDissatisfied } from '@mui/icons-material';

interface Props {
  type: 'loading' | 'empty' | 'error';
  message?: string;
}

export default function VisualState({ type, message }: Props) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={10} 
      gap={2}
      color="text.secondary"
    >
      {type === 'loading' && <CircularProgress size={40} thickness={4} />}
      {type === 'empty' && <Inbox sx={{ fontSize: 60, opacity: 0.5 }} />}
      {type === 'error' && <SentimentDissatisfied sx={{ fontSize: 60, color: 'error.main', opacity: 0.8 }} />}
      
      {message && <Typography variant="body2" fontWeight={600}>{message}</Typography>}
    </Box>
  );
}