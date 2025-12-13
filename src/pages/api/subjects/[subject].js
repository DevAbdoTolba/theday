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

    // Step 1: Find subject folders
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      return FilesData;
    }

    // Use only the first subject folder (matching old logic)
    const SubjectFolderId = SubjectFolders.files[0].id;
    
    // Step 2: Get subfolders from the first subject folder
    const { data: SubjectSubFolders } = await drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
      fields: "files(id, name)",
      pageSize: 1000,
    });

    if (!SubjectSubFolders.files || SubjectSubFolders.files.length === 0) {
      return FilesData;
    }

    // Build the dictionary and parent query
    const dic = {};
    const parentIds = [];
    for (const subFolder of SubjectSubFolders.files) {
      dic[subFolder.id] = subFolder.name;
      parentIds.push(subFolder.id);
    }

    // Step 3: Get all files in a single query
    const parentsQuery = parentIds
      .map((id) => `'${id}' in parents`)
      .join(" OR ");

    const { data: Files } = await drive.files.list({
      q: `(${parentsQuery}) and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents,owners(emailAddress))",
      pageSize: 1000,
    });

    if (!Files.files) {
      return FilesData;
    }

    // Organize files by parent folder
    for (const file of Files.files) {
      const parentName = dic[file.parents[0]];
      if (parentName) {
        if (!FilesData[parentName]) {
          FilesData[parentName] = [];
        }
        FilesData[parentName].push(file);
      }
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
    }
  );

  try {
    // const data = await getCachedSubjectData(subject, auth);
    const data = await GetDataOfSubject(subject, auth);

    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
