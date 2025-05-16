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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: 2,
          background: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
          borderRadius: 2,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          mt: 0
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
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs(props: any) {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  // Filter data for each section based on the first word of the folder name
  const getFirstFolderFiles = (data: any, firstWords: string[]): any[] => {
    for (const [key, value] of Object.entries(data || {})) {
      const firstWord = key.split(" ")[0].toLowerCase();
      if (firstWords.map((w: string) => w.toLowerCase()).includes(firstWord)) {
        return Array.isArray(value) ? value : [];
      }
    }
    return [];
  };

  const lecturesData = getFirstFolderFiles(props.data, ["lecture"]);
  const onlineLecturesData = getFirstFolderFiles(props.data, ["online"]);
  const sectionsData = getFirstFolderFiles(props.data, ["section"]);
  const examsData = getFirstFolderFiles(props.data, ["ex"]);

  return (
    <Box
      sx={{
        width: "100%",
        display: {
          xs: "block",
          md: "none",
        },
        p: 2
      }}
    >
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
  );
}
