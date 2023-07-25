import React, { Dispatch, SetStateAction, Suspense, lazy } from "react";
import Header from "../../components/Header";

import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import FormDialog from "./FormDialog";

import Head from "next/head";
import Image from "next/image";

interface note {
  title: string;
  body: string;
}

const Main = lazy(() => import("./Main"));
function useLocalNotes(): [note[], Dispatch<SetStateAction<note[]>>] {
  const [notes, setNotes] = useState<note[]>([]);
  useEffect(() => {
    try {
      const notes = window.localStorage.getItem("notes");
      if (notes) {
        const parsedNotes = JSON.parse(notes);
        setNotes(parsedNotes);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("notes", JSON.stringify(notes));
      console.log(notes.length);
    } catch (error) {}
  }, [notes]);
  return [notes, setNotes];
}
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
        search={search}
        setSearch={setSearch}
        title="Keeper"
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
                <>
                  {
                    <Image
                      loading="lazy"
                      src={"/waiting-cat-" + waiting + ".gif"}
                      alt={"Adorable bunny patiently waiting for something."}
                      width={200}
                      height={200}
                    />
                  }
                </>
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

export default App;
