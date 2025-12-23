import * as React from "react";
import dynamic from "next/dynamic";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import {
  Box,
  Chip,
  Divider,
  TextField,
  Typography,
  useTheme,
  Badge,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { motion, AnimatePresence } from "framer-motion";
import { useIndexedContext } from "../context/IndexedContext";
import useMediaQuery from "@mui/material/useMediaQuery";

// Dynamic imports for MUI icons
const SearchIcon = dynamic(() => import("@mui/icons-material/Search"), { ssr: false });
const AddIcon = dynamic(() => import("@mui/icons-material/Add"), { ssr: false });
const ClearIcon = dynamic(() => import("@mui/icons-material/Clear"), { ssr: false });

interface Data {
  id: string;
  mimeType: string;
  name: string;
  parents: string[];
  size: number;
}

interface DataMap {
  [key: string]: Data[];
}

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: DataMap;
}


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function AlertDialogSlide({ open, setOpen, data }: Props) {
  const { updatedItems } = useIndexedContext();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = React.useState("");
  const [folder, setFolder] = React.useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filtersArray = [
    ...Object.keys(data),
    ...(updatedItems.length > 0 ? ["New"] : []),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e?.target?.value);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSearch("");
      setFolder("");
    }, 15);
  };

  React.useEffect(() => {
    if (open) {
      searchRef?.current?.focus();
    }
    return () => {
      setFolder("");
    };
  }, [open]);

  // Filtered section keys
  const filteredKeys = Object.keys(data || {}).filter((key) => {
    if (folder && key !== folder && folder !== "New") return false;
    return data[key]?.some((subject) =>
      subject?.name?.toLowerCase()?.includes(search?.toLowerCase()) &&
      (folder === "New"
        ? updatedItems.includes(subject?.id)
        : folder === "" || key === folder)
    );
  });

  return (
    <>
     
      <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
          fullWidth
          maxWidth={false}
          sx={{
            zIndex: 1302,
            '& .MuiDialog-paper': {
              width: { xs: '100vw', sm: '50vw' },  // full width on mobile, custom on desktop
              maxWidth: { xs: '90vw', sm: '95vw' },
              minWidth: {xs: "100vw" ,sm:'320px'},
              minHeight: { xs: '100dvh', sm: '90dvh' }, // full height on mobile, auto on desktop
              height: { xs: '100vh', sm: '90dvh' }, // full height on mobile
              backgroundColor: theme.palette.background.paper ,
              backgroundImage: 'none',
              position: { xs: 'fixed', sm: 'absolute' },
              // top: { xs: '3%', sm: '3%' },
              margin: '0 !important',
              padding: { xs: 1, sm: 3 },
              border: `1.5px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[8],

              borderRadius: { xs: 0, sm: 4 }, // No border radius on mobile, rounded on desktop
              top: { xs: 0, sm: 'auto' },
            },
          }}
        >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 28 }} />
          <TextField
            inputRef={searchRef}
            value={search}
            onChange={handleChange}
            placeholder="Search..."
            variant="standard"
            fullWidth
            InputProps={{
              disableUnderline: true,
              style: {
                fontSize: '1.15rem',
                background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100],
                borderRadius: 8,
                padding: '8px 16px',
                color: theme.palette.text.primary,
              },
            }}
            sx={{
              flex: 1,
              background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100],
              borderRadius: 2,
              boxShadow: theme.shadows[0],
            }}
          />
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 56,
              ml: 1,
              px: 2,
              py: 1,
              color: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[50],
              '&:hover': {
                background: theme.palette.action.hover ,
              },
            }}
          >
            ESC
          </Button>
        </DialogTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, px: 3 }}>
          {filtersArray.map((filteredFolder, index) => (
            <Chip
              key={index}
              label={filteredFolder}
              clickable
              color={folder === filteredFolder ? 'primary' : filteredFolder === 'New' ? 'info' : 'default'}
              variant={folder === filteredFolder ? 'filled' : 'outlined'}
              onClick={() => {
                if (filteredFolder === folder) {
                  setFolder("");
                } else setFolder(filteredFolder);
              }}
              deleteIcon={folder === filteredFolder ? <ClearIcon /> : <AddIcon />}
              onDelete={() => {
                if (filteredFolder === folder) {
                  setFolder("");
                } else setFolder(filteredFolder);
              }}
              sx={{
                fontWeight: 500,
                fontSize: '0.95em',
                px: 1.5,
                background: folder === filteredFolder
                  ? theme.palette.mode === 'dark'
                    ? theme.palette.primary.dark
                    : theme.palette.primary.light
                  : undefined,
                color: folder === filteredFolder
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              }}
            />
          ))}
        </Box>
        <Divider sx={{mb:1}}/>
        <DialogContent sx={{ px: 3, pt: 0, pb: 2 }}>
          <AnimatePresence>
            {filteredKeys.length === 0 && (
              <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
                No results found.
              </Typography>
            )}
            {filteredKeys.map((key, index) => (
              <motion.div
                key={index}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      gap: 1,
                      flexWrap: 'nowrap',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        maxWidth: { xs: '70vw', sm: 'none' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {key}
                    </Typography>
                    <Badge
                      badgeContent={data[key].length}
                      sx={{
                        ml: { xs: 1, sm: 3 },
                        '& .MuiBadge-badge': {
                          fontSize: { xs: '0.75rem', sm: '0.9rem' },
                          minWidth: { xs: 18, sm: 22 },
                          height: { xs: 18, sm: 22 },
                        },
                      }}
                    />
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data[key]
                      ?.filter((subject) =>
                        subject?.name?.toLowerCase()?.includes(search?.toLowerCase()) &&
                        (folder === 'New'
                          ? updatedItems.includes(subject.id)
                          : true)
                      )
                      ?.map((subject, idx) => {
                        const displayName = (() => {
                          let name = subject?.name;
                          if (name.includes("%20")) {
                            name = name.replace(/%20/g, " ");
                          }
                          if (name.includes("http")) {
                            let url: URL | string = "";
                            let name_split = name.split(" ");
                            let urlIndex = name_split.findIndex((name) =>
                              name.includes("http")
                            );
                            const name_split_no_url = name_split.filter(
                              (name) => !name.includes("http")
                            );
                            if (name_split_no_url.length > 0) {
                              return name_split_no_url.join(" ");
                            }
                            try {
                              url = new URL(name_split[urlIndex]);
                              if (url.hostname.includes("youtube")) {
                                url.hostname = "yout-ube.com";
                              }
                              return url.hostname;
                            } catch {
                              try {
                                url = new URL(
                                  decodeURIComponent(name_split[urlIndex])
                                );
                              } catch {
                                return subject?.name;
                              }
                            }
                          }
                          return subject?.name;
                        })();

                        const validURL = (() => {
                          if (subject?.name.includes("http")) {
                            let url: URL | string = "";
                            let name_split = subject.name.split(" ");
                            let urlIndex = name_split.findIndex((name) =>
                              name.includes("http")
                            );
                            try {
                              url = new URL(name_split[urlIndex]);
                              if (url.hostname.includes("youtube")) {
                                url.hostname = "yout-ube.com";
                              }
                              return url.href;
                            } catch {
                              try {
                                url = new URL(
                                  decodeURIComponent(name_split[urlIndex])
                                );
                                if (url.hostname.includes("youtube")) {
                                  url.hostname = "yout-ube.com";
                                }
                                return url.href;
                              } catch {
                                return null;
                              }
                            }
                          }
                          return null;
                        })();

                        return (
                          <Button
                            href={
                              validURL ||
                              `https://drive.google.com/file/d/${subject?.id}/preview`
                            }
                            target="_blank"
                            key={idx}
                            sx={{
                              all: 'unset',
                              backgroundColor:
                                theme.palette.mode === 'dark'
                                  ? theme.palette.background.default
                                  : theme.palette.grey[50],
                              padding: '0.7ch 1.2ch 0.7ch 2.5ch',
                              wordBreak: 'break-all',
                              lineHeight: '1.5rem',
                              borderRadius: 2,
                              color: theme.palette.text.primary,
                              fontSize: '1.05rem',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'background 0.15s, color 0.15s',
                              border: `1px solid ${theme.palette.divider}`,
                              '&:hover': {
                                backgroundColor:
                                  theme.palette.mode === 'dark'
                                    ? "#2563eb"
                                    : "#bcd0fa",
                                color: theme.palette.mode === 'dark'
                                  ? theme.palette.primary.light
                                  : theme.palette.primary.dark,
                              },
                              textAlign: 'left',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <Typography
                                sx={{
                                  color: 'inherit',
                                  textAlign: 'left',
                                }}
                              >
                                {displayName}
                              </Typography>
                                {(() => {
                                const type = subject.mimeType;
                                if (type?.startsWith('video/')) return <Chip size="small" label="Video" sx={{ bgcolor: 'rgba(3, 169, 244, 0.15)', color: theme.palette.text.primary }} />;
                                if (type?.startsWith('image/')) return <Chip size="small" label="Image" sx={{ bgcolor: 'rgba(76, 175, 80, 0.15)', color: theme.palette.text.primary }} />;
                                if (type === 'application/pdf') return <Chip size="small" label="PDF" sx={{ bgcolor: 'rgba(244, 67, 54, 0.15)', color: theme.palette.text.primary }} />;
                                if (type?.includes('presentation')) return <Chip size="small" label="Slides" sx={{ bgcolor: 'rgba(255, 152, 0, 0.15)', color: theme.palette.text.primary }} />;
                                if (type?.includes('spreadsheet')) return <Chip size="small" label="Sheet" sx={{ bgcolor: 'rgba(156, 39, 176, 0.15)', color: theme.palette.text.primary }} />;
                                if (type?.includes('document')) return <Chip size="small" label="Doc" sx={{ bgcolor: 'rgba(33, 150, 243, 0.15)', color: theme.palette.text.primary }} />;
                                if (type?.includes('audio')) return <Chip size="small" label="Audio" sx={{ bgcolor: 'rgba(156, 39, 176, 0.15)', color: theme.palette.text.primary }} />;
                                if (validURL) {
                                  if (validURL.includes('youtube') || validURL.includes('yout-ube')) 
                                  return <Chip size="small" label="YouTube" sx={{ bgcolor: 'rgba(244, 67, 54, 0.38)', color: theme.palette.text.primary }} />;
                                  return <Chip size="small" label="URL" sx={{ bgcolor: 'rgba(33, 150, 243, 0.15)', color: theme.palette.text.primary }} />;
                                }
                                if (type === 'application/vnd.google-apps.folder') return <Chip size="small" label="Folder" sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(158, 158, 158, 0.2)' : 'rgba(158, 158, 158, 0.15)', color: theme.palette.text.primary }} />;
                                return <Chip size="small" label="Material" sx={{ bgcolor: 'rgba(97, 97, 97, 0.15)', color: theme.palette.text.primary }} />;
                                })()}
                            </Box>
                          </Button>
                        );
                      })}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
