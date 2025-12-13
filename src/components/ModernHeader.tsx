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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchDialog from "../components/SearchDialog";
import { ColorModeContext, offlineContext } from "../pages/_app";
import { VpnKey } from "@mui/icons-material";
import ModernKeyDialog from "./ModernKeyDialog";
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
            {/* Offline Indicator */}
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

            {/* Back Button */}
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

            {/* Title */}
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
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{ letterSpacing: "-0.5px" }}
                >
                  TheDay
                </Typography>
              )}
            </Link>
          </Box>

          {/* --- DESKTOP SEARCH BUTTON --- */}
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
          {/* ============================================= */}
          {/* THE "INTERESTING" BURGER BUTTON (Phone Only) */}
          {/* ============================================= */}
          {isMobile && typeof onMenuClick === "function" && (
            <Box
              onClick={onMenuClick}
              sx={{
                display: { xs: "block", md: "none" }, // Only visible on mobile
                mr: 2,
                cursor: "pointer",
                width: 30,
                height: 30,
              }}
            >
              <motion.div
                whileTap={{ scale: 0.9, rotate: 90 }}
                whileHover={{ rotate: 180 }}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.8 }}
                    animate={{
                      filter: [
                        "hue-rotate(0deg)",
                        "hue-rotate(90deg)",
                        "hue-rotate(0deg)",
                      ],
                      borderRadius: ["30%", "50%", "30%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.2,
                    }}
                    style={{
                      backgroundColor: theme.palette.primary.main,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ))}
              </motion.div>
            </Box>
          )}
          {/* ============================================= */}

          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Insert Transcript Key">
              <IconButton
                onClick={() => setKeyDialogOpen(true)}
                color="inherit"
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: 3,
                  p: 1,
                }}
              >
                <VpnKey fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* HIDE Search Icon on Mobile (Solved Duplicate Search Bar Issue) */}
            {!isMobile && isSearch && data && (
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
      <ModernKeyDialog open={keyDialogOpen} onClose={() => setKeyDialogOpen(false)} />
    </>
  );
}
