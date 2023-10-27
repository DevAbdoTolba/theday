import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import Material from "./Material";
import Schedule from "./Schedule";

function TabPanel(props: any) {
  const { children, value, index, data, ...other } = props;
  /*
   {
    {
      [{},{},{}]
    } ,{
      [{},{},{}]
    },{
      [{},{},{}]
    }
  }
  */
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
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

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

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
        ml: {
          sm: props?.showDrawer ? "22ch" : "0",
          xs: "0",
        },
      }}
    >
      <Material {...props} />
    </Box>
  );
}
