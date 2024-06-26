import React from "react";

import { Grid } from "@mui/material";
import Image from "next/image";
import Header from "./Header";

export default function NoData() {
  return (
    <>
      <Header title="Back Home" isSearch={false} />
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
              content: "'No data were uploaded... YET '",

              position: "absolute",
              mt: "1rem",
              fontSize: "1.5rem",
              fontWeight: "bold",
              top: "100%",
              left: "50%",
              width: "200%",
              transform: "translateX(-50%)",
            },
          }}
        >
          <Image
            src={"/noData.gif"}
            alt={"Nervously waiting"}
            height={215}
            width={200}
          />
        </Grid>

        <Grid item sm={5}></Grid>
      </Grid>
    </>
  );
}
