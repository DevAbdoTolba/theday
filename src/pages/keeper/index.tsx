import React, { Dispatch, SetStateAction, Suspense, lazy } from "react";
import AppLayout from "@/src/components/AppLayout";

import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import FormDialog from "./FormDialog";

import Head from "next/head";
import Image from "next/image";
import Loading from "../../components/Loading";
import usePersistentState from "@/src/hooks/usePersistentState";

interface note {
  title: string;
  body: string;
}

const Main = lazy(() => import("./Main"));
function useLocalNotes(): [note[], Dispatch<SetStateAction<note[]>>] {
  const [notes, setNotes] = usePersistentState<note[]>("notes", []);
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
    <AppLayout title="Keeper" header={{ isSearch: true, search, setSearch }}>
      <Box
        sx={{
          m: 2,
        }}
      >
        {notes.length ? (
          <Suspense fallback={<Loading />}>
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
    </AppLayout>
  );
};

export default App;
