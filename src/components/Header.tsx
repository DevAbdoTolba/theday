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
import { Button, Link, MenuItem, Select } from "@mui/material";
import NextLink from "next/link";
import NativeSelect from "@mui/material/NativeSelect";

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

// let data: DataMap = {
//   "1": [
//     {
//       id: "1",
//       mimeType: "application/vnd.google-apps.folder",
//       name: "Folder1",
//       parents: ["root"],
//       size: 0,
//     },
//   ],
//   "2": [
//     {
//       id: "2",
//       mimeType: "application/vnd.google-apps.folder",
//       name: "Folder2",
//       parents: ["root"],
//       size: 0,
//     },
//   ],
// };

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
    // vertical padding + font size from searchIcon
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
  // take any other props

  ...props
}: Props) {
  const [className, setClassName] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [classes, setClasses] = useState<any>([]);

  React.useEffect(() => {
    const className = (localStorage.getItem("className") as string) || "";
    const classes = JSON.parse(localStorage.getItem("classes") as string) || [];
    console.log("classes", classes);
    console.log("className", className);

    setClassName(className);
    setClasses(classes);
    setQ(classes.find((c: any) => c.class === className)?.id || "");

    // const classToStore = JSON.parse(localStorage.getItem("classes") as string);
    // setClasses(classToStore);
    // const className = localStorage.getItem("className") as string;
    // if (classToStore?.length > 0) {
    //   // search for which class is stored and get the id
    //   console.log("INSIDE IF");
    //   const classId = classToStore.find((e: any) => e === className)?.id;
    //   console.log("classId", classId);
    //   console.log("🚀 ~ React.useEffect ~ className:", className);
    //   setClassName(classId);
    // } else {
    //   setClassName("1");
    // }
  }, []);

  const [open, setOpen] = useState(false);
  shortCutActivate = shortCutActivate || false;
  React.useEffect(() => {
    const handleCtrlK = (e: KeyboardEvent) => {
      if ((e?.ctrlKey && e?.code === "KeyK") || e?.code === "Slash") {
        e?.preventDefault();
        console.log("ctrl+k");
        setOpen(true);
      }
    };

    if (shortCutActivate === true)
      window.addEventListener("keydown", handleCtrlK);

    return () => {
      window.removeEventListener("keydown", handleCtrlK);
    };
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <AppBar
        position={position || "static"}
        sx={{
          height: { sm: "5rem", xs: "4rem" },
          display: "flex",
          justifyContent: "center",
          ...sx,
        }}
      >
        <Toolbar>
          {/* <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: "block",
              fontSize: { sm: "1.5rem", xs: "1.5rem" },
            }}
          >
            <Tooltip
              title={title === "TheDay" ? "" : "Home"}
              placement="bottom"
            >
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
                  "&:hover .MuiSvgIcon-root": {
                    color: "#0066ff",
                  },
                }}
              >
                {title === "TheDay" ? <></> : <KeyboardDoubleArrowLeftIcon />}
                {title}
              </Button>
            </Tooltip>
          </Typography>

          {classes?.length > 1 && (
            <Select
              defaultValue={className?.toString()}
              label={className}
              // add a default selected option
              onChange={(e) => {
                setClassName(e.target.value);
                // @ts-ignore
                localStorage.setItem("className", e?.target?.value?.class);
              }}
            >
              {classes.map((c: any) => (
                <MenuItem
                  disabled={c.class === className}
                  LinkComponent={NextLink}
                  key={c.id}
                  value={c.name}
                  sx={{
                    all: "unset",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    // set all a tag in menu items to have white color
                    a: {
                      color: c.class === className ? "#4caf50" : "#fff",
                      padding: "0.5rem",
                    },
                    // on hover change the color of the a tag to blue
                    "&:hover a": {
                      color: "#fff",
                    },
                  }}
                >
                  <NextLink href={`/theday/q/${c.id}`}>
                    {c?.class as string}
                  </NextLink>
                </MenuItem>
              ))}
            </Select>
          )}
          {/* <LinkMUI 
              component={
                RouterLink  
              } to={`/Keeper`}
               >
              Go To Keeper
          </LinkMUI> */}
          {/* 2 icons first for theday route and the other for Keeper route */}

          {/*
          <Tooltip title="The Day">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              component={Link}
              href={`/theday`}
            >
              <CrisisAlertIcon
                sx={{
                  p: {
                    xs: 0,
                  },
                  m: {
                    xs: 0,
                  },
                  height: {
                    sm: "1.5rem",
                    xs: "1.5rem",
                  },
                  width: "auto",
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Keeper">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              component={Link}
              href={`/keeper`}
            >
              <SpeakerNotesIcon
                sx={{
                  p: {
                    xs: 0,
                  },
                  m: {
                    xs: 0,
                  },
                  height: {
                    sm: "1.5rem",
                    xs: "1.5rem",
                  },
                  width: "auto",
                }}
              />
            </IconButton>
          </Tooltip>*/}
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
            <>
              <SearchDialog open={open} setOpen={setOpen} data={data} />
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
