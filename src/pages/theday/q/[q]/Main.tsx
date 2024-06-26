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
    </>
  );
}

export default Main;
