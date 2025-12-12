import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, IconButton, 
  Button, useTheme, Tooltip, useMediaQuery, alpha 
} from '@mui/material';
import { 
  Search, Brightness4, Brightness7, Home,
  Menu as MenuIcon, ArrowBack
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchDialog from '../components/SearchDialog'; // Assuming you keep your existing search dialog logic
import { ColorModeContext } from '../pages/_app';

interface Props {
  title: string;
  isSearch?: boolean; // If true, shows search icon
  isHome?: boolean;   // If true, we are on home page
  data?: any;         // Data for search dialog
}

export default function ModernHeader({ title, isSearch = true, data }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const colorMode = React.useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchOpen, setSearchOpen] = useState(false);

  const isHomePage = router.pathname.includes('/theday');

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(12px)',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          zIndex: 1200
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 60, md: 70 } }}>
          
          {/* LEFT: Branding or Back Button */}
          <Box display="flex" alignItems="center" gap={1}>
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
            
            <Link href="/theday" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              {!isHomePage ? (
                 <Typography variant="h6" fontWeight={700} noWrap sx={{ ml: 1 }}>
                   {title}
                 </Typography>
              ) : (
                <Box display="flex" flexDirection="column">
                  <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
                    TheDay
                  </Typography>
                </Box>
              )}
            </Link>
          </Box>

          {/* CENTER: Search Bar (Desktop) */}
          {!isMobile && isSearch && data && (
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={() => setSearchOpen(true)}
              sx={{
                width: 400,
                justifyContent: 'flex-start',
                borderRadius: 3,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Search for subjects, files... (Ctrl+K)
            </Button>
          )}

          {/* RIGHT: Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Mobile Search Icon */}
            {isMobile && isSearch && data && (
              <IconButton onClick={() => setSearchOpen(true)} color="inherit">
                <Search />
              </IconButton>
            )}

            <Tooltip title="Toggle Theme">
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Global Search Dialog Connection */}
      {data && <SearchDialog open={searchOpen} setOpen={setSearchOpen} data={data} />}
    </>
  );
}