import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";

interface Props {
  title: string;
  body: string;
  handelDelete: (item: any) => void;
  item: any;
}

export default function BasicCard({ title, body, handelDelete, item }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>

        <Typography variant="body2">{body}</Typography>

        <IconButton
          aria-label="delete"
          sx={{ position: "relative", right: "-85%" }}
          onClick={() => handelDelete(item)}
        >
          <Tooltip title="Delete">
            <DeleteIcon />
          </Tooltip>
        </IconButton>
      </CardContent>
    </Card>
  );
}
