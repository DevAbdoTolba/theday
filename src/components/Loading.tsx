"use client";
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import Image from "next/image";

const Loading = () => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "absolute",
          inset: "0",
          zIndex: "100",
          backgroundColor: "#151a2c",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // shadow under it
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
          }}
        >
          {/* <LinearProgress
              sx={{
                position: "absolute",
                width: "100%",
                top: "0",
                left: "0",
              }}
            /> */}
          <Image
            src="/icon-192x192.png"
            alt="theday icon"
            width={150}
            height={150}
          />
          <CircularProgress
            sx={{
              position: "absolute",
              color: "white",
            }}
            size={200}
            thickness={1}
          />
        </Box>
      </Box>
    </>
  );
};

export default Loading;
