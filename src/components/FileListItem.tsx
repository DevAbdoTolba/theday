import React, { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Chip, useTheme, Paper, Tooltip, alpha
} from '@mui/material';
import { ParsedFile } from '../utils/types';
import { selectionStore } from '../utils/selectionStore';

// Dynamic imports for MUI icons
const PictureAsPdf = dynamic(() => import('@mui/icons-material/PictureAsPdf'), { ssr: false });
const Folder = dynamic(() => import('@mui/icons-material/Folder'), { ssr: false });
const ImageIcon = dynamic(() => import('@mui/icons-material/Image'), { ssr: false });
const YouTube = dynamic(() => import('@mui/icons-material/YouTube'), { ssr: false });
const Article = dynamic(() => import('@mui/icons-material/Article'), { ssr: false });
const Slideshow = dynamic(() => import('@mui/icons-material/Slideshow'), { ssr: false });
const TableChart = dynamic(() => import('@mui/icons-material/TableChart'), { ssr: false });
const InsertDriveFile = dynamic(() => import('@mui/icons-material/InsertDriveFile'), { ssr: false });
const OpenInNew = dynamic(() => import('@mui/icons-material/OpenInNew'), { ssr: false });
const Visibility = dynamic(() => import('@mui/icons-material/Visibility'), { ssr: false });
const PlayCircle = dynamic(() => import('@mui/icons-material/PlayCircle'), { ssr: false });
const FolderOpen = dynamic(() => import('@mui/icons-material/FolderOpen'), { ssr: false });
const CheckCircle = dynamic(() => import('@mui/icons-material/CheckCircle'), { ssr: false });

// Left-side File Type Icon
const FileIcon = ({ type }: { type: ParsedFile['type'] }) => {
  switch (type) {
    case 'pdf': return <PictureAsPdf color="error" />;
    case 'folder': return <Folder color="primary" />;
    case 'image': return <ImageIcon color="secondary" />;
    case 'youtube': return <YouTube color="error" />;
    case 'video': return <YouTube color="action" />;
    case 'doc': return <Article color="primary" />;
    case 'slide': return <Slideshow color="warning" />;
    case 'sheet': return <TableChart color="success" />;
    default: return <InsertDriveFile color="disabled" />;
  }
};

interface Props {
  file: ParsedFile;
  onClick: () => void;
  isNew?: boolean;
  // Study Mode props
  studyModeActive?: boolean;
  onStudySelect?: (file: ParsedFile) => void;
}

const FileListItemBase = ({
  file,
  onClick,
  isNew,
  studyModeActive = false,
  onStudySelect,
}: Props) => {
  const theme = useTheme();
  // Study mode only applies to non-folder items
  const studySelectable = studyModeActive && file.type !== 'folder';
  // Subscribe directly — only THIS row re-renders when its selection changes
  const rawSelected = useSyncExternalStore(
    selectionStore.subscribe,
    () => selectionStore.isSelected(file.id),
    () => false,
  );
  // Only show selection visuals when study mode is active
  const isSelected = studySelectable && rawSelected;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (studySelectable) {
      onStudySelect?.(file);
    } else {
      onClick();
    }
  };

  // Right-side Action Icon Logic
  const getActionIcon = () => {
    if (studySelectable && isSelected) return <CheckCircle fontSize="small" color="primary" />;
    if (file.type === 'folder') return <FolderOpen fontSize="small" />;
    if (file.type === 'youtube' || file.type === 'video') return <PlayCircle fontSize="small" />;
    return <Visibility fontSize="small" />;
  };

  return (
    <Paper
      component="a"
      href={file.url}
      onClick={handleClick}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        mb: 1,
        textDecoration: 'none',
        borderRadius: 2,
        border: `1px solid ${
          isSelected
            ? theme.palette.primary.main
            : isNew
              ? theme.palette.success.main
              : theme.palette.divider
        }`,
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        bgcolor: isSelected
          ? alpha(theme.palette.primary.main, 0.06)
          : isNew
            ? `${theme.palette.success.main}08`
            : 'transparent',
        '&:hover': {
          bgcolor: isSelected
            ? alpha(theme.palette.primary.main, 0.10)
            : theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
          transform: 'translateX(4px)',
        },
      }}
    >
      {/* File Type Icon */}
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <FileIcon type={file.type} />
      </Box>

      {/* File Name */}
      <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
        <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
          {file.name}
        </Typography>
      </Box>

      {/* Type Chip (Hidden on mobile) */}
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 2, alignItems: 'center' }}>
        <Chip 
          label={file.type.toUpperCase()} 
          size="small" 
          variant="outlined" 
          color={file.type === 'youtube' ? 'error' : 'default'}
          sx={{ fontSize: '0.65rem', height: 20, width: 70 }} 
        />
        {isNew && (
          <Chip 
            label="NEW" 
            size="small" 
            color="success"
            sx={{ 
              fontSize: '0.65rem', 
              height: 20,
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      {/* Action Icon */}
      <Tooltip title="Open">
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', opacity: 0.7 }}>
          {getActionIcon()}
        </Box>
      </Tooltip>
    </Paper>
  );
};

export const FileListItem = React.memo(FileListItemBase, (prev, next) =>
  prev.file === next.file &&
  prev.studyModeActive === next.studyModeActive &&
  prev.isNew === next.isNew
);