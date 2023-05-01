const path = require("path");
const { google } = require("googleapis");

export default async function handler(req, res) {
  // calculate time
  const start = Date.now();
  const KEYFILEPATH = path.join("src/Data/credentials.json");

  const { subject } = req.query;

  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const GetDataOfSubject = async () => {
    let FilesData = {};
    const { data } = await google.drive({ version: "v3", auth }).files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
    });
    let SubjectFolderFolderId = data.files[0].id;
    const SubjectSubFolders = await google
      .drive({ version: "v3", auth })
      .files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderFolderId}' in parents`,
      });
    let Parents = "";
    let dic = {};
    for (let i = 0; i < SubjectSubFolders.data.files.length; i++) {
      dic[SubjectSubFolders.data.files[i].id] =
        SubjectSubFolders.data.files[i]?.name;
      Parents += `'${SubjectSubFolders.data.files[i].id}' in parents`;
      if (i != SubjectSubFolders.data.files.length - 1) {
        Parents += " or ";
      }
    }

    const Files = await google.drive({ version: "v3", auth }).files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents)",
      pageSize: 1000,
    });

    for (let i = 0; i < Files.data.files.length; i++) {
      if (!FilesData[dic[Files.data.files[i].parents[0]]]) {
        FilesData[dic[Files.data.files[i].parents[0]]] = [];
      }
      FilesData[dic[Files.data.files[i].parents[0]]].push(Files.data.files[i]);
    }

    return FilesData;
  };

  const GetDataOfSubjectData = await GetDataOfSubject();

  const end = Date.now();
  console.log(`Execution time: ${end - start} ms`);
  res.status(200).json(GetDataOfSubjectData);
}
