const { google } = require("googleapis");

/**
 * ENDPOINT 1: Get Folder Structure Only (Fast - ~2 seconds)
 * Returns: Subject folders and their category subfolders
 * Purpose: Show UI skeleton immediately while files load in background
 */

export default async function handler(req, res) {
  const timings = {
    steps: [],
    details: {},
  };
  
  const logTiming = (step, data = {}) => {
    const timestamp = Date.now() - timings.start;
    const logEntry = { step, timestamp, ...data };
    timings.steps.push(logEntry);
    
    // Safely stringify to avoid circular references and duplicate output
    const safeData = JSON.stringify(data, (key, value) => {
      // Skip large arrays in console output
      if (Array.isArray(value) && value.length > 10) {
        return `[${value.length} items]`;
      }
      return value;
    });
    
    console.log(`⏱️  [${timestamp}ms] ${step}`, safeData);
  };

  timings.start = Date.now();
  logTiming("🚀 REQUEST STARTED", { 
    subject: req.query.subject,
    region: process.env.VERCEL_REGION || "unknown" 
  });

  const { subject } = req.query;

  if (!subject) {
    logTiming("❌ NO SUBJECT PROVIDED");
    return res.status(400).json({ error: "Subject parameter required" });
  }

  try {
    // ========================================
    // STEP 1: Create Auth Client
    // ========================================
    const authStart = Date.now();
    logTiming("🔐 Creating Google Auth client...");
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    
    const authDuration = Date.now() - authStart;
    logTiming("✅ Auth client created", { duration: `${authDuration}ms` });
    timings.details.authCreation = authDuration;

    // ========================================
    // STEP 2: Create Drive Client
    // ========================================
    const driveStart = Date.now();
    logTiming("🔧 Creating Drive API client...");
    
    const drive = google.drive({ version: "v3", auth });
    
    const driveDuration = Date.now() - driveStart;
    logTiming("✅ Drive client created", { duration: `${driveDuration}ms` });
    timings.details.driveClient = driveDuration;

    // ========================================
    // STEP 3: Find Subject Folders
    // ========================================
    const findFoldersStart = Date.now();
    logTiming("🔍 Searching for subject folders...", { query: `name = '${subject}'` });
    
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });
    
    const findFoldersDuration = Date.now() - findFoldersStart;
    logTiming("✅ Subject folders found", { 
      count: SubjectFolders.files?.length || 0,
      duration: `${findFoldersDuration}ms`,
      folderIds: SubjectFolders.files?.map(f => f.id) || []
    });
    timings.details.findFolders = findFoldersDuration;

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      logTiming("⚠️  NO FOLDERS FOUND - Returning empty structure");
      timings.total = Date.now() - timings.start;
      
      return res.status(200).json({
        folderStructure: {},
        timings,
        message: "No folders found for this subject"
      });
    }

    const SubjectFolderIds = SubjectFolders.files.map((folder) => folder.id);
    logTiming("📋 Processing folder IDs", { 
      count: SubjectFolderIds.length,
      ids: SubjectFolderIds 
    });

    // ========================================
    // STEP 4: Get Category Subfolders (Sequential with timing per folder)
    // ========================================
    const subfoldersStart = Date.now();
    logTiming("📂 Fetching category subfolders...", { 
      parentFolders: SubjectFolderIds.length 
    });
    
    const folderStructure = {};
    let totalCategories = 0;

    for (let i = 0; i < SubjectFolderIds.length; i++) {
      const folderId = SubjectFolderIds[i];
      const folderIterStart = Date.now();
      
      logTiming(`📁 Fetching subfolders for folder ${i + 1}/${SubjectFolderIds.length}`, { 
        folderId 
      });

      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      });

      const folderIterDuration = Date.now() - folderIterStart;
      const categoryCount = SubjectSubFolders.files?.length || 0;
      totalCategories += categoryCount;

      logTiming(`✅ Subfolders fetched for folder ${i + 1}`, { 
        folderId,
        categories: categoryCount,
        duration: `${folderIterDuration}ms`,
        categoryNames: SubjectSubFolders.files?.map(f => f.name) || []
      });

      if (SubjectSubFolders.files) {
        SubjectSubFolders.files.forEach((subFolder) => {
          folderStructure[subFolder.id] = {
            id: subFolder.id,
            name: subFolder.name,
            parentId: folderId,
          };
        });
      }

      timings.details[`folder_${i + 1}`] = folderIterDuration;
    }

    const subfoldersDuration = Date.now() - subfoldersStart;
    logTiming("✅ ALL CATEGORY SUBFOLDERS FETCHED", { 
      totalCategories,
      duration: `${subfoldersDuration}ms`,
      avgPerFolder: `${(subfoldersDuration / SubjectFolderIds.length).toFixed(2)}ms`
    });
    timings.details.allSubfolders = subfoldersDuration;

    if (totalCategories === 0) {
      logTiming("⚠️  NO CATEGORY FOLDERS FOUND");
      timings.total = Date.now() - timings.start;
      
      return res.status(200).json({
        folderStructure: {},
        timings,
        message: "No category folders found"
      });
    }

    // ========================================
    // FINAL: Return Structure
    // ========================================
    timings.total = Date.now() - timings.start;
    logTiming("🎉 REQUEST COMPLETED", { 
      totalDuration: `${timings.total}ms`,
      categories: totalCategories 
    });

    // Log summary table
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 PERFORMANCE SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Subject:          ${subject}`);
    console.log(`Auth creation:    ${timings.details.authCreation}ms`);
    console.log(`Drive client:     ${timings.details.driveClient}ms`);
    console.log(`Find folders:     ${timings.details.findFolders}ms`);
    console.log(`Get subfolders:   ${timings.details.allSubfolders}ms`);
    console.log(`Total time:       ${timings.total}ms`);
    console.log(`Categories found: ${totalCategories}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return res.status(200).json({
      folderStructure,
      metadata: {
        subject,
        totalCategories,
        parentFolders: SubjectFolderIds.length,
      },
      timings,
    });

  } catch (error) {
    const errorTime = Date.now() - timings.start;
    logTiming("❌ ERROR OCCURRED", { 
      message: error.message,
      stack: error.stack,
      atTime: `${errorTime}ms`
    });
    
    console.error("\n🔥 ERROR DETAILS:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Timings:", JSON.stringify(timings, null, 2));

    return res.status(500).json({ 
      error: "Failed to fetch folder structure",
      details: error.message,
      timings 
    });
  }
}