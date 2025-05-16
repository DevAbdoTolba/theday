import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import Material from "./Material";

function TabPanel(props: any) {
  const { children, value, index, data, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: 3,
          background: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
          borderRadius: 2,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          height: "100%"
        }}>
          <>{children}</>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs(props: any) {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  const filterFoldersByFirstWord = (data: any, firstWord: string): { [key: string]: any } => {
    const result: { [key: string]: any } = {};
    Object.entries(data || {}).forEach(([key, value]) => {
      if (key.toLowerCase().startsWith(firstWord.toLowerCase())) {
        result[key] = value;
      }
    });
    return result;
  };

  const lecturesData = filterFoldersByFirstWord(props.data, "lecture");
  const onlineLecturesData = filterFoldersByFirstWord(props.data, "online");
  const sectionsData = filterFoldersByFirstWord(props.data, "section");
  const examsData = filterFoldersByFirstWord(props.data, "ex");

  return (
    <Box
      sx={{
        flexGrow: 1,
        position: "relative",
        height: "100%",
        display: {
          xs: "none",
          md: "flex",
        },
        flexDirection: "column",
        p: 3,
        gap: 0
      }}
    >
      {/* <Box sx={{ 
        borderBottom: 1, 
        borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        background: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
        mb: 0
      }}>
        <Tabs 
          value={value} 
          onChange={handleChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minWidth: 120,
              color: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              "&.Mui-selected": {
                color: theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb"
              }
            },
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb"
            }
          }}
        >
          <Tab label="Lectures" {...a11yProps(0)} />
          <Tab label="Online Lectures" {...a11yProps(1)} />
          <Tab label="Sections" {...a11yProps(2)} />
          <Tab label="Ex Exams" {...a11yProps(3)} />
        </Tabs> */}
      {/* </Box> */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <TabPanel value={value} index={0}>
          <Material data={lecturesData} {...props} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Material data={onlineLecturesData} {...props} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Material data={sectionsData} {...props} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Material data={examsData} {...props} />
        </TabPanel>
      </Box>
    </Box>
  );
}
