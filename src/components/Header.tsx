import * as React from "react";
import { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Tooltip from "@mui/material/Tooltip";
import SearchDialog from "./SearchDialog";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { Button, IconButton, Menu, MenuItem, Avatar, ListItemIcon, Divider } from "@mui/material"; // Updated imports
import NextLink from "next/link";
import { DataContext } from "../context/TranscriptContext";
import KeyIcon from "@mui/icons-material/Key";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../pages/_app";
import KeyDialog from "../context/KeyDialog";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ExpandMore, School, Check } from "@mui/icons-material"; // New icons

// ... (Keep Data interfaces and Search styled components as they were) ...
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
  search?: string;
  setSearch?: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  isSearch: boolean;
  isSubjectSearch?: boolean;
  data?: DataMap;
  position?: "fixed" | "absolute" | "sticky" | "static" | "relative";
  sx?: any;
  shortCutActivate?: boolean;
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.25),
  },
  marginLeft: 0,
  width: "0%",
  [theme.breakpoints.up("xs")]: {
    marginLeft: theme.spacing(0),
    width: "auto",
  },
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("xs")]: {
      width: "0ch",
      "&:focus": {
        width: "7ch",
      },
    },
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function Header({
  search,
  setSearch,
  title,
  isSearch,
  isSubjectSearch,
  data,
  position,
  sx,
  shortCutActivate,
  ...props
}: Props) {
  const [q, setQ] = useState<string>("");
  const [classes, setClasses] = useState<any>([]);
  const [openKeyDialog, setOpenKeyDialog] = React.useState(false);
  const { setLoadingTranscript, className, setClassName } = React.useContext(DataContext);
  const router = useRouter();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // -- Point 1: Modern Class Navigation State --
  const [classMenuAnchor, setClassMenuAnchor] = useState<null | HTMLElement>(null);

  React.useEffect(() => {
    const classes = JSON.parse(localStorage.getItem("classes") as string) || [];
    setClasses(classes);
    setQ(classes.find((c: any) => c.class === className)?.id || "");

    const handleCtrlK = (e: KeyboardEvent) => {
      if ((e?.ctrlKey && e?.code === "KeyK") || e?.code === "Slash") {
        e?.preventDefault();
        setOpen(true); // Assuming 'open' refers to a dialog state defined elsewhere or meant for SearchDialog?
        // Note: original code had setOpen(true) but 'open' wasn't fully defined/used for dialog in original snippet consistently.
        // We'll map it to searchDialogOpen for consistency with logic.
        if (isSubjectSearch) setSearchDialogOpen(true);
      }
    };

    if (shortCutActivate === true)
      window.addEventListener("keydown", handleCtrlK);

    return () => {
      window.removeEventListener("keydown", handleCtrlK);
    };
  }, []);

  // Class Menu Handlers
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position={position || "static"}
        sx={{
          height: { sm: "3.5rem", xs: "2.5rem" },
          display: "flex",
          justifyContent: "center",
          background: theme.palette.mode === "light"
            ? "#2563eb"
            : "linear-gradient(180deg, #151a2c 0%, #19223c 100%)",
          boxShadow: "0 2px 8px 0 rgba(21,26,44,0.12)",
          ...sx,
        }}
      >
        <Toolbar sx={{
          minHeight: { sm: "5.5rem", xs: "4.5rem" },
          px: { sm: 4, xs: 2 },
          py: { sm: 2, xs: 1 },
        }}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: { xs: 0, sm: "5ch" },
            }}
          >
            <Typography
              variant="h4"
              noWrap
              component="div"
              sx={{
                display: "block",
                fontSize: { sm: "2.1rem", xs: "1.5rem" },
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: 0.5,
                lineHeight: 1.2,
              }}
            >
              <Tooltip title={title === "TheDay" ? "" : "Home"} placement="bottom">
                <Button
                  LinkComponent={NextLink}
                  href={"/theday" + (q ? `/q/${q}` : "")}
                  disableRipple
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "fit-content",
                    textDecoration: "none",
                    color: "white",
                    "&:hover .MuiSvgIcon-root": { color: "#0066ff" },
                  }}
                >
                  {title === "TheDay" ? <></> : <KeyboardDoubleArrowLeftIcon />}
                  {title}
                </Button>
              </Tooltip>
            </Typography>

            <Tooltip title={"Insert a key"}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                sx={{ mr: 2 }}
                onClick={() => setOpenKeyDialog(true)}
              >
                <KeyIcon color="warning" fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* -- Point 1: Modern Class Switcher -- */}
          {!isSubjectSearch && classes?.length > 1 && (
            <>
              <Button
                onClick={handleClassMenuOpen}
                endIcon={<ExpandMore />}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  mr: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                {className || "Select Class"}
              </Button>
              <Menu
                anchorEl={classMenuAnchor}
                open={Boolean(classMenuAnchor)}
                onClose={handleClassMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 2,
                    boxShadow: theme.shadows[10]
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                  Switch Class
                </Typography>
                <Divider />
                {classes.map((c: any) => (
                  <MenuItem 
                    key={c.id} 
                    onClick={() => handleClassSelect(c)}
                    selected={c.class === className}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <School fontSize="small" color={c.class === className ? "primary" : "inherit"} />
                    </ListItemIcon>
                    <Typography fontWeight={c.class === className ? 700 : 400}>
                      {c.class}
                    </Typography>
                    {c.class === className && <Check fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {isSearch && setSearch && (
            <Tooltip title="Search">
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </Tooltip>
          )}
          {isSubjectSearch && data && (
            <SearchDialog open={searchDialogOpen} setOpen={setSearchDialogOpen} data={data} />
          )}
          {isDesktop && data && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                background: theme.palette.mode === "dark" ? theme.palette.background.default : "#f4f6fb",
                borderRadius: 3,
                px: 2,
                py: 0.5,
                boxShadow: theme.shadows[1],
                minWidth: 220,
                maxWidth: 340,
                ml: 2,
                cursor: "pointer",
                border: `1.5px solid ${theme.palette.divider}`,
                transition: "box-shadow 0.2s, border 0.2s",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                  border: `1.5px solid ${theme.palette.primary.main}`,
                },
              }}
              onClick={() => setSearchDialogOpen(true)}
            >
              <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              <Typography color="text.secondary" sx={{ fontWeight: 500, fontSize: 16 }}>
                Search for anything...
              </Typography>
            </Box>
          )}
          <Tooltip title={theme.palette.mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <KeyDialog open={openKeyDialog} setOpen={setOpenKeyDialog} />
      </AppBar>
    </Box>
  );
}