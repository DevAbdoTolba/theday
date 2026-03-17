import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const StudyModeToggle = dynamic(() => import('./study/StudyModeToggle'), { ssr: false });
import {
  AppBar, Toolbar, Typography, Box, IconButton, Button,
  useTheme, Tooltip, useMediaQuery, alpha, Menu, MenuItem,
  ListItemIcon, Divider, Avatar
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchDialog from "../components/SearchDialog";
import { ColorModeContext, offlineContext } from "../pages/_app";
import ModernKeyDialog from "./ModernKeyDialog";
import { DataContext } from "../context/TranscriptContext";

// Dynamic imports for MUI icons
const Search = dynamic(() => import("@mui/icons-material/Search"), { ssr: false });
const Brightness4 = dynamic(() => import("@mui/icons-material/Brightness4"), { ssr: false });
const Brightness7 = dynamic(() => import("@mui/icons-material/Brightness7"), { ssr: false });
const ArrowBack = dynamic(() => import("@mui/icons-material/ArrowBack"), { ssr: false });
const WifiOff = dynamic(() => import("@mui/icons-material/WifiOff"), { ssr: false });
const MenuIcon = dynamic(() => import("@mui/icons-material/Menu"), { ssr: false });
const VpnKey = dynamic(() => import("@mui/icons-material/VpnKey"), { ssr: false });
const ExpandMore = dynamic(() => import("@mui/icons-material/ExpandMore"), { ssr: false });
const Check = dynamic(() => import("@mui/icons-material/Check"), { ssr: false });
const School = dynamic(() => import("@mui/icons-material/School"), { ssr: false });
const Logout = dynamic(() => import("@mui/icons-material/Logout"), { ssr: false });
const AdminPanelSettings = dynamic(() => import("@mui/icons-material/AdminPanelSettings"), { ssr: false });
const Shield = dynamic(() => import("@mui/icons-material/AdminPanelSettings"), { ssr: false }); // Using the shield/admin icon


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
  
  const { user, signOut } = useAuth();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

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
              <IconButton
                edge="start"
                color="inherit"
                onClick={async () => {
                  const storedClassName = localStorage.getItem("className");
                  if (!storedClassName) {
                    router.push("/");
                    return;
                  }
                  const storedClasses = JSON.parse(localStorage.getItem("classes") as string) || [];
                  const foundClass = storedClasses.find((c: any) => c.class === storedClassName);
                  if (foundClass && foundClass.id) {
                    router.push(`/theday/q/${foundClass.id}`);
                  } else {
                    router.push("/");
                  }
                }}
                sx={{ mr: 1 }}
              >
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

            {/* Study Mode Toggle — subject pages only */}
            {isSearch && <StudyModeToggle />}

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

            {(user?.isAdmin || user?.isSuperAdmin) && (
              <Tooltip title="Admin Dashboard">
                <IconButton 
                  onClick={() => router.push("/admin")} 
                  color="inherit"
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
                  }}
                >
                  <Shield fontSize="small" color="success" />
                </IconButton>
              </Tooltip>
            )}
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

            {user && (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    size="small"
                    sx={{ ml: 1, border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}` }}
                  >
                    <Avatar 
                      src={user.photoURL || ""} 
                      sx={{ width: 28, height: 28 }}
                    >
                      {user.displayName?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                  PaperProps={{
                    sx: { mt: 1.5, borderRadius: 2, minWidth: 200 }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{user.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  {user.isSuperAdmin && (
                    <MenuItem onClick={() => { setUserMenuAnchor(null); router.push("/sudo-1337"); }}>
                      <ListItemIcon>
                        <AdminPanelSettings fontSize="small" color="error" />
                      </ListItemIcon>
                      <Typography variant="body2">Sudo Panel</Typography>
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { setUserMenuAnchor(null); void signOut(); }}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {data && <SearchDialog open={searchOpen} setOpen={setSearchOpen} data={data} />}
      <ModernKeyDialog open={keyDialogOpen} onClose={() => setKeyDialogOpen(false)} />
    </>
  );
}