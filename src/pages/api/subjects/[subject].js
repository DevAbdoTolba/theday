import data from "src/Data/data.json";

export default function handler(req, res) {
  // get params
  const { subject } = req.query;
  // filter data
  console.log(subject);
  const filteredSubjectAbbreviation = data.semesters
    .filter(
      (item) =>
        item.subjects.filter((subjects) => subjects.abbreviation === subject)
          .length > 0
    )
    .map((subjects) =>
      subjects.subjects
        .filter((item) => item.abbreviation === subject)
        .map((item) => item.abbreviation)
    )
    // extrace the text from the array
    .flat()[0];

  console.log(filteredSubjectAbbreviation);
  res.status(200).json(filteredSubjectAbbreviation);
}
