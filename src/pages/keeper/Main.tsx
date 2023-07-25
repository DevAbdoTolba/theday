import Note from "./Note";
import Grid from "@mui/material/Grid";

interface Props {
  search: string;
  notes: any;
  setNotes: React.Dispatch<React.SetStateAction<note[]>>;
}

interface note {
  title: string;
  body: string;
}

function Main({ search, notes, setNotes }: Props) {
  const handelDelete = (item: { title: string; body: string }) => {
    setNotes(notes?.filter((n: { title: string; body: string }) => n !== item));
  };
  return (
    <Grid sx={{ marginTop: 2 }} container spacing={2} columns={3}>
      {notes
        ?.filter(
          (n: { title: string; body: string }) =>
            n?.title?.includes(search) || n?.body?.includes(search)
        )
        .map((item: { title: string; body: string }, index: number) => (
          <Grid key={index} item sm={1} xs={3}>
            <Note
              title={item?.title}
              body={item?.body}
              handelDelete={handelDelete}
              item={item}
            />
          </Grid>
        ))}
    </Grid>
  );
}

export default Main;
