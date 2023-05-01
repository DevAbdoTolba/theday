import React, { useEffect, Suspense, lazy } from "react";
import Header from "../../components/Header";

import { useState } from "react";
import { Paper, Box } from "@mui/material";
import Head from "next/head";

const Main = lazy(() => import("./Main.jsx"));

const App = () => {
  const [search, setSearch] = useState("");

  return (
    <>
      <Head>
        <title>{"Keeper"}</title>
        {/* <meta name="description" content={description} /> */}
        <link
          rel="icon"
          href={
            "https://media.discordapp.net/attachments/1008571067398369291/1072747425141366804/Hotpot_3.png?width=238&height=238"
          }
        />
      </Head>
      <Header
        title="Keeper"
        setSearch={setSearch}
        search={search}
        isSearch={true}
      />
      <Box
        sx={{
          m: 2,
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Main search={search} />
        </Suspense>
      </Box>
    </>
  );
};

export default App;
