"use client";
import { Button, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import React, { useEffect } from "react";

interface Props {
  name: string;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2";
  dataName: string[];
  dataHref: string[];
}

export default function NameHref({ name, dataName, dataHref, variant }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [title, setTitle] = React.useState(
    dataHref.map((item) => {
      try {
        let temp = new URL(item);
        return "" + temp.pathname;
      } catch {
        return item;
      }
    })
  );

  React.useEffect(() => {
    setTitle((prev) => {
      let temp = prev;
      temp.map((item) => {
        try {
          let parsedUrl = new URL(item);
          //   console.log(parsedUrl.hostname + parsedUrl.pathname);
          return "" + parsedUrl.hostname + parsedUrl.pathname + "hello";
        } catch (e) {
          console.error(e);
          return item + "hello";
        }
      });

      return temp;
    });
  }, []);

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          all: "unset",
          cursor: "pointer",
          "&:hover": {
            all: "unset",
          },
        }}
        disableRipple
      >
        <Typography
          sx={{
            textDecoration: "none",
            color: "inherit",
            "&:hover": {
              color: "Main.primary",
              textDecoration: "underline",
              cursor: "pointer",
            },
          }}
          variant={variant ? variant : "subtitle2"}
          fontWeight={"100"}
          textAlign={"left"}
        >
          {name}
        </Typography>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {dataName.map((item, index) => (
          <Tooltip
            key={index}
            title={title[index]}
            placement="right"
            arrow
            TransitionProps={{ timeout: 200 }}
          >
            <MenuItem
              key={item}
              onClick={handleClose}
              sx={{
                textDecoration: "none",
                color: "#fff",
                "&:hover": {
                  textDecoration: "underline",
                },
                "& *": {
                  all: "unset",
                  fontSize: "1.5ch",
                },
              }}
            >
              <Link target="_blank" href={dataHref[index]}>
                {item}
              </Link>
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>
    </>
  );
}
