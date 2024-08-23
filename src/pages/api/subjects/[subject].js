import { unstable_cache } from "next/cache";
const { google } = require("googleapis");

export default async function handler(req, res) {
  const start = Date.now();
  const { subject, cache } = req.query;

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

  const GetDataOfSubject = async (subject, auth) => {
    let FilesData = {};
    const drive = google.drive({ version: "v3", auth });

    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      return FilesData;
    }

    const SubjectFolderIds = SubjectFolders.files.map((folder) => folder.id);
    let Parents = "";
    let dic = {};

    for (const SubjectFolderId of SubjectFolderIds) {
      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
        fields: "files(id, name)",
      });

      for (const subFolder of SubjectSubFolders.files) {
        dic[subFolder.id] = subFolder.name;
        Parents += `'${subFolder.id}' in parents OR `;
      }
    }

    Parents = Parents.slice(0, -4); // Remove the trailing " OR "

    if (Parents.length <= 0) return FilesData;

    const { data: Files } = await drive.files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents,owners(emailAddress))",
      pageSize: 1000,
    });

    for (const file of Files.files) {
      const parentName = dic[file.parents[0]];
      if (!FilesData[parentName]) {
        FilesData[parentName] = [];
      }
      FilesData[parentName].push(file);
    }

    return FilesData;
  };

  const getCachedSubjectData = unstable_cache(
    async (subject, auth) => {
      return await GetDataOfSubject(subject, auth);
    },
    [subject], // Cache key based on subject
    {
      tags: [subject], // Tag the cache with subject for easier invalidation
      revalidate: false, // Prevents automatic revalidation unless manually triggered
    }
  );

  try {

    const data = await getCachedSubjectData(subject, auth);

    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
