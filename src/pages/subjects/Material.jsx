import { Box, Paper, Typography, Grid } from "@mui/material";

function mimeTypeToAppName(mimeType) {
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
  material, // subject => 1-lecture 2-whitenning 3-section
  data,
  PreviousExams,
  schedule,
  description,
}) {
  const containerStyle = {
    display: "flex",
    flexWrap: "noWrap",
    justifyContent: "flex-start",
    width: "80vw",
    overflowX: "scroll",
  };

  const itemStyle = {};

  return (
    <>
      {data &&
        Object?.keys(data)?.map((key, index) => (
          <Paper
            key={index}
            sx={{
              p: "0.5rem",
              m: "1rem",
            }}
          >
            <Typography variant="h4" sx={{ margin: "1rem" }}>
              {key}
            </Typography>
            <Box
              className="Material_container"
              key={index}
              style={containerStyle}
            >
              {data[key]?.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    "&:active > *, &:hover > *": {
                      sm: {
                        "&::after": {
                          opacity: 0.8,
                          visibility: "visible",
                        },
                      },
                    },
                    position: "relative",
                    mr: {
                      sm: "1rem",
                      xs: "3rem",
                    },
                    mb: "1rem",
                    maxWidth: {
                      sm: "15%",
                      xs: "33%",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",

                      overflow: "hidden",
                      fontSize: { sm: "1.5ch", xs: "1.8ch" },

                      // zindex on top of all

                      zIndex: 10000,

                      "&::after": {
                        content: `"${item?.name}"`,

                        opacity: 0,
                        visibility: "hidden",
                        position: "absolute",

                        width: "100%",
                        height: "fit-content",
                        // break lines

                        whiteSpace: "pre-wrap",

                        top: "11%",
                        left: "0",
                        fontSize: "0.8rem",
                        // cool floating effect with box shadow
                        background: "#555",
                        borderRadius: "3px",
                        boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.8)",
                        color: "#fff",
                        padding: "2px",

                        overflow: "hidden",
                        transition: "opacity 0.3s",
                      },
                      "&:hover::after": {
                        opacity: 0.8,
                        visibility: "visible",
                      },
                    }}
                    variant="h6"
                  >
                    {item?.name}
                  </Typography>
                  <Paper
                    className="Material_item"
                    style={itemStyle}
                    elevation={20}
                    sx={{
                      backgroundImage: `url(https://drive.google.com/thumbnail?id=${item?.id}) `,
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
                    }}
                    // on click get file id with https://drive.google.com/uc?id=FILE%20ID
                    onClick={() => {
                      window.open(
                        `https://drive.google.com/uc?id=${item?.id}`,
                        "_blank"
                      );
                    }}
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
                  </Paper>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
    </>
  );
}

export default Material;
