"use client";
import { Button, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import React, { useEffect } from "react";

interface Props {
  name: string;

  dataName: string[];
  dataHref: string[];
}

export default function NameHref({ name, dataName, dataHref }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [title, setTitle] = React.useState(dataHref);

  React.useEffect(() => {
    setTitle((prev) => {
      let temp = prev;
      temp.map((item) => {
        try {
          const parsedUrl = new URL(item);
          //   console.log(parsedUrl.hostname + parsedUrl.pathname);
          return parsedUrl.hostname + parsedUrl.pathname;
        } catch (e) {
          console.error(e);
          return item;
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
          variant="subtitle2"
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
