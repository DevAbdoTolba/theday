import * as React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import data from "../../Data/data.json";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";

function samePageLinkNavigation(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 || // ignore everything but left-click
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.shiftKey
  ) {
    return false;
  }
  return true;
}

interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  return <Tab component="a" {...props} />;
}

export default function NavTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // event.type can be equal to focus with selectionFollowsFocus.
    if (
      event.type !== "click" ||
      (event.type === "click" &&
        samePageLinkNavigation(
          event as React.MouseEvent<HTMLAnchorElement, MouseEvent>
        ))
    ) {
      setValue(newValue);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="nav tabs example"
      >
        {/* <LinkTab label="Page One" href="/drafts" /> */}
        {data.semesters.map((item, index) => (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{"Sem." + item.index}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {item.subjects.map((item, index) => (
                <Box
                  key={index}
                  display={"flex"}
                  justifyContent={"flex-start"}
                  alignItems={"center"}
                  textAlign={"left"}
                >
                  <LinkTab
                    label={item.name}
                    href={`/subjects/${item.abbreviation}`}
                  />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Tabs>
    </Box>
  );
}
