import React, { Suspense, lazy } from "react";
import Header from "../../components/Header";

import { useState, useEffect } from "react";
import { Paper, Box, Grid } from "@mui/material";
import FormDialog from "./FormDialog";

import Head from "next/head";

const Main = lazy(() => import("./Main.jsx"));

const App = () => {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useLocalNotes();
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    // randomly choose from 1 to 3 and set in waiting
    setWaiting(Math.floor(Math.random() * 3) + 1);
  }, []);

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
        {notes.length ? (
          <Suspense fallback={<div>Loading...</div>}>
            <Main search={search} notes={notes} setNotes={setNotes} />
          </Suspense>
        ) : (
          <Grid
            container
            sx={{
              textAlign: "center",
            }}
          >
            <Grid item sm={5}></Grid>
            <Grid
              item
              sm={2}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                // after class saying waiting

                "&::after": {
                  content: "'Add some notes... '",

                  position: "absolute",
                  mt: "1rem",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  top: "100%",
                  left: "50%",
                  width: "200%",
                  transform: "translateX(-50%)",
                },
              }}
            >
              {!waiting ? (
                ""
              ) : (
                <img
                  src={"waiting-cat-" + waiting + ".gif"}
                  alt={"Adorable bunny patiently waiting for something."}
                  width={200}
                />
              )}
            </Grid>

            <Grid item sm={5}></Grid>
          </Grid>
        )}
        <FormDialog setNotes={setNotes} />
      </Box>
    </>
  );
};

function useLocalNotes() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    try {
      const notes = window.localStorage.getItem("notes");
      if (notes) {
        startTransition(() => {
          setNotes(JSON.parse(notes));
        });
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("notes", JSON.stringify(notes));
    } catch (error) {}
  }, [notes]);
  // console.log(notes.length);
  return [notes, setNotes];
}

export default App;
