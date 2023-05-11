import Note from "./Note.jsx";
import Grid from "@mui/material/Grid";

function Main({ search, notes, setNotes }) {
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
    </Grid>
  );
}

export default Main;
