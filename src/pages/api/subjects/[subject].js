const { google } = require("googleapis");
const fs = require('fs');
import mongoose from "mongoose";
const connectToDB = require("../../../Data/mongoConnection");

export default async function handler(req, res) {
  // calculate time

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


  // const drive = google.drive({ version: 'v3', auth });
  // const getChanges = async (pageToken) => {
  //   try {
  //     let response = await drive.changes.list({
  //       pageToken: pageToken,
  //       spaces: 'drive',
  //     });
  
  //     console.log('Changes:', response.data.changes);
  
  //     if (response.data.newStartPageToken) {
  //       console.log('New start page token:', response.data.newStartPageToken);
  //     }
  
  //     if (response.data.nextPageToken) {
  //       console.log(response.data.nextPageToken)
  //       await getChanges(response.data.nextPageToken);
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving changes:', error);
  //   }
  // };

  // const getDriveChanges = async () => {
  //   try {
  //     let response = await drive.changes.getStartPageToken();
  //     const pageToken = response.data.startPageToken;
  //     console.log(pageToken);
  //     await getChanges(1);
  //   } catch (error) {
  //     console.error('Error retrieving start page token:', error);
  //   }
  // };

  const GetDataOfSubject = async (subject) => {

    const itemsModel = await connectToDB();

    let now = new Date();
                          
    let ans = await itemsModel.aggregate([
      {
        $match: { name: subject, type: "folder", trashed: false }
      },
      {
        $graphLookup: {
          from: "items",
          startWith: "$subfolders",
          connectFromField: "subfolders",
          connectToField: "id",
          as: "subfolders",
          restrictSearchWithMatch: { trashed: false } // Skip trashed subfolders
        }
      },
      {
        $unwind: "$subfolders"
      },
      {
        $match: { "subfolders.trashed": false } // Ensure only non-trashed subfolders
      },
      {
        $unwind: "$subfolders.files"
      },
      {
        $lookup: {
          from: "items",
          localField: "subfolders.files",
          foreignField: "id",
          as: "fileDetails",
          pipeline: [
            { $match: { trashed: false } } // Skip trashed files in the lookup
          ]
        }
      },
      {
        $addFields: {
          "subfolders.files": { $arrayElemAt: ["$fileDetails", 0] }
        }
      },
      {
        $group: {
          _id: {
            subfolderId: "$subfolders._id",
            folderId: "$_id"
          },
          id: { $first: "$id" },
          name: { $first: "$name" },
          subfolderId: { $first: "$subfolders.id" },
          subfolderName: { $first: "$subfolders.name" },
          subfolderV: { $first: "$subfolders.__v" },
          files: { $push: "$subfolders.files" },
          subfolders: { $first: "$subfolders.subfolders" }
        }
      },
      {
        $group: {
          _id: "$_id.folderId",
          id: { $first: "$id" },
          name: { $first: "$name" },
          subfolders: {
            $push: {
              _id: "$_id.subfolderId",
              id: "$subfolderId",
              name: "$subfolderName",
              files: "$files",
              subfolders: "$subfolders",
              __v: "$subfolderV"
            }
          }
        }
      }
    ]);
    

    let FilesData = {};

    ans[0].subfolders = ans[0].subfolders.sort((a, b) => a.name.localeCompare(b.name));


    for (let i = 0; i < ans[0].subfolders.length; i++) {
      const folder = ans[0].subfolders[i];
      // FilesData[folder.name] = folder.files;
      FilesData[folder.name] = folder.files.sort((a, b) => a.name.localeCompare(b.name));
      // console.log(folder);
    }





    // const util = require('util');
    // console.log(util.inspect(ans, { depth: null, colors: true }));
    
    

    // let endd = new Date();
    // console.log("Time to find the folder", endd - now);




//   const data = JSON.parse(fs.readFileSync("C:\\Users\\Yaser\\Downloads\\google_drive_data_files.json", 'utf8'));
  
  
//   console.log("begin save");


// // use promise all
//   const folders = data.map(folder => new itemsModel(folder));
  
//   itemsModel.insertMany(folders)
//     .then(() => {
//       console.log("saved");
//     })
//     .catch(error => {
//       console.error("Error saving folders:", error);
//     });





return FilesData;

  //   let FilesData = {};

  //   const drive = google.drive({ version: "v3", auth });

  //   // Fetch all folders with the given subject name
  
    
  //   const { data: SubjectFolders } = await drive.files.list({
  //     q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
  //     fields: "files(id, name)",
  //   });



  //   if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
  //     return FilesData;
  //   }

  //   // Collect all SubjectFolderIds
  //   const SubjectFolderIds = SubjectFolders.files.map(folder => folder.id);
  //   let Parents = "";
  //   let dic = {};

  //   for (const SubjectFolderId of SubjectFolderIds) {
  //     const { data: SubjectSubFolders } = await drive.files.list({
  //       q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
  //       fields: "files(id, name)",
  //     });

  //     for (const subFolder of SubjectSubFolders.files) {
  //       dic[subFolder.id] = subFolder.name;
  //       Parents += `'${subFolder.id}' in parents OR `;
  //     }
  //   }

  //   Parents = Parents.slice(0, -4); // Remove the trailing " OR "

  //   if (Parents.length <= 0) return FilesData;

  //   // Fetch all files within the subfolders

  //   const start = Date.now();

  //   const { data: Files } = await drive.files.list({
  //     q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
  //     fields: "files(mimeType,name,size,id,parents,owners(emailAddress))",
  //     pageSize: 1000,
  //   });

  //   const end = Date.now();
  //   console.log(`Execution time: ${end - start} ms`);


  //   for (const file of Files.files) {
  //     const parentName = dic[file.parents[0]];
  //     if (!FilesData[parentName]) {
  //       FilesData[parentName] = [];
  //     }
  //     FilesData[parentName].push(file);
  //   }

  //   return FilesData;
  };

  try {

    // await getDriveChanges();

    let start = new Date();

    const GetDataOfSubjectData = await GetDataOfSubject(subject);


    let end = new Date();
    console.log("Time to get the data", end - start);

    res.status(200).json(GetDataOfSubjectData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}