import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import MainPc from "./MainPc";
import MainPhone from "./MainPhone";

function Main({ search, currentSemester, setLoading }) {
  return (
    <>
      <MainPc search={search} currentSemester={currentSemester} />
      <MainPhone search={search} currentSemester={currentSemester} />
      <br />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h1" sx={{ mt: 30, textAlign: "center" }}>
          {"Coming Soon "}
        </Typography>
        <img
          src="https://camo.githubusercontent.com/cc4b7d9efe6dea4ddaf02677caf064823952913af5e10c82b47fc47bab499e4b/68747470733a2f2f6d656469612e74656e6f722e636f6d2f593562647a6a457663464941414141692f6b697474792d63686173652d706978656c2e676966"
          alt="Coming Soon"
        />
      </Box>
    </>
  );
}

export default Main;
