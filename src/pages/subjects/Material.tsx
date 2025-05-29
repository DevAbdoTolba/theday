import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import heartImg from "../../../public/heartAnimation.png";
import LinkIcon from "@mui/icons-material/Link";
import { useState, useEffect, useRef } from "react";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";

import SemesterBar from "../../components/SemesterBar";

import Zoom from "@mui/material/Zoom";

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
  name: string;
  abbreviation: string;
  material: number;
  data: DataMap;
  PreviousExams: DataMap;
  schedule: DataMap;
  description: string;
  newItems: string[];
}
function mimeTypeToAppName(mimeType: string) {
  switch (mimeType) {
    case "application/vnd.google-apps.audio":
      return "GoogleAudio";
    case "application/vnd.google-apps.blogger":
      return "GoogleBlogger";
    case "application/vnd.google-apps.calendar":
      return "GoogleCalendar";
    case "application/vnd.google-apps.dcm":
      return "GoogleCampaign Manager 360";
    case "application/vnd.google-apps.document":
      return "GoogleDocs";
    case "application/vnd.google-apps.drive-sdk":
      return "Thirdparty shortcut";
    case "application/vnd.google-apps.drawing":
      return "GoogleDrawings";
    case "application/vnd.google-apps.file":
      return "GoogleDrive file";
    case "application/vnd.google-apps.folder":
      return "GoogleDrive folder";
    case "application/vnd.google-apps.form":
      return "GoogleForms";
    case "application/vnd.google-apps.fusiontable":
      return "GoogleFusion Tables";
    case "application/vnd.google-apps.hangout":
      return "GoogleHangouts";
    case "application/vnd.google-apps.image":
      return "GoogleDrive image";
    case "application/vnd.google-apps.jam":
      return "GoogleJamboard";
    case "application/vnd.google-apps.kix":
      return "GoogleDocs (old)";
    case "application/vnd.google-apps.map":
      return "GoogleMy Maps";
    case "application/vnd.google-apps.photo":
      return "GooglePhotos";
    case "application/vnd.google-apps.presentation":
      return "GoogleSlides";
    case "application/vnd.google-apps.script":
      return "GoogleApps Script";
    case "application/vnd.google-apps.shortcut":
      return "Shortcut";
    case "application/vnd.google-apps.site":
      return "GoogleSites";
    case "application/vnd.google-apps.spreadsheet":
      return "GoogleSheets";
    case "application/vnd.google-apps.unknown":
      return "Unknownfile type";
    case "application/vnd.google-apps.video":
      return "GoogleVideo";
    case "application/vnd.google-apps.script+json":
      return "GoogleApps Script (JSON)";
    case "image/jpeg":
      return "JPEGimage";
    case "image/png":
      return "PNGimage";
    case "image/gif":
      return "GIFimage";
    case "image/webp":
      return "WebPimage";
    case "image/svg+xml":
      return "SVGimage";
    case "image/bmp":
      return "BMPimage";
    case "image/tiff":
      return "TIFFimage";
    case "image/x-icon":
      return "Iconimage";
    default:
      return "";
  }
}

function Material({
  name,
  abbreviation,
  material,
  data,
  PreviousExams,
  schedule,
  description,
  newItems,
}: Props) {
  const theme = useTheme();

  const containerStyle = {
    display: "flex",
    flexWrap: "noWrap",
    justifyContent: "flex-start",
    overflowX: "scroll",
  };

  const tabOptions = [
    // { label: "All", key: "all" },
    // { label: "Lectures", key: "lecture" },
    // { label: "Online Lectures", key: "online" },
    // { label: "Sections", key: "section" },
    // { label: "Ex Exams", key: "ex" },
    // spread
    { label: "All", key: "all" }, // Add 'All' tab at the end
    ...Object.keys(data).map((key: string) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      key: key.toLowerCase(),
    })),
  ];

  const itemStyle = {};

  const openFolder = (id: string) => {
    window.open(`https://drive.google.com/drive/folders/${id}`, "_blank");
  };

  const scrollToItem = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  };

  useEffect(() => {
    // get from url the folder id after the #
    const id = window.location.hash.split("#")[1];
    // decode id from url encoding
    const decodedId = decodeURIComponent(id);
    scrollToItem(decodedId);
  }, [data]);

  useEffect(() => {
    document.body.classList.toggle("light", theme.palette.mode === "light");
    document.body.classList.toggle("dark", theme.palette.mode === "dark");
  }, [theme.palette.mode]);

  const [selectedTab, setSelectedTab] = useState<string>(tabOptions[0].key);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Improved drag scrolling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle mouse down event with improved starting position tracking
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    // Prevent default behavior to avoid text selection
    e.preventDefault();

    const slider = scrollContainerRef.current;
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(slider.scrollLeft);

    // Change cursor immediately for better feedback
    slider.style.cursor = "grabbing";
  };

  // Handle mouse move with smoother scrolling
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    // Calculate distance moved and update scroll position
    const slider = scrollContainerRef.current;
    const x = e.clientX;
    const distance = x - startX;
    slider.scrollLeft = scrollLeft - distance;
  };

  // Clean up on mouse up/leave
  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;

    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
  };

  // Ensure we clean up if mouse leaves the container during drag
  const handleMouseLeave = () => {
    if (isDragging && scrollContainerRef.current) {
      setIsDragging(false);
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  // Add and remove event listeners with proper cleanup
  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
        slider.style.cursor = "grab";
      }
    };

    document.addEventListener("mouseup", handleMouseUpGlobal);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUpGlobal);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  // Filter data based on selected tab
  const filteredData: DataMap =
    selectedTab === "all"
      ? data
      : Object.keys(data)
          .filter((key: string) => key.toLowerCase().startsWith(selectedTab))
          .reduce((obj: DataMap, key: string) => {
            obj[key] = data[key];
            return obj;
          }, {});

  // Handle tab change with transition
  const handleTabChange = (newTab: string) => {
    // Skip effect if clicking the same tab
    if (newTab === selectedTab) return;

    setIsTransitioning(true);

    // Short timeout to allow fade out before changing data
    setTimeout(() => {
      setSelectedTab(newTab);
      // Allow a bit more time for fade-in effect
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  return (
    <>
      {/* Tab Bar */}
      <Box
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          overflowX: "auto",
          whiteSpace: "nowrap",
          pb: 1,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
          cursor: "grab",
          userSelect: "none", // Prevent text selection during drag
          WebkitUserSelect: "none", // For Safari
          MozUserSelect: "none", // For Firefox

          mx: {
            sm: "2ch",
            xs: "0", // Responsive margin
          },
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            p: ".5ch",
          }}
        >
          {tabOptions.map((tab) => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? "contained" : "text"}
              onClick={() => handleTabChange(tab.key)} // Use new handler
              sx={{
                fontWeight: {
                  sm: 700,
                  xs: 500, // Responsive font weight
                },
                fontSize: {
                  sm: "1.6ch",
                  xs: "1.2ch", // Responsive font size
                },
                borderRadius: 3,
                background: selectedTab === tab.key ? "#334155" : "transparent",
                color: selectedTab === tab.key ? "#fff" : "inherit",
                "&:hover": { background: "#475569", color: "#fff" },
                minWidth: { xs: 80, sm: 120 }, // responsive min width
                flexShrink: 0,
                mx: ".6ch",
                border: {
                  sm: selectedTab === tab.key ? "none" : "none",
                  xs: selectedTab === tab.key ? "none" : "0.1px solid #444",
                }, // responsive border
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Content wrapper with fade transition */}
      <Fade in={!isTransitioning} timeout={{ enter: 300, exit: 150 }}>
        <Box>
          {/* Render filtered sections with CSS transitions */}
          {Object.keys(filteredData).map((key: string, index: number) => (
            <Paper
              key={key}
              elevation={3}
              sx={{
                p: "0.5rem",
                m: "1rem",
                background: theme.palette.background.paper,
                // Add CSS transition
                transition: "opacity 0.15s ease-in-out",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover a": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  "& a": {
                    display: "none",
                  },
                }}
              >
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"center"}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      margin: "1rem",
                      width: "fit-content",
                    }}
                    id={key}
                  >
                    {key}
                  </Typography>
                  <Box
                    component="span"
                    onClick={() => {
                      const element = document.getElementById(key);
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    sx={{
                      display: "inline-block",
                      ml: 1.5,
                      px: 1.5,
                      py: 0.25,
                      minWidth: 24,
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: "1rem",
                      textAlign: "center",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "#1e293b" : "#f6f5fa",
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#fff" : "#1e293b",
                      boxShadow: (theme) => theme.shadows[1],
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "#334155" : "#e0e7ef",
                        color: (theme) =>
                          theme.palette.mode === "dark" ? "#a5b4fc" : "#2563eb",
                      },
                    }}
                  >
                    {filteredData[key].length}
                  </Box>
                </Box>
                <Tooltip title="open in drive">
                  <IconButton
                    sx={{
                      height: "fit-content",
                      width: "fit-content",
                    }}
                    onClick={() => {
                      openFolder(filteredData[key][0]?.parents[0]);
                    }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                className="Material_container"
                sx={{
                  display: "flex",
                  flexWrap: "noWrap",
                  justifyContent: "flex-start",
                  overflowX: "scroll",
                  backgroundColor: theme.palette.background.default,
                  "&::-webkit-scrollbar": {
                    height: 8,
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: theme.palette.primary.light,
                    borderRadius: 8,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: theme.palette.primary.main,
                    borderRadius: 8,
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: theme.palette.primary.dark,
                  },
                  px: { xs: 1, sm: 2 },
                }}
              >
                {filteredData[key]?.map((item: Data, index: number) => (
                  <Box
                    key={item.id}
                    className="heart heart-active"
                    sx={{
                      "&:active > *, &:hover > *": {
                        position: "relative",
                        sm: {
                          "&::after": {
                            opacity: 0.8,
                            visibility: "visible",
                          },
                        },
                      },
                      // Maintain exact spacing
                      maxWidth: {
                        sm: "15%",
                        xs: "33%",
                      },
                      minWidth: {
                        sm: "15%",
                        xs: "33%",
                      },
                      width: "100%",
                      mr: {
                        sm: "1rem",
                        xs: "3rem",
                      },
                      mb: "1rem",
                      animation: newItems.includes(item?.id)
                        ? "shake-bottom 1s 3s 3, bounce-in-bottom 2s"
                        : "",
                      backgroundPosition: "left top",
                      backgroundRepeat: "repeat-y space",
                      "&::after": newItems.includes(item?.id)
                        ? {
                            content: "'New'",
                            fontSize: "1ch",
                            position: "absolute",
                          }
                        : {},
                      // Add smooth transition for items
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                      opacity: isTransitioning ? 0.4 : 1,
                    }}
                  >
                    <Tooltip
                      title={(() => {
                        // Remove if found any %20 and replace it with space
                        let name = item?.name;
                        if (name.includes("%20")) {
                          name = name.replace(/%20/g, " ");
                        }
                        if (name.includes("http")) {
                          let url: URL | string = "";
                          let name_split = name.split(" ");
                          // Check which index is the url

                          let urlIndex = name_split.findIndex((name: string) =>
                            name.includes("http")
                          );
                          const name_split_no_url = name_split.filter(
                            (name: string) => !name.includes("http")
                          );
                          // Get the url
                          if (name_split_no_url.length > 0) {
                            return name_split_no_url.join(" ");
                          }
                          try {
                            url = new URL(name_split[urlIndex]);
                            // If url is youtube change the word youtube into : yout-ube
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
                              return item?.name;
                            }
                          }
                        }
                        return item?.name;
                      })()}
                      TransitionComponent={Zoom}
                      placement="top"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "#1e293b"
                                : "#e3e8f7",
                            color:
                              theme.palette.mode === "dark" ? "#fff" : "#000",
                            fontSize: 14,
                            fontWeight: 500,
                            borderRadius: 1.5,
                            p: "1ch 2ch",
                            boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                            maxWidth: 300,
                          },
                        },
                        arrow: {
                          sx: {
                            color:
                              theme.palette.mode === "dark"
                                ? "#1e293b"
                                : "#e3e8f7",
                          },
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          fontSize: { sm: "1.5ch", xs: "1.8ch" },
                          zIndex: 10000,
                        }}
                        variant="h6"
                      >
                        {(() => {
                          // Remove if found any %20 and replace it with space
                          let name = item?.name;

                          if (name.includes("http")) {
                            let url: URL | string = "";
                            let name_split = name.split(" ");
                            let urlIndex = name_split.findIndex(
                              (name: string) => name.includes("http")
                            );
                            const name_split_no_url = name_split.filter(
                              (name: string) => !name.includes("http")
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
                                return item?.name;
                              }
                            }
                          }
                          return item?.name;
                        })()}
                      </Typography>
                    </Tooltip>
                    <Button
                      className="Material_item"
                      style={itemStyle}
                      disableRipple
                      sx={{
                     
                        all: "unset",
                        backgroundImage: () => {
                          if (item?.name.includes("http")) {
                            if (item?.name.includes("youtube")) {
                              let vId = "";
                              let url: URL | string = "";
                              let name_split = item?.name.split(" ");
                              let urlIndex = name_split.findIndex(
                                (name: string) => name.includes("http")
                              );
                              url = name_split[urlIndex];
                              url = decodeURIComponent(url);
                              try {
                                url = new URL(url);
                                vId = url.searchParams.get("v") || "";
                                return vId
                                  ? `url(https://img.youtube.com/vi/${vId}/0.jpg)`
                                  : (() => {
                                      throw new Error("");
                                    })();
                              } catch (e) {
                                return "url(/link.jpg)";
                              }
                            } else return "url(/link.jpg)";
                          }
                          return `url(https://drive.google.com/thumbnail?id=${item?.id}) `;
                        },
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        aspectRatio: "3 / 3",
                        flexBasis: "50%",
                        cursor: "pointer",
                        // p: "4rem",
                        // width: 0,
                        m: 1,
                        ml: 0,
                        userSelect: "none",
                        textAlign: "center",
                        minHeight: "25vh",
                        maxHeight: "100%",
                        display: "flex",
                        justifyContent: "center",
                        border: "1px solid black",
                        boxSizing: "border-box",
                        minWidth: "100%",
                        "&:focus": {
                          margin: "3px",
                          outline: "1px solid #fff",
                          boxShadow: "10px 10px 70px 30px rgba(0, 0, 0, 0.8)",
                        },
                        maxWidth: {
                          sm: "15%",
                          xs: "150%",
                        },
                      }}
                      href={
                        (() => {
                          let name = item?.name;

                          if (name.includes("http")) {
                            let url: URL | string = "";
                            let name_split = name.split(" ");
                            let urlIndex = name_split.findIndex(
                              (name: string) => name.includes("http")
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
                                return `https://drive.google.com/file/d/${item?.id}/preview`;
                              }
                            }
                          } else {
                            return `https://drive.google.com/file/d/${item?.id}/preview`;
                          }
                        })() as string
                      }
                      target="_blank"
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      </Fade>
      <SemesterBar />
    </>
  );
}

export default Material;
