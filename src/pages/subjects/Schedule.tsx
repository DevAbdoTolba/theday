import React, { useState } from "react";
import { Typography } from "@mui/material";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import ScheduleDialog from "./ScheduleDialog";
import Image from "next/image";

interface Props {
  name: string;
  abbreviation: string;
  material: string;
  PreviousExams: string;
  schedule: string;
  description: string;
}

function Schedule({
  name,
  abbreviation,
  material,
  PreviousExams,
  schedule,
  description,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ImageList cols={1}>
        <ImageListItem
          sx={{ width: "50vw", height: "auto", cursor: "pointer" }}
          onClick={() => setOpen(true)}
        >
          <Image src={schedule} alt="schedule" loading="lazy" />
        </ImageListItem>
      </ImageList>
      <ScheduleDialog open={open} setOpen={setOpen} schedule={schedule} />
    </>
  );
}

export default Schedule;
