import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import MainPc from "./MainPc";
import MainPhone from "./MainPhone";
import Image from "next/image";

interface Props {
  search: string;
  currentSemester: number;
}

function Main({ search, currentSemester }: Props) {
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
        <Image src="/cat.gif" alt="Coming Soon" width={250} height={250} />
      </Box>
    </>
  );
}

export default Main;
