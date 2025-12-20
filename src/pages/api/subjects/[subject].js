const { google } = require("googleapis");

export default async function handler(req, res) {
  const start = Date.now();
  const { subject } = req.query;

  if (!subject) {
    return res.status(400).json({ error: "Subject parameter required" });
  }

  const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

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

  try {
    let FilesData = {};
    const drive = google.drive({ version: "v3", auth });

    // CALL 1: Find ALL subject folders
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      const end = Date.now();
      console.log(`${subject} => No folders found (${end - start}ms)`);
      return res.status(200).json(FilesData);
    }

    // Process ALL subject folders
    const SubjectFolderIds = SubjectFolders.files.map((folder) => folder.id);
    let Parents = "";
    let dic = {};

    // CALL 2: Get subfolders from ALL subject folders
    for (const SubjectFolderId of SubjectFolderIds) {
      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      });

      if (SubjectSubFolders.files) {
        for (const subFolder of SubjectSubFolders.files) {
          dic[subFolder.id] = subFolder.name;
          Parents += `'${subFolder.id}' in parents OR `;
        }
      }
    }

    Parents = Parents.slice(0, -4); // Remove trailing " OR "

    if (Parents.length <= 0) {
      const end = Date.now();
      console.log(`${subject} => No subfolders found (${end - start}ms)`);
      return res.status(200).json(FilesData);
    }

    // CALL 3: Get ALL files in one query
    const { data: Files } = await drive.files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents,owners(emailAddress))",
      pageSize: 1000,
    });

    if (Files.files) {
      for (const file of Files.files) {
        const parentName = dic[file.parents[0]];
        if (parentName) {
          if (!FilesData[parentName]) {
            FilesData[parentName] = [];
          }
          FilesData[parentName].push(file);
        }
      }
    }

    const end = Date.now();
    console.log(`${subject} => Success (${end - start}ms) - ${Files.files?.length || 0} files`);

    res.status(200).json(FilesData);
  } catch (error) {
    console.error("Error fetching data:", error);
    const end = Date.now();
    console.log(`${subject} => Error (${end - start}ms)`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}