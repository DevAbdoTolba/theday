import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import MainPc from "./MainPc";
import MainPhone from "./MainPhone";
import Image from "next/image";
import { useSearch } from "../../../../context/SearchContext";

interface Props {
  search: string;
  currentSemester: number;
}

function Main({ search, currentSemester }: Props) {
  const { searchQuery } = useSearch();
  
  // Use either the context search query or the prop-based search
  const effectiveSearch = searchQuery || search;
  return (
    <>
      <MainPc search={effectiveSearch} currentSemester={currentSemester} />
      <MainPhone search={effectiveSearch} currentSemester={currentSemester} />
    </>
  );
}

export default Main;
