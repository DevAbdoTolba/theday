import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import React from "react";

// load the icon

export default function Offline() {
  const [filterPercent, setFilterPercent] = React.useState(0);
  const [date, setDate] = React.useState(new Date());

  const [gift, setGift] = React.useState(false);

  React.useEffect(() => {
    setGift(false);
    // console.log(filterPercent);
    setDate(new Date());

    if (filterPercent >= 1) {
      setTimeout(() => {
        // subtract the current date with the date and store it in new var
        const newDate = new Date();
        const diff = newDate.getTime() - date.getTime();
        // if the difference is bigger than or equal to 3 seconds
        // console.log(diff, filterPercent);

        if (diff <= 3000) setGift(true);
      }, 2000);
    }
  }, [filterPercent]);

  return (
    // Simple Offline page with a button to reload the page
    // all in MUI
    <Box
      position={"fixed"}
      top={"0"}
      left={"0"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      gap={"3rem"}
      height={"100%"}
      width={"100%"}
      p={0}
      m={0}
      zIndex={9999}
      bgcolor={filterPercent > 1 && gift ? "#fff" : "#121212"}
      // hide the scroll bar from the parent
    >
      <Head>
        <style>
          {`
            body {
              overflow: hidden;
            }
            .confetti {
              display: flex;
              justify-content: center;
              align-items: center;
              position: absolute;
              width: 100%;
              height: 100%;
              overflow: hidden;
              z-index: 1000;
          }
          .confetti-piece {
              position: absolute;
              width: 10px;
              height: 30px;
              background: #ffd300;
              top: 0;
              opacity: 0;
          }
          .confetti-piece:nth-child(1) {
              left: 7%;
              -webkit-transform: rotate(-40deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 182ms;
              -webkit-animation-duration: 1116ms;
          }
          .confetti-piece:nth-child(2) {
              left: 14%;
              -webkit-transform: rotate(4deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 161ms;
              -webkit-animation-duration: 1076ms;
          }
          .confetti-piece:nth-child(3) {
              left: 21%;
              -webkit-transform: rotate(-51deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 481ms;
              -webkit-animation-duration: 1103ms;
          }
          .confetti-piece:nth-child(4) {
              left: 28%;
              -webkit-transform: rotate(61deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 334ms;
              -webkit-animation-duration: 708ms;
          }
          .confetti-piece:nth-child(5) {
              left: 35%;
              -webkit-transform: rotate(-52deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 302ms;
              -webkit-animation-duration: 776ms;
          }
          .confetti-piece:nth-child(6) {
              left: 42%;
              -webkit-transform: rotate(38deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 180ms;
              -webkit-animation-duration: 1168ms;
          }
          .confetti-piece:nth-child(7) {
              left: 49%;
              -webkit-transform: rotate(11deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 395ms;
              -webkit-animation-duration: 1200ms;
          }
          .confetti-piece:nth-child(8) {
              left: 56%;
              -webkit-transform: rotate(49deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 14ms;
              -webkit-animation-duration: 887ms;
          }
          .confetti-piece:nth-child(9) {
              left: 63%;
              -webkit-transform: rotate(-72deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 149ms;
              -webkit-animation-duration: 805ms;
          }
          .confetti-piece:nth-child(10) {
              left: 70%;
              -webkit-transform: rotate(10deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 351ms;
              -webkit-animation-duration: 1059ms;
          }
          .confetti-piece:nth-child(11) {
              left: 77%;
              -webkit-transform: rotate(4deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 307ms;
              -webkit-animation-duration: 1132ms;
          }
          .confetti-piece:nth-child(12) {
              left: 84%;
              -webkit-transform: rotate(42deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 464ms;
              -webkit-animation-duration: 776ms;
          }
          .confetti-piece:nth-child(13) {
              left: 91%;
              -webkit-transform: rotate(-72deg);
              -webkit-animation: makeItRain 1000ms infinite ease-out;
              -webkit-animation-delay: 429ms;
              -webkit-animation-duration: 818ms;
          }
          .confetti-piece:nth-child(odd) {
              background: #7431e8;
          }
          .confetti-piece:nth-child(even) {
              z-index: 1;
          }
          .confetti-piece:nth-child(4n) {
              width: 5px;
              height: 12px;
              -webkit-animation-duration: 2000ms;
          }
          .confetti-piece:nth-child(3n) {
              width: 3px;
              height: 10px;
              -webkit-animation-duration: 2500ms;
              -webkit-animation-delay: 1000ms;
          }
          .confetti-piece:nth-child(4n-7) {
            background: red;
          }
          @-webkit-keyframes makeItRain {
              from {opacity: 0;}
              50% {opacity: 1;}
              to {-webkit-transform: translateY(350px);}
          }
          `}
        </style>
      </Head>
      <Image
        onClick={() => {
          if (filterPercent < 1) setFilterPercent(filterPercent + 0.08);
          else setFilterPercent(0);
        }}
        style={{
          // soft colors mask
          filter: ` sepia(${
            1 - filterPercent
          }) saturate(${filterPercent}) hue-rotate(${
            (180 * (100 - filterPercent * 100)) / 100
          }deg)`,
          userDrag: "none",
          WebkitUserDrag: "none",
          userSelect: "none",
          MozUserSelect: "none",
          WebkitUserSelect: "none",
          MsUserSelect: "none",
          zIndex: 9999,
        }}
        src={"/icon-512x512.png"}
        alt="icon"
        width={"200"}
        height={"200"}
      />
      <Typography
        sx={{
          left: "50%",
          position: "fixed",
          top: "90%",
          transform: "translate(-50%, -50%)",
          color: filterPercent > 1 && gift ? "#000" : "#fff",
        }}
        variant="h5"
      >
        You are {gift && filterPercent > 1 && "very"} offline{" "}
        {filterPercent > 1 && gift && "😃"}
      </Typography>
      {filterPercent > 1 && gift && (
        <>
          <div className="confetti">
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
          </div>
        </>
      )}
    </Box>
  );
}
