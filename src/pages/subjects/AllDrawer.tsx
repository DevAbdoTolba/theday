import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Snackbar from "@mui/material/Snackbar";

import Typography from "@mui/material/Typography";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Header from "@/src/components/Header";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Tooltip,
  Zoom,
} from "@mui/material";

import subjectsData from "../../Data/data.json";
import Link from "@mui/material/Link";
import nextLink from "next/link";

const drawerWidth = 200;

interface Props {
  subjectLoading: boolean;
  materialLoading: boolean;
  data: any;
  subject: string;
  showDrawer: boolean;
}

export default function AllDrawer({
  subjectLoading,
  materialLoading,
  data,
  subject,
  showDrawer,
}: Props) {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [clicked, setClicked] = React.useState<number>(0);
  const [open, setOpen] = React.useState(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // when clicking on the side drawer, send a messge snakbar syaing click shift + left arrow
  const handleDrawerClick = (e: any) => {
    setClicked((prev) => {
      return prev + 1;
    });
    if (clicked === 2) {
      setOpen(true);
    }
  };

  React.useEffect(() => {
    setOpen(false);
  }, [showDrawer]);

  return (
    <>
      <Box
        sx={{
          display: { sm: "none", xs: "block" },
        }}
      >
        {subjectLoading ? (
          <Header
            title={"Loading..."}
            isSearch={false}
            isSubjectSearch={false}
          />
        ) : (
          <Header
            title={subject?.toUpperCase()}
            isSearch={false}
            data={data}
            isSubjectSearch={
              (materialLoading as boolean)
                ? false
                : data
                ? ((Object?.keys(data)?.length > 0) as boolean)
                : false
            }
          />
        )}
      </Box>
      <Box sx={{ display: { sm: "flex", xs: "none" } }}>
        {subjectLoading ? (
          <Header
            title={"Loading..."}
            isSearch={false}
            isSubjectSearch={false}
          />
        ) : (
          <Header
            title={subject?.toUpperCase()}
            isSearch={false}
            data={data}
            isSubjectSearch={
              (materialLoading as boolean)
                ? false
                : data
                ? ((Object?.keys(data)?.length > 0) as boolean)
                : false
            }
            position="relative"
            sx={{
              // width: `calc(100% - ${drawerWidth}px)`,
              ml: showDrawer ? `${drawerWidth}px` : "0",
            }}
          />
        )}
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          onClick={handleDrawerClick}
          variant={showDrawer ? "permanent" : "temporary"}
          anchor="left"
        >
          {subjectsData.semesters.map((item, index) => (
            <Accordion
              key={index}
              expanded={expanded === "panel" + index}
              onChange={handleChange("panel" + index)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{"Sem." + item?.index}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {item?.subjects.map((item, index) => (
                  <Box
                    key={index}
                    display={"flex"}
                    justifyContent={"flex-start"}
                    alignItems={"center"}
                    textAlign={"left"}
                  >
                    <Tooltip
                      title={item?.name}
                      placement="right-end"
                      arrow
                      TransitionComponent={Zoom}
                      disableInteractive
                    >
                      <Link
                        component={nextLink}
                        href={`/subjects/${item?.abbreviation}`}
                        target="_top"
                        // remove default styling and give it a modern look

                        sx={{
                          color: "inherit",
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {item?.abbreviation}
                      </Link>
                    </Tooltip>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Drawer>
      </Box>

      <Snackbar
        sx={{
          // phone no
          display: { sm: "block", xs: "none" },
           width : "5ch",
           "& .MuiSnackbarContent-message":{
            width: "100%",
           }
        }}
        open={open}
        onClose={(e, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpen(false);
        }}
        autoHideDuration={12000}
        message={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>Click</Typography>
            <Tooltip title={"Shift + Left arrow"} placement="top" TransitionComponent={Zoom} arrow>
            <Chip
              label={"Shift + ←"}
              sx={{ mx: "0.5rem", color: "black", backgroundColor: "#e2e2e2" }}
            />
            </Tooltip>
          </Box>
        }
        // animation
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 300 }}
      />
    </>
  );
}
