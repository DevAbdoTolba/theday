import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  useTheme,
  Tooltip,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Search,
  Brightness4,
  Brightness7,
  ArrowBack,
  WifiOff,
  Menu as MenuIcon // Import Menu Icon
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchDialog from "../components/SearchDialog";
import { ColorModeContext } from "../pages/_app";
import { offlineContext } from "../pages/_app";

interface Props {
  title: string;
  isSearch?: boolean;
  isHome?: boolean;
  data?: any;
  onMenuClick?: () => void; // Add this prop
}

export default function ModernHeader({ title, isSearch = true, data, onMenuClick }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const colorMode = React.useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOffline] = React.useContext(offlineContext);

  const isHomePage = router.pathname.includes("/theday");

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
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 60, md: 70 },
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {/* Show Menu Button on Mobile if onMenuClick is provided */}
            {onMenuClick && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={onMenuClick}
                sx={{ mr: 1, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {isOffline && (
              <Tooltip title="You are offline. Content may be outdated.">
                <Box
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    animation: "pulse 2s infinite",
                  }}
                >
                  <WifiOff fontSize="small" />
                </Box>
              </Tooltip>
            )}
            
            {!isHomePage && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => router.back()}
                sx={{ mr: 1 }}
              >
                <ArrowBack />
              </IconButton>
            )}

            <Link
              href="/theday"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              {!isHomePage ? (
                <Typography variant="h6" fontWeight={700} noWrap sx={{ ml: 1 }}>
                  {title}
                </Typography>
              ) : (
                <Box display="flex" flexDirection="column">
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ letterSpacing: "-0.5px" }}
                  >
                    TheDay
                  </Typography>
                </Box>
              )}
            </Link>
          </Box>

          {!isMobile && isSearch && data && (
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={() => setSearchOpen(true)}
              sx={{
                width: 400,
                justifyContent: "flex-start",
                borderRadius: 3,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                textTransform: "none",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              Search... (Ctrl+K)
            </Button>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && isSearch && data && (
              <IconButton onClick={() => setSearchOpen(true)} color="inherit">
                <Search />
              </IconButton>
            )}

            <Tooltip title="Toggle Theme">
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {data && (
        <SearchDialog open={searchOpen} setOpen={setSearchOpen} data={data} />
      )}
    </>
  );
}