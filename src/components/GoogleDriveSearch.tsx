import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  InputBase,
  Paper,
  Popper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  ClickAwayListener,
  useTheme,
  Chip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import useSearchShortcut from "../hooks/useSearchShortcut";
import { useSearch } from "../context/SearchContext";

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
  padding: "8px 16px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  "&:focus-within": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderColor: theme.palette.primary.main,
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
    padding: "8px 16px",
    cursor: "pointer",
    backgroundColor: selected
      ? theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)"
      : "transparent",
    borderRadius: theme.shape.borderRadius,
    transition: "background-color 0.2s ease-in-out",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
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
  const [popperWidth, setPopperWidth] = useState<number | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const [keyboardShortcut, setKeyboardShortcut] = useState<string>("Ctrl+K");

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
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;

      case KeyMap.ARROW_UP:
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;

      case KeyMap.ENTER:
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleItemClick(searchResults[selectedIndex].subject.abbreviation);
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
  };

  const handleItemClick = (abbreviation: string, semesterIndex: number) => {
    // Set currentSemester in localStorage
    localStorage.setItem("currentSemester", semesterIndex.toString());
    
    // Close the search and clear the query
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 650 },
          mx: "auto",
          my: 2,
        }}
      >
        <SearchBar ref={searchBarRef} elevation={0}>
          <SearchIcon
            sx={{
              color: theme.palette.text.secondary,
              mr: 1.5,
              fontSize: 22,
            }}
          />
          <StyledInputBase
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
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

        <Popper
          open={isOpen && searchQuery.length > 0}
          anchorEl={searchBarRef.current}
          placement="bottom-start"
          style={{
            width: popperWidth || undefined,
            zIndex: 1400,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              mt: 0.5,
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
              border: `1px solid ${theme.palette.divider}`,
              maxHeight: 450,
              overflowY: "auto",
            }}
          >
            {searchResults.length > 0 ? (
              <List ref={listRef} sx={{ py: 0.5 }}>
                {searchResults.map((result, index) => (
                  <React.Fragment
                    key={`${result.semester.index}-${result.subject.abbreviation}`}
                  >
                    <Link 
                      href={`/subjects/${result.subject.abbreviation}`}
                      passHref 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      onClick={() => handleItemClick(result.subject.abbreviation, result.semester.index)}
                    >
                      <SearchResultItem
                        selected={index === selectedIndex}
                        component="div" // Change to div since it's wrapped in Link
                      >
                        <Box sx={{ width: "100%" }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle1" fontWeight={500}>
                              {result.subject.abbreviation}
                            </Typography>
                            <Chip
                              label={`Semester ${result.semester.index}`}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.7rem",
                                height: 24,
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "#232f55"
                                    : "#e3e8f7",
                                color:
                                  theme.palette.mode === "dark"
                                    ? "#fff"
                                    : theme.palette.text.primary,
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {result.subject.name}
                          </Typography>
                        </Box>
                      </SearchResultItem>
                    </Link>
                    {index < searchResults.length - 1 && (
                      <Divider sx={{ my: 0.5, opacity: 0.6 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No results found for &quot;{searchQuery}&quot;
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
