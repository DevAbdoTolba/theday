import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Button,
  useTheme, Tooltip, useMediaQuery, alpha, Menu, MenuItem,
  ListItemIcon, Divider
} from "@mui/material";
import {
  Search, Brightness4, Brightness7, ArrowBack, WifiOff,
  Menu as MenuIcon, VpnKey, ExpandMore, Check, School
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchDialog from "../components/SearchDialog";
import { ColorModeContext, offlineContext } from "../pages/_app";
import ModernKeyDialog from "./ModernKeyDialog";
import { DataContext } from "../context/TranscriptContext";

interface Props {
  title: string;
  isSearch?: boolean;
  isHome?: boolean;
  data?: any;
  onMenuClick?: () => void;
}

export default function ModernHeader({
  title,
  isSearch = true,
  isHome = false,
  data,
  onMenuClick,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const colorMode = React.useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOffline] = React.useContext(offlineContext);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  
  // Class Switching Logic
  const { className, setClassName, setLoadingTranscript } = React.useContext(DataContext);
  const [classes, setClasses] = useState<any[]>([]);
  const [classMenuAnchor, setClassMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const storedClasses = JSON.parse(localStorage.getItem("classes") as string) || [];
    setClasses(storedClasses);
  }, []);

  const handleClassMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setClassMenuAnchor(event.currentTarget);
  };
  const handleClassMenuClose = () => {
    setClassMenuAnchor(null);
  };
  const handleClassSelect = (c: any) => {
    if (localStorage.getItem(c.class) === null) {
      setLoadingTranscript(true);
    }
    setClassName(c.class);
    handleClassMenuClose();
    router.push(`/theday/q/${c.id}`);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(12px)",
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 60, md: 70 } }}>
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && typeof onMenuClick === "function" && (
              <IconButton onClick={onMenuClick} edge="start" color="inherit" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            {isOffline && (
              <Tooltip title="Offline Mode">
                <Box sx={{ bgcolor: "error.main", color: "white", borderRadius: 2, px: 1, py: 0.5 }}>
                  <WifiOff fontSize="small" />
                </Box>
              </Tooltip>
            )}

            {!isHome && (
              <IconButton edge="start" color="inherit" onClick={() => router.back()} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
            )}

            <Link href="/theday" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
              {isHome ? (
                <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>TheDay</Typography>
              ) : (
                <Typography variant="h6" fontWeight={700} noWrap sx={{ ml: 1 }}>{title}</Typography>
              )}
            </Link>
          </Box>

          {/* Center Search (Desktop) */}
          {!isMobile && isSearch && data && (
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={() => setSearchOpen(true)}
              sx={{
                width: 300,
                justifyContent: "flex-start",
                borderRadius: 3,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                textTransform: "none",
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Search... (Ctrl+K)
            </Button>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            
            {/* CLASS SWITCHER CONTROL */}
            {classes.length > 1 && (
              <>
                <Button
                  onClick={handleClassMenuOpen}
                  endIcon={<ExpandMore />}
                  size="small"
                  sx={{
                    color: 'inherit',
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    px: 1.5,
                    borderRadius: 2,
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  {className || "Class"}
                </Button>
                <Menu
                  anchorEl={classMenuAnchor}
                  open={Boolean(classMenuAnchor)}
                  onClose={handleClassMenuClose}
                  PaperProps={{ sx: { mt: 1.5, minWidth: 180, borderRadius: 2 } }}
                >
                  <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>Switch Class</Typography>
                  <Divider />
                  {classes.map((c) => (
                    <MenuItem key={c.id} onClick={() => handleClassSelect(c)} selected={c.class === className}>
                      <ListItemIcon><School fontSize="small" /></ListItemIcon>
                      <Typography fontWeight={c.class === className ? 700 : 400}>{c.class}</Typography>
                      {c.class === className && <Check fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            <Tooltip title="Transcript Key">
              <IconButton onClick={() => setKeyDialogOpen(true)} color="inherit">
                <VpnKey fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {(!isMobile || !data) && (
                <Tooltip title="Toggle Theme">
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                    {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                </Tooltip>
            )}
             {/* Mobile Search Icon */}
             {isMobile && isSearch && data && (
              <IconButton onClick={() => setSearchOpen(true)} color="inherit">
                <Search />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {data && <SearchDialog open={searchOpen} setOpen={setSearchOpen} data={data} />}
      <ModernKeyDialog open={keyDialogOpen} onClose={() => setKeyDialogOpen(false)} />
    </>
  );
}