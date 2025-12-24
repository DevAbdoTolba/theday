import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  InputBase,
  Paper,
  Popper,
  Portal,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  ClickAwayListener,
  useTheme,
  useMediaQuery,
  Chip,
  IconButton,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import useSearchShortcut from "../hooks/useSearchShortcut";
import { useSearch } from "../context/SearchContext";
import { useDevOptions } from "../context/DevOptionsContext";

// Friendly placeholder suggestions that rotate
const placeholderSuggestions = [
  "Search by subject name...",
  "Try 'calculus' or any subject name",
  "Type part of any subject name...",
  "Search 'programming' or 'physics'...",
  "Find subjects by name or code...",
];

interface Subject {
  name: string;
  abbreviation: string;
}

interface Semester {
  index: number;
  subjects: Subject[];
}

interface Transcript {
  semesters: Semester[];
}

interface GoogleDriveSearchProps {
  transcript: Transcript | null;
  currentSemester: number;
}

// Keymap for keyboard navigation
enum KeyMap {
  ARROW_DOWN = "ArrowDown",
  ARROW_UP = "ArrowUp",
  ENTER = "Enter",
  ESCAPE = "Escape",
}

const SearchBar = styled(Paper)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: 650,
  margin: "0 auto",
  borderRadius: theme.shape.borderRadius * 3,
  padding: "12px 20px",
  background: theme.palette.background.paper,
  border: "2px solid transparent",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  // Rotating gradient border that travels around corners
  "&::before": {
    content: '""',
    position: "absolute",
    inset: -2,
    borderRadius: theme.shape.borderRadius * 3 + 2,
    padding: 2,
    background: `conic-gradient(
      from var(--angle, 0deg),
      transparent 0deg,
      transparent 300deg,
      ${theme.palette.primary.main} 330deg,
      ${theme.palette.secondary.main} 360deg
    )`,
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    animation: "rotateBorder 3s linear infinite",
  },
  // Fallback border for when animation is disabled
  "&::after": {
    content: '""',
    position: "absolute",
    inset: -2,
    borderRadius: theme.shape.borderRadius * 3 + 2,
    border: `2px solid ${theme.palette.divider}`,
    pointerEvents: "none",
  },
  "@keyframes rotateBorder": {
    "0%": { "--angle": "0deg" } as any,
    "100%": { "--angle": "360deg" } as any,
  },
  "@property --angle": {
    syntax: '"<angle>"',
    initialValue: "0deg",
    inherits: "false",
  },
  // Hover effect - slight scale up
  "&:hover": {
    transform: "scale(1.01)",
    "&::before": {
      background: `conic-gradient(
        from var(--angle, 0deg),
        transparent 0deg,
        transparent 270deg,
        ${theme.palette.primary.main} 300deg,
        ${theme.palette.secondary.main} 330deg,
        ${theme.palette.primary.light} 360deg
      )`,
    },
  },
  // Active/Click effect - bouncy
  "&:active": {
    animation: "searchBounce 0.3s ease",
  },
  "@keyframes searchBounce": {
    "0%": { transform: "scale(1)" },
    "30%": { transform: "scale(0.98)" },
    "60%": { transform: "scale(1.02)" },
    "100%": { transform: "scale(1)" },
  },
  // When focused, show solid border with glow
  "&:focus-within": {
    transform: "scale(1.02)",
    "&::before": {
      animation: "none",
      background: theme.palette.primary.main,
      opacity: 0.8,
    },
    "&::after": {
      borderColor: theme.palette.primary.main,
    },
    boxShadow: `0 0 0 4px ${theme.palette.primary.main}30, 0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "8px 8px 8px 0",
    fontSize: "1rem",
    fontWeight: 400,
    transition: theme.transitions.create("width"),
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
}));

const SearchResultItem = styled(ListItem)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    padding: "12px 16px",
    cursor: "pointer",
    position: "relative",
    backgroundColor: selected
      ? theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.08)
      : "transparent",
    borderRadius: theme.shape.borderRadius * 1.5,
    margin: "4px 8px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    border: selected 
      ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
      : "1px solid transparent",
    // Left accent bar for selected item
    "&::before": selected ? {
      content: '""',
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: 3,
      height: "60%",
      borderRadius: 2,
      backgroundColor: theme.palette.primary.main,
    } : {},
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.primary.main, 0.05),
      transform: "translateX(4px)",
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    "&:focus": {
      outline: "none",
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.15)
          : alpha(theme.palette.primary.main, 0.08),
    },
  })
);

export default function GoogleDriveSearch({
  transcript,
  currentSemester,
}: GoogleDriveSearchProps) {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ semester: Semester; subject: Subject }>
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const originalPositionRef = useRef<HTMLDivElement>(null);
  const [popperWidth, setPopperWidth] = useState<number | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [keyboardShortcut, setKeyboardShortcut] = useState<string>("Ctrl+K");
  const [isFocused, setIsFocused] = useState(false);
  
  // Dev options - sticky search bar is off by default
  const { options: devOptions } = useDevOptions();
  const stickyEnabled = devOptions.stickySearchBar;
  
  // Sticky search bar states (only used when dev option is enabled)
  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const lastChangeTime = useRef(0);
  
  // Intersection Observer - only active when sticky feature is enabled
  useEffect(() => {
    // Skip if sticky feature is disabled
    if (!stickyEnabled) {
      setIsScrolledPast(false);
      setIsExpanded(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const newValue = !entry.isIntersecting;
        const now = Date.now();
        
        // Minimal lockout of 50ms just to batch rapid events
        if (now - lastChangeTime.current < 50) {
          return;
        }
        
        if (isScrolledPast !== newValue) {
          lastChangeTime.current = now;
          setIsScrolledPast(newValue);
          if (!newValue) {
            setIsExpanded(false);
          }
        }
      },
      { 
        threshold: 0, 
        // Use a larger buffer zone to avoid edge triggering
        rootMargin: '-100px 0px 0px 0px'
      }
    );
    
    if (originalPositionRef.current) {
      observer.observe(originalPositionRef.current);
    }
    
    return () => observer.disconnect();
  }, [isScrolledPast, stickyEnabled]);
  
  // Rotating placeholder for variety
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Change placeholder periodically when not focused
  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholderSuggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  // Detect OS for appropriate shortcut display
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                  navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    setKeyboardShortcut(isMac ? "⌘K" : "Ctrl+K");
  }, []);

  // Direct keyboard shortcut implementation
  useEffect(() => {
    // Ctrl+K or / to open the search dialog
    const handleSearchShortcut = (e: KeyboardEvent) => {
      // Check for Ctrl+K (or Cmd+K on Mac)
      const isCtrlK = (e.ctrlKey || e.metaKey) && (e.code === "KeyK" || e.key.toLowerCase() === 'k');
      // Check for forward slash
      const isSlash = e.code === "Slash" || e.key === "/" || e.key === "ظ";
      
      // Only trigger when not already in a text input
      const isInputElement = ['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName || '');
      
      if ((isCtrlK || isSlash) && !isInputElement && !isOpen) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleSearchShortcut, { capture: true });
    
    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleSearchShortcut, { capture: true });
    };
  }, [isOpen]);
  
  // Globally disable browser's Ctrl+K shortcut
  useEffect(() => {
    // This handler will run for ALL Ctrl+K keydown events
    const disableBrowserCtrlK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === "KeyK" || e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Add event listeners at both document and window level with capture phase
    document.addEventListener("keydown", disableBrowserCtrlK, { capture: true });
    window.addEventListener("keydown", disableBrowserCtrlK, { capture: true });
    
    return () => {
      document.removeEventListener("keydown", disableBrowserCtrlK, { capture: true });
      window.removeEventListener("keydown", disableBrowserCtrlK, { capture: true });
    };
  }, []);
  
  // Auto-focus search input on page load
  useEffect(() => {
    // Small timeout to ensure the component is fully rendered
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter results when search query changes
  useEffect(() => {
    if (!transcript || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{ semester: Semester; subject: Subject }> = [];

    transcript.semesters.forEach((semester) => {
      semester.subjects.forEach((subject) => {
        if (
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({ semester, subject });
        }
      });
    });

    setSearchResults(results);
    setSelectedIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, transcript, currentSemester]);
  // Update popper width when search bar is resized
  useEffect(() => {
    const updateWidth = () => {
      if (searchBarRef.current) {
        setPopperWidth(searchBarRef.current.offsetWidth);
      }
    };

    // Initial width setting
    updateWidth();

    // Update on window resize
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  // This has been replaced by the useSearchShortcut hook

  // Handle keyboard navigation in dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults.length) return;

    switch (e.key) {
      case KeyMap.ARROW_DOWN:
        e.preventDefault();
        // Stop at the last item, don't loop
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;

      case KeyMap.ARROW_UP:
        e.preventDefault();
        // Stop at the first item, don't loop
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : prev
        );
        break;

      case KeyMap.ENTER:
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleItemClick(searchResults[selectedIndex].subject.abbreviation, searchResults[selectedIndex].semester.index);
        }
        break;

      case KeyMap.ESCAPE:
        setIsOpen(false);
        setSearchQuery("");
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setIsFocused(true);
    // When docked and focused, expand
    if (isScrolledPast) {
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // When scrolled past and no query, collapse back to docked
    if (isScrolledPast && !searchQuery) {
      setIsExpanded(false);
    }
  };

  const handleItemClick = (abbreviation: string, semesterIndex: number) => {
    // Set currentSemester in localStorage
    localStorage.setItem("currentSemester", semesterIndex.toString());
    router.push(`/subjects/${abbreviation}`);

    // Close the search and clear the query
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  // Determine visual state
  const isDocked = isScrolledPast && !isExpanded;
  const isExpandedState = isScrolledPast && isExpanded;

  return (
    <ClickAwayListener onClickAway={() => {
      setIsOpen(false);
      // Collapse when clicking away while expanded
      if (isScrolledPast && !searchQuery) {
        setIsExpanded(false);
      }
    }}>
      <Box
        ref={originalPositionRef}
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 650 },
          mx: "auto",
          my: 2,
          zIndex: isDocked || isExpandedState ? 1400 : 2,
          // Fixed height prevents layout shift (search bar ~60px + tip ~20px)
          height: 80,
        }}
      >
        {/* Backdrop when expanded - via Portal */}
        {isExpandedState && (
          <Portal>
            <Box
              onClick={() => {
                if (!searchQuery) setIsExpanded(false);
                inputRef.current?.blur();
              }}
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: alpha(theme.palette.background.default, 0.8),
                backdropFilter: 'blur(4px)',
                zIndex: 9998,
                animation: 'fadeIn 0.2s ease',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 },
                },
              }}
            />
          </Portal>
        )}

        {/* SearchBar - wrapped in Portal when docked/expanded */}
        {(isDocked || isExpandedState) ? (
          <Portal>
            <SearchBar 
              ref={searchBarRef} 
              elevation={isExpandedState ? 8 : 0}
              onClick={() => {
                inputRef.current?.focus();
                if (isDocked) {
                  setIsExpanded(true);
                }
              }}
              sx={{ 
                cursor: 'text',
                // Docked state: blend with navbar
                ...(isDocked && {
                  position: 'fixed',
                  top: isMobile ? 8 : 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: isMobile ? 140 : 400,
                  height: isMobile ? 40 : 44,
                  zIndex: 9999,
                  padding: isMobile ? '4px 10px' : '6px 12px',
                  // Match navbar background
                  bgcolor: alpha(theme.palette.background.default, 0.6),
                  backdropFilter: 'blur(8px)',
                  // Slide up + shrink from wider size (width shrinks faster)
                  animation: 'slideUpShrink 0.4s ease-out, breathingGlow 4s ease-in-out infinite 3.5s',
                  '@keyframes slideUpShrink': {
                    '0%': { 
                      opacity: 0, 
                      transform: 'translateX(-50%) translateY(15px) scaleX(1.6)' 
                    },
                    '50%': { 
                      opacity: 0.7, 
                      transform: 'translateX(-50%) translateY(6px) scaleX(1)' 
                    },
                    '100%': { 
                      opacity: 1, 
                      transform: 'translateX(-50%) translateY(0) scaleX(1)' 
                    },
                  },
                  '@keyframes breathingGlow': {
                    '0%, 100%': { boxShadow: 'none' },
                    '50%': { boxShadow: `0 0 15px 4px ${alpha(theme.palette.secondary.main, 0.35)}` },
                  },
                  // Subtle border
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  '&::before, &::after': {
                    display: 'none !important',
                  },
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                  },
                }),
                // Expanded state: fixed, full size, centered
                ...(isExpandedState && {
                  position: 'fixed',
                  top: 80,
                  left: '50%',
                  transform: 'translateX(-50%) scale(1)',
                  width: isMobile ? '90vw' : 650,
                  zIndex: 9999,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }),
              }}
            >
              <SearchIcon
                onClick={() => inputRef.current?.focus()}
                sx={{
                  color: isFocused ? theme.palette.primary.main : theme.palette.text.secondary,
                  mr: 1.5,
                  fontSize: isDocked ? 18 : 22,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
              <StyledInputBase
                placeholder={isDocked ? "Search..." : placeholderSuggestions[placeholderIndex]}
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                sx={{
                  '& input::placeholder': {
                    transition: 'opacity 0.3s ease',
                    opacity: 0.8,
                  },
                  '& input': {
                    fontSize: isDocked ? '0.85rem' : '1rem',
                  },
                }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ p: 0.5 }}
                  aria-label="clear search"
                >
                  <CloseIcon
                    sx={{
                      fontSize: 18,
                      color: theme.palette.text.secondary,
                    }}
                  />
                </IconButton>
              )}
            </SearchBar>
          </Portal>
        ) : (
          <SearchBar 
            ref={searchBarRef} 
            elevation={0}
            onClick={() => inputRef.current?.focus()}
            sx={{ 
              cursor: 'text',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <SearchIcon
              onClick={() => inputRef.current?.focus()}
              sx={{
                color: isFocused ? theme.palette.primary.main : theme.palette.text.secondary,
                mr: 1.5,
                fontSize: 22,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: !isFocused && !searchQuery ? 'pulse 2s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.1)', opacity: 1 },
                },
              }}
            />
            <StyledInputBase
              placeholder={placeholderSuggestions[placeholderIndex]}
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              sx={{
                '& input::placeholder': {
                  transition: 'opacity 0.3s ease',
                  opacity: 0.8,
                },
              }}
            />
            {searchQuery ? (
              <IconButton
                size="small"
                onClick={handleClearSearch}
                sx={{ p: 0.5 }}
                aria-label="clear search"
              >
                <CloseIcon
                  sx={{
                    fontSize: 18,
                    color: theme.palette.text.secondary,
                  }}
                />
              </IconButton>
            ) : (
              <Box
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  fontSize: { xs: "0.5rem", sm: "0.75rem" },
                  color: theme.palette.text.secondary,
                  display: { sm: "flex", xs: "none" },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" fontWeight={500}>
                  {keyboardShortcut}
                </Typography>
              </Box>
            )}
          </SearchBar>
        )}

        {/* Helper hint - always takes space but fades in/out */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 1.5,
            height: 20,
            opacity: !isFocused && !searchQuery ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: !isFocused && !searchQuery ? 'auto' : 'none',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            💡 Tip: Search by full name like <span 
              onClick={() => { setSearchQuery('Programming'); inputRef.current?.focus(); }}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >&quot;Programming&quot;</span> - no abbreviations needed!
          </Typography>
        </Box>

        <Popper
          open={isOpen && searchQuery.length > 0}
          anchorEl={searchBarRef.current}
          placement="bottom-start"
          style={{
            width: isExpandedState ? (isMobile ? '90vw' : 650) : (popperWidth || undefined),
            zIndex: 10000, // Above backdrop (9998) and search bar (9999)
            // When expanded, position fixed below the expanded search bar
            ...(isExpandedState && {
              position: 'fixed',
              top: 140,
              left: '50%',
              transform: 'translateX(-50%)',
            }),
          }}
          modifiers={[
            {
              name: 'offset',
              options: { offset: [0, 8] },
            },
          ]}
        >
          <Paper
            elevation={12}
            role="listbox"
            aria-label="Search results"
            aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
            sx={{
              width: "100%",
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              maxHeight: 400,
              display: "flex",
              flexDirection: "column",
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              boxShadow: theme.palette.mode === "dark" 
                ? `0 8px 32px ${alpha('#000', 0.4)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`
                : `0 8px 32px ${alpha('#000', 0.1)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)}`,
              // Custom scrollbar
              '& ::-webkit-scrollbar': {
                width: 6,
              },
              '& ::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '& ::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.text.secondary, 0.2),
                borderRadius: 3,
                '&:hover': {
                  background: alpha(theme.palette.text.secondary, 0.3),
                },
              },
            }}
          >
            {/* Results header with count */}
            {searchResults.length > 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  background: alpha(theme.palette.background.default, 0.5),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                </Typography>
                <Chip
                  size="small"
                  label={searchQuery}
                  onDelete={handleClearSearch}
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiChip-deleteIcon': {
                      fontSize: 14,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.error.main,
                      },
                    },
                  }}
                />
              </Box>
            )}
            
            {searchResults.length > 0 ? (
              <List 
                ref={listRef} 
                role="listbox"
                sx={{ 
                  py: 1,
                  px: 0.5,
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {searchResults.map((result, index) => (
                  <Link 
                    key={`${result.semester.index}-${result.subject.abbreviation}`}
                    href={`/subjects/${result.subject.abbreviation}`}
                    passHref 
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    onClick={() => handleItemClick(result.subject.abbreviation, result.semester.index)}
                  >
                    <SearchResultItem
                      id={`search-result-${index}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      selected={index === selectedIndex}
                      slots={{ root: 'div' }}
                      tabIndex={index === selectedIndex ? 0 : -1}
                    >
                      <Box sx={{ width: "100%", display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Subject info - left side */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            sx={{
                              color: index === selectedIndex 
                                ? theme.palette.primary.main 
                                : theme.palette.text.primary,
                              transition: 'color 0.2s ease',
                            }}
                          >
                            {result.subject.abbreviation}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ 
                              mt: 0.25,
                              fontSize: '0.85rem',
                              opacity: 0.85,
                            }}
                          >
                            {result.subject.name}
                          </Typography>
                        </Box>
                        
                        {/* Right side - Semester chip and Enter icon grouped together */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                          <Chip
                            label={`Sem ${result.semester.index}`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.65rem",
                              height: 22,
                              minWidth: 55,
                              bgcolor: alpha(
                                theme.palette.mode === "dark" ? '#6366f1' : '#4f46e5',
                                0.15
                              ),
                              color: theme.palette.mode === "dark" ? '#a5b4fc' : '#4f46e5',
                              border: `1px solid ${alpha(
                                theme.palette.mode === "dark" ? '#6366f1' : '#4f46e5',
                                0.2
                              )}`,
                            }}
                          />
                          
                          {/* Selection indicator with enter icon */}
                          {index === selectedIndex && (
                            <Box
                              sx={{
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.primary.main,
                              }}
                            >
                              <KeyboardReturnIcon sx={{ fontSize: 16 }} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </SearchResultItem>
                  </Link>
                ))}
              </List>
            ) : (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: "center",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SearchIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3) }} />
                <Typography color="text.secondary" fontWeight={500}>
                  No results found
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Try searching for &quot;{searchQuery}&quot; with different keywords
                </Typography>
              </Box>
            )}
            
            {/* Keyboard navigation hints footer - hidden on mobile */}
            {searchResults.length > 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  background: alpha(theme.palette.background.default, 0.5),
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                  >
                    <KeyboardArrowUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                  >
                    <KeyboardArrowDownIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    Navigate
                  </Typography>
                </Box>
                
                <Divider orientation="vertical" flexItem sx={{ opacity: 0.5 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.75,
                      height: 20,
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>
                      Enter
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    Select
                  </Typography>
                </Box>
                
                <Divider orientation="vertical" flexItem sx={{ opacity: 0.5 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.75,
                      height: 20,
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>
                      Esc
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    Close
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
