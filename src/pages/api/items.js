const connectToDB = require("../../Data/mongoConnection");

export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  try {
  const itemsModel = await connectToDB();
  const bulkOps = req.body.data.map(item => {

  switch (item.Type) {
    
   case 'create':
      return [
       {
        insertOne: {
          document: {
            id: item.ID,
            name: item.title,
            type: item.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
            mimeType: item.mimeType ,
            createdAt: item.createdAt,
            ...(item.mimeType === 'application/vnd.google-apps.folder' ? {
              subfolders: [],
              files: [],
              mimeType: undefined, // mimeType is only included if type is 'file'
              createdAt: undefined // createdAt is only included if type is 'file'
            } : {})
          }
        }
      },
       {
        updateOne: {
          filter: { id: item.parentID },
          update: { $push: item.mimeType === 'application/vnd.google-apps.folder' ? { subfolders: item.ID } : { files: item.ID } }
        }
      }
    ]
  
    case 'rename':
      return {
        updateOne: {
          filter: { id: item.id },
          update: { name: item.newName }
        }
      };

    case 'move':
      return [
        {
          updateOne: {
            filter: { id: item.oldParent },
            update: item.mimeType === 'application/vnd.google-apps.folder'
              ? { $pull: { subfolders: item.id } }
              : { $pull: { files: item.id } }
          }
        },
        {
          updateOne: {
            filter: { id: item.newParent },
            update: item.mimeType === 'application/vnd.google-apps.folder'
              ? { $push: { subfolders: item.id } }
              : { $push: { files: item.id } }
          }
        }
      ];

      case 'restore':
        return [{
          updateOne: {
            filter: { id: item.id },
            update: { trashed: false }
          }
        }];

    case 'delete':

        if(item.delType === "TRASH"){
          return [{
            updateOne: {
              filter: { id: item.id },
              update: { trashed: true }
            }
          }];
        }else{
         return [{
            deleteOne: {
              filter: { id: item.id }
          }
        },
        {
          updateOne: {
            filter: {
              $or: [
                { subfolders: item.id },
                { files: item.id }
              ]
            },
            update: {
              $pull: {
                subfolders: item.id,
                files: item.id
              }
            }
          }
        }
        
      
      ]
      };
  }
  });


    const result = await itemsModel.bulkWrite(bulkOps.flat());
    res.status(200).json({"success":"success"});
    return;

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}
