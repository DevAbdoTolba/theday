import { useState, useEffect } from "react";
import Note from "./Note.jsx";
import Grid from "@mui/material/Grid";
import FormDialog from "./FormDialog.jsx";

function Main({ search }) {
  const [notes, setNotes] = useLocalNotes();

  const handelDelete = (item) => {
    setNotes(notes.filter((n) => n !== item));
  };
  return (
    <Grid sx={{ marginTop: 2 }} container spacing={2} columns={3}>
      {notes
        .filter((n) => n.title.includes(search) || n.body.includes(search))
        .map((item, index) => (
          <Grid key={index} item sm={1} xs={3}>
            <Note
              title={item.title}
              body={item.body}
              handelDelete={handelDelete}
              item={item}
            />
          </Grid>
        ))}
      <FormDialog setNotes={setNotes} />
    </Grid>
  );
}

function useLocalNotes() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    try {
      const notes = window.localStorage.getItem("notes");
      if (notes) {
        setNotes(JSON.parse(notes));
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("notes", JSON.stringify(notes));
    } catch (error) {}
  }, [notes]);
  return [notes, setNotes];
}

export default Main;
