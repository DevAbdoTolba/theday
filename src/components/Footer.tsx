import {
  Box,
  ButtonGroup,
  Divider,
  Grid,
  Icon,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import Tooltip from "@mui/material/Tooltip";

import Link from "next/link";
import Image from "next/image";
import NameHref from "./NameHref";

export default function footer() {
  const BackTeamData = [
    {
      name: "yousef 3la2",
      dataName: ["phone", "email"],
      dataHref: ["tel:01151712025", "mailto:yousefalaa25@gmail.com"],
    },
    {
      name: "Amr Ashraf",
      dataName: ["phone", "email"],
      dataHref: ["tel:01122099044", "mailto:amrashraf72002@gmail.com"],
    },
    {
      name: "Amr Elbana",
      dataName: ["phone", "email"],
      dataHref: ["tel:01028900175", "mailto:elbana544@gmail.com"],
    },
    {
      name: "Omar Farouq",
      dataName: ["LinkTree"],
      dataHref: ["https://linktr.ee/omarfarouk27"],
    },
    {
      name: "Yasser Shaban",
      dataName: ["LinkTree"],
      dataHref: ["https://linktr.ee/yasershaban03"],
    },
    {
      name: "Ziad Mohamed",
      dataName: ["phone", "email"],
      dataHref: ["tel:01011433088", "mailto:Ziadmhmdaly@gmail.com"],
    },
    {
      name: "Aya Tamer",
      dataName: ["phone", "email"],
      dataHref: ["tel:01154411007", "mailto:ayatamer389@gmail.com"],
    },
    {
      name: "Agasi Eid",
      dataName: ["phone", "email"],
      dataHref: ["tel:0122300783 ", "mailto:agassyeid9@gmail.com"],
    },
    {
      name: "Hanen Ezat",
      dataName: ["phone"],
      dataHref: ["tel:01020788954"],
    },
    {
      name: "Mahmoud Rafat",
      dataName: ["phone", "email"],
      dataHref: ["tel:01147477955", "mailto:mahmoudrafatt995@gmail.com"],
    },
    {
      name: "Maivy Ayman",
      dataName: ["phone", "email"],
      dataHref: ["tel:01205164464", "mailto:mavyaymen90@gmail.com"],
    },
    {
      name: "Sara Hisham",
      dataName: ["phone", "email"],
      dataHref: ["tel:01020788954", "mailto:sara.hisham24.sh@gmail.com"],
    },
  ];
  const TntData = [
    {
      name: "Ahmed Monatah",
      dataName: ["phone", "email"],
      dataHref: ["tel:01157084789", "mailto:ahmedmonataf@gmail.com"],
    },
    {
      name: "Moatasem Mahmoud",
      dataName: ["phone", "email"],
      dataHref: ["tel:01028496492", "mailto:Moatasemmahmoud13@gmail.com"],
    },
    {
      name: "Mohamed Wael",
      dataName: ["phone", "email"],
      dataHref: ["tel:01008154059", "mailto:mohammedwael082@gmail.com"],
    },
    {
      name: "Othman Abdelrahim",
      dataName: ["phone"],
      dataHref: ["tel:01555725189"],
    },
    {
      name: "Yousef Atef",
      dataName: ["phone", "email", "LinkedIn"],
      dataHref: [
        "tel:01158259889",
        "mailto:youssefatef865@gmail.com",
        "https://www.linkedin.com/in/youssef-atef-3284b5251",
      ],
    },
  ];
  const TNT = 2;

  return (
    <Box
      mx={"5%"}
      bgcolor={"Main.light"}
      pt={"5ch"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"space-around"}
      sx={{
        borderRadius: "1rem 1rem 0 0",
        overflow: "hidden",
        height: {
          xs: "auto",
          sm: "85vh",
        },
      }}
    >
      <Grid
        container
        justifyContent={"center"}
        flexWrap={"wrap"}
        // items inside takes the whole width
        width={"100%"}
        sx={{
          alignItems: {
            xs: "center",
            sm: "stretch",
          },

          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: {
            xs: "2rem",
            sm: "0",
          },
        }}
      >
        <Grid
          item
          xs={4}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          gap={"1rem"}
          sx={{
            width: {
              sm: "auto",
              xs: "100vw ",
            },
          }}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            textAlign={"center"}
            gap={"3ch"}
            sx={{
              width: {
                sm: "auto",
                xs: "80vw ",
              },
            }}
          >
            <Image
              src="/icon-192x192.png"
              width={100}
              height={100}
              alt="The-Day website Logo"
            />

            <Tooltip
              title={"The-Day repo"}
              placement="top"
              arrow
              TransitionProps={{ timeout: 200 }}
            >
              <Typography
                variant="h5"
                sx={{
                  "& *": {
                    all: "unset",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  },
                }}
                // maximum of 10 words per line
                width={"auto"}
              >
                <Link
                  href="https://github.com/DevAbdoTolba/theday"
                  target="_blank"
                >
                  The-Day
                </Link>
              </Typography>
            </Tooltip>
            <Typography
              variant="subtitle2"
              // maximum of 10 words per line
            >
              Made with 💖🫰, by AASTMT aswan CS&quot;2110 students
            </Typography>
            <Typography variant="subtitle2">
              All content and materials in the journey of a computer science
              student.
            </Typography>
          </Box>
        </Grid>
        <Grid
          item
          xs={4}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          gap={"1rem"}
        >
          <Image
            src="/BackTeam.png"
            width={100}
            height={100}
            alt="BackTeam Logo "
          />
          <Typography variant="h6" component="div" color={"Main.primary"}>
            BackTeam&quot;2110
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              textAlign: "center",
              height: "100%",
              width: {
                xs: "85vw",
                sm: "100%",
              },
            }}
          >
            {BackTeamData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  flexBasis: "50%",
                }}
              >
                <NameHref
                  name={item.name}
                  dataName={item.dataName}
                  dataHref={item.dataHref}
                />
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid
          item
          xs={4}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          gap={"1rem"}
        >
          <Image src="/TNT.png" width={100} height={100} alt="TNT Logo " />
          <Typography variant="h6" component="div" color={"Main.primary"}>
            TNT&quot;2110
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              textAlign: "center",
              height: "100%",
              width: {
                xs: "85vw",
                sm: "100%",
              },
            }}
          >
            {TntData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  flexBasis: "50%",
                }}
              >
                <NameHref
                  name={item.name}
                  dataName={item.dataName}
                  dataHref={item.dataHref}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
      <Divider
        sx={{
          my: "3ch",
        }}
      />
      <Grid
        container
        justifyContent={"center"}
        alignItems={"center"}
        sx={{
          textAlign: "center",

          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h5"
          textAlign={"center"}
          sx={{
            width: {
              xs: "auto",
              sm: "50ch",
            },
          }}
        >
          Copyright The-Day &copy; &nbsp; 2021
          {new Date().getFullYear() === 2022
            ? ""
            : ` - ${new Date().getFullYear()}`}
        </Typography>

        <Typography variant="subtitle2" fontWeight={"100"} textAlign={"center"}>
          Developed by &nbsp;
        </Typography>

        <Box
          sx={{
            position: "relative",
            color: "#0685da",
            // bgcolor: "#121212",
            // transition: "all .2s ease-in-out",
            // "&:hover": {
            //   transform: "scale(1.2) rotate(5deg)",
            // },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "1%",
              width: "0",
              transition: "all .2s ease-in-out",
              bgcolor: "#3b82f6",
            },
            "&:hover::after": {
              width: "100%",
            },
            "& *": {
              textDecoration: "none !important",
            },
          }}
        >
          <NameHref
            name="Yasser Shaban"
            dataName={["LinkTree"]}
            dataHref={["https://linktr.ee/yasershaban03"]}
          />
        </Box>
        <Typography variant="subtitle2" fontWeight={"100"} textAlign={"center"}>
          &nbsp; | &nbsp;
        </Typography>

        <Box
          sx={{
            position: "relative",
            color: "#0685da",
            // bgcolor: "#121212",
            // transition: "all .2s ease-in-out",
            // "&:hover": {
            //   transform: "scale(1.2) rotate(5deg)",
            // },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "1%",
              width: "0",
              transition: "all .2s ease-in-out",
              bgcolor: "#3b82f6",
            },
            "&:hover::after": {
              width: "100%",
            },
            "& *": {
              textDecoration: "none !important",
            },
          }}
        >
          <NameHref
            name="Abdulrahman Tolba"
            dataName={["Github", "LinkedIn"]}
            dataHref={[
              "https://github.com/DevAbdoTolba",
              "https://www.linkedin.com/in/devabdotolba/",
            ]}
          />
        </Box>
        <Typography variant="subtitle2" fontWeight={"100"} textAlign={"center"}>
          &nbsp; | &nbsp;
        </Typography>

        <Box
          sx={{
            position: "relative",
            color: "#0685da",
            // bgcolor: "#121212",
            // transition: "all .2s ease-in-out",
            // "&:hover": {
            //   transform: "scale(1.2) rotate(5deg)",
            // },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "1%",
              width: "0",
              transition: "all .2s ease-in-out",
              bgcolor: "#3b82f6",
            },
            "&:hover::after": {
              width: "100%",
            },
            "& *": {
              textDecoration: "none !important",
            },
          }}
        >
          <NameHref
            name="Omar Farouq"
            dataName={["LinkTree"]}
            dataHref={["https://linktr.ee/omarfarouk27"]}
          />
        </Box>
        <Typography variant="subtitle2" fontWeight={"100"} textAlign={"center"}>
          &nbsp;
        </Typography>
      </Grid>
    </Box>
  );
}
