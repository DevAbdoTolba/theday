import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
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

const tabOptions = [
  { label: "All", key: "all" },
  { label: "Lectures", key: "lecture" },
  { label: "Online Lectures", key: "online" },
  { label: "Sections", key: "section" },
  { label: "Ex Exams", key: "ex" },
];

function Material({
  name,
  abbreviation,
  material, // subject => 1-lecture 2-whitenning 3-section
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
    document.body.classList.toggle('light', theme.palette.mode === 'light');
    document.body.classList.toggle('dark', theme.palette.mode === 'dark');
  }, [theme.palette.mode]);

  const [selectedTab, setSelectedTab] = useState<string>(tabOptions[0].key);

  // Filter data based on selected tab
  const filteredData: DataMap = selectedTab === 'all'
    ? data
    : Object.keys(data)
        .filter((key: string) => key.toLowerCase().startsWith(selectedTab))
        .reduce((obj: DataMap, key: string) => {
          obj[key] = data[key];
          return obj;
        }, {});

  return (
    <>
      {/* Tab Bar */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          overflowX: "auto",
          whiteSpace: "nowrap",
          pb: 1,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {tabOptions.map((tab) => (
          <Button
            key={tab.key}
            variant={selectedTab === tab.key ? "contained" : "text"}
            onClick={() => setSelectedTab(tab.key)}
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              background: selectedTab === tab.key ? "#334155" : "transparent",
              color: selectedTab === tab.key ? "#fff" : "inherit",
              "&:hover": { background: "#475569", color: "#fff" },
              minWidth: { xs: 80, sm: 120 }, // responsive min width
              flexShrink: 0,
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Render only filtered sections */}
      {Object.keys(filteredData).map((key: string, index: number) => (
        <Paper
          key={index}
          elevation={3}
          sx={{
            p: "0.5rem",
            m: "1rem",
            background: theme.palette.mode === "dark" ? "#151a2c" : "#faf7f7",
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
            <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
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
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                sx={{
                  display: 'inline-block',
                  ml: 1.5,
                  px: 1.5,
                  py: 0.25,
                  minWidth: 24,
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textAlign: 'center',
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#1e293b' : '#f6f5fa',
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1e293b',
                  boxShadow: theme => theme.shadows[1],
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: theme => theme.palette.mode === 'dark' ? '#334155' : '#e0e7ef',
                    color: theme => theme.palette.mode === 'dark' ? '#a5b4fc' : '#2563eb',
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
            key={index}
            sx={{
              display: "flex",
              flexWrap: "noWrap",
              justifyContent: "flex-start",
              overflowX: "scroll",
              backgroundColor: theme.palette.mode === "dark" ? "#151a2c" : "transparent",
              '&::-webkit-scrollbar': {
                height: 8,
                background: 'transparent',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.mode === 'dark' ? '#222b3a' : '#f1f1f1',
                borderRadius: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
                borderRadius: 8,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: theme.palette.mode === 'dark' ? '#475569' : '#94a3b8',
              },
              pl: { xs: 1, sm: 2 },
              pr: { xs: 1, sm: 2 },
            }}
          >
            {filteredData[key]?.map((item: Data, index: number) => (
              <Box
                className="heart heart-active"
                key={index}
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
                  mr: {
                    sm: "1rem",
                    xs: "3rem",
                  },
                  mb: "1rem",
                  maxWidth: {
                    sm: "15%",
                    xs: "33%",
                  },
                  // if item id is in the array newItems do the animation
                  animation: newItems.includes(item?.id)
                    ? //  "shake-bottom 1s 3s 3, bounce-in-bottom 2s, heart 1s 5s 5 steps(28)  alternate-reverse"
                      "shake-bottom 1s 3s 3, bounce-in-bottom 2s"
                    : "",

                  // backgroundImage: newItems.includes(item?.id)
                  //   ? "url(" + heartImg.src + ")"
                  //   : "",

                  backgroundPosition: "left top",
                  backgroundRepeat: "repeat-y space",

                  "&::after": newItems.includes(item?.id)
                    ? {
                        content: "'New'",
                        fontSize: "1ch",
                        position: "absolute",
                      }
                    : {},
                }}
              >
                <Tooltip
                  title={(() => {
                    // remove if found any %20 and replace it with space
                    let name = item?.name;
                    if (name.includes("%20")) {
                      name = name.replace(/%20/g, " ");
                    }
                    if (name.includes("http")) {
                      let url: URL | string = "";
                      let name_split = name.split(" ");
                      // check which index is the url

                      let urlIndex = name_split.findIndex((name: string) =>
                        name.includes("http")
                      );
                      const name_split_no_url = name_split.filter(
                        (name: string) => !name.includes("http")
                      );
                      // get the url
                      if (name_split_no_url.length > 0) {
                        return name_split_no_url.join(" ");
                      }
                      try {
                        url = new URL(name_split[urlIndex]);
                        // if url is youtube change the word youtube into : yout-ube
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
                  arrow
                  TransitionComponent={Zoom}
                >
                  <Typography
                    sx={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",

                      overflow: "hidden",
                      fontSize: { sm: "1.5ch", xs: "1.8ch" },

                      // zindex on top of all

                      zIndex: 10000,

                      // "&::after": {
                      //   content: `"${item?.name}"`,

                      //   opacity: 0,
                      //   visibility: "hidden",
                      //   position: "absolute",

                      //   width: "100%",
                      //   height: "fit-content",
                      //   // break lines

                      //   whiteSpace: "pre-wrap",

                      //   top: "11%",
                      //   left: "0",
                      //   fontSize: "0.8rem",
                      //   // cool floating effect with box shadow
                      //   background: "#555",
                      //   borderRadius: "3px",
                      //   boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.8)",
                      //   color: "#fff",
                      //   padding: "2px",

                      //   overflow: "hidden",
                      //   transition: "opacity 0.3s",
                      // },
                      // "&:hover::after": {
                      //   opacity: 0.8,
                      //   visibility: "visible",
                      // },
                    }}
                    variant="h6"
                  >
                    {(() => {
                      // remove if found any %20 and replace it with space
                      let name = item?.name;

                      if (name.includes("http")) {
                        let url: URL | string = "";
                        let name_split = name.split(" ");
                        // check which index is the url

                        let urlIndex = name_split.findIndex((name: string) =>
                          name.includes("http")
                        );
                        const name_split_no_url = name_split.filter(
                          (name: string) => !name.includes("http")
                        );
                        // get the url
                        if (name_split_no_url.length > 0) {
                          return name_split_no_url.join(" ");
                        }
                        try {
                          url = new URL(name_split[urlIndex]);
                          // if url is youtube change the word youtube into : yout-ube
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
                          // console.log(name_split);
                          // which has the url
                          let urlIndex = name_split.findIndex((name: string) =>
                            name.includes("http")
                          );
                          // store the url
                          url = name_split[urlIndex];
                          // decode the url from URL encoding
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

                    aspectRatio: "3 / 2",
                    flexBasis: "50%",
                    cursor: "pointer",
                    p: 4,
                    m: 1,
                    ml: 0,
                    userSelect: "none",
                    textAlign: "center",
                    width: "5vw",
                    minHeight: "25vh",
                    maxHeight: "100%",
                    display: "flex",
                    justifyContent: "center",
                    border: "1px solid black",
                    boxSizing: "border-box",
                    minWidth: "100%",
                    padding: "4rem",

                    "&:focus": {
                      margin: "3px",
                      outline: "1px solid #fff",
                      // huge shadow
                      boxShadow: "10px 10px 70px 30px rgba(0, 0, 0, 0.8)",
                    },
                  }}
                  // on click get file id with https://drive.google.com/uc?id=FILE%20ID

                  href={
                    (() => {
                      let name = item?.name;

                      if (name.includes("http")) {
                        let url: URL | string = "";
                        let name_split = name.split(" ");
                        // check which index is the url

                        let urlIndex = name_split.findIndex((name: string) =>
                          name.includes("http")
                        );
                        // get the url
                        try {
                          // console.log("urlIndex", urlIndex, name_split);

                          url = new URL(name_split[urlIndex]);
                          // if url is youtube change the word youtube into : yout-ube
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
                      //  `https://drive.google.com/file/d/${item?.id}/preview`;
                    })() as string
                  }
                  target="_blank"
                >
                  {/* <Typography
                    variant="h5"
                    sx={{
                      fontSize: { sm: "1.3ch", xs: "1.4ch" },
                      // out line
                      textShadow: "0px 2px 1px  #0000ff",
                      color: "#fff",
                    }}
                  >
                    {mimeTypeToAppName(item?.mimeType) +
                      "\n" +
                      (item?.size ? Math.ceil(item?.size / 1024) + "KB" : "")}
                  </Typography> */}
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}
      <SemesterBar />
    </>
  );
}

export default Material;
