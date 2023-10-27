import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Snackbar from "@mui/material/Snackbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Header from "@/src/components/Header";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
            title={subject.toUpperCase()}
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
            title={subject.toUpperCase()}
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
        open={open}
        onClose={(e,reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpen(false);
        }}
        autoHideDuration={12000}
        message="Click Shift + &#8592;"
        // animation
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 300 }}
      />
    </>
  );
}
