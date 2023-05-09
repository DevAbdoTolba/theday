const { google } = require("googleapis");

export default async function handler(req, res) {
  // calculate time
  const start = Date.now();

  const { subject } = req.query;

  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: process?.env?.TYPE,
      project_id: process?.env?.PROJECT_ID,
      private_key_id: process?.env?.PRIVATE_KEY_ID,
      private_key: process?.env?.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process?.env?.CLIENT_EMAIL,
      client_id: process?.env?.CLIENT_ID,
      auth_uri: process?.env?.AUTH_URI,
      token_uri: process?.env?.TOKEN_URI,
      auth_provider_x509_cert_url: process?.env?.AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process?.env?.CLIENT_X509_CERT_URL,
    },
    scopes: SCOPES,
  });

  const GetDataOfSubject = async (subject) => {
    let FilesData = {};
    const { data: SubjectFolders } = await google
      ?.drive({ version: "v3", auth })
      ?.files?.list({
        q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      });
    const SubjectFolderId = SubjectFolders?.files[0]?.id;
    const { data: SubjectSubFolders } = await google
      ?.drive({ version: "v3", auth })
      ?.files?.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
      });
    let Parents = "";
    let dic = {};
    for (let i = 0; i < SubjectSubFolders?.files?.length; i++) {
      dic[SubjectSubFolders?.files[i]?.id] = SubjectSubFolders?.files[i]?.name;
      Parents += `'${SubjectSubFolders?.files[i]?.id}' in parents`;
      if (i != SubjectSubFolders?.files?.length - 1) {
        Parents += " or ";
      }
    }

    if (Parents.length <= 0) return FilesData;

    const Files = await google?.drive({ version: "v3", auth })?.files?.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents)",
      pageSize: 1000,
    });
    for (let i = 0; i < Files?.data?.files?.length; i++) {
      if (!FilesData[dic[Files?.data?.files[i]?.parents[0]]]) {
        FilesData[dic[Files?.data?.files[i]?.parents[0]]] = [];
      }
      FilesData[dic[Files?.data?.files[i]?.parents[0]]]?.push(
        Files?.data?.files[i]
      );
    }

    return FilesData;
  };

  const GetDataOfSubjectData = await GetDataOfSubject(subject);

  const end = Date.now();
  console.log(`Execution time: ${end - start} ms`);
  res.status(200).json(GetDataOfSubjectData);
}
