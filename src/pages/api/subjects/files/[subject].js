const { google } = require("googleapis");

/**
 * ENDPOINT: Get All Files for a Subject
 * Works with both GET and POST
 * POST can include folderStructure to skip rebuilding it
 */

export default async function handler(req, res) {
  // Only allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timings = {
    steps: [],
    details: {},
  };
  
  const logTiming = (step, extraData = {}) => {
    const timestamp = Date.now() - timings.start;
    timings.steps.push({ step, timestamp });
    
    // Simple logging without complex objects
    if (Object.keys(extraData).length > 0) {
      console.log(`⏱️  [${timestamp}ms] ${step}:`, extraData);
    } else {
      console.log(`⏱️  [${timestamp}ms] ${step}`);
    }
  };

  timings.start = Date.now();
  logTiming("🚀 FILES REQUEST STARTED", { 
    subject: req.query.subject,
    method: req.method 
  });

  const { subject } = req.query;
  
  if (!subject) {
    logTiming("❌ NO SUBJECT PROVIDED");
    return res.status(400).json({ error: "Subject parameter required" });
  }

  // Get folderStructure from POST body if provided
  let providedFolderStructure = null;
  if (req.method === 'POST' && req.body && req.body.folderStructure) {
    providedFolderStructure = req.body.folderStructure;
    logTiming("📋 Received folder structure from request body", {
      categoriesProvided: Object.keys(providedFolderStructure).length
    });
  }

  try {
    // ========================================
    // STEP 1: Create Auth Client
    // ========================================
    const authStart = Date.now();
    logTiming("🔐 Creating Google Auth client");
    
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
    logTiming("🔧 Creating Drive API client");
    
    const drive = google.drive({ version: "v3", auth });
    
    const driveDuration = Date.now() - driveStart;
    logTiming("✅ Drive client created", { duration: `${driveDuration}ms` });
    timings.details.driveClient = driveDuration;

    // ========================================
    // STEP 3: Get or Rebuild Folder Structure
    // ========================================
    let categoryMap = {};
    let categoryIds = [];

    if (providedFolderStructure && Object.keys(providedFolderStructure).length > 0) {
      // Use provided folder structure (optimization)
      logTiming("📋 Using provided folder structure", { 
        categories: Object.keys(providedFolderStructure).length 
      });
      
      // Convert provided structure to our format
      Object.entries(providedFolderStructure).forEach(([id, folder]) => {
        categoryMap[id] = folder.name || folder;
        categoryIds.push(id);
      });
      
      timings.details.folderStructure = "provided";
    } else {
      // Rebuild folder structure
      logTiming("🔍 Rebuilding folder structure");
      const rebuildStart = Date.now();

      const { data: SubjectFolders } = await drive.files.list({
        q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id, name)",
      });

      logTiming("✅ Subject folders found", { 
        count: SubjectFolders.files?.length || 0 
      });

      if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
        logTiming("⚠️  NO FOLDERS FOUND");
        timings.total = Date.now() - timings.start;
        return res.status(200).json({
          filesData: {},
          timings,
          message: "No folders found"
        });
      }

      const SubjectFolderIds = SubjectFolders.files.map((f) => f.id);

      for (let i = 0; i < SubjectFolderIds.length; i++) {
        const folderId = SubjectFolderIds[i];
        logTiming(`📁 Fetching subfolders ${i + 1}/${SubjectFolderIds.length}`);

        const { data: SubjectSubFolders } = await drive.files.list({
          q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
          fields: "files(id, name)",
          pageSize: 1000,
        });

        if (SubjectSubFolders.files) {
          SubjectSubFolders.files.forEach((subFolder) => {
            categoryMap[subFolder.id] = subFolder.name;
            categoryIds.push(subFolder.id);
          });
        }
      }

      const rebuildDuration = Date.now() - rebuildStart;
      logTiming("✅ Folder structure rebuilt", { 
        duration: `${rebuildDuration}ms`,
        categories: categoryIds.length 
      });
      timings.details.folderStructure = rebuildDuration;
    }

    if (categoryIds.length === 0) {
      logTiming("⚠️  NO CATEGORY FOLDERS FOUND");
      timings.total = Date.now() - timings.start;
      return res.status(200).json({
        filesData: {},
        timings,
        message: "No category folders found"
      });
    }

    // ========================================
    // STEP 4: Build Query for All Files
    // ========================================
    const queryStart = Date.now();
    logTiming("🔨 Building files query", { 
      categoryCount: categoryIds.length 
    });
    
    const parentsQuery = categoryIds
      .map((id) => `'${id}' in parents`)
      .join(" OR ");
    
    const queryDuration = Date.now() - queryStart;
    logTiming("✅ Query built", { 
      duration: `${queryDuration}ms`,
      categories: categoryIds.length 
    });
    timings.details.queryBuild = queryDuration;

    // ========================================
    // STEP 5: Fetch ALL Files
    // ========================================
    const filesStart = Date.now();
    logTiming("📥 Fetching ALL files from Google Drive");

    const { data: Files } = await drive.files.list({
      q: `(${parentsQuery}) and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents)",
      pageSize: 1000,
    });

    const filesDuration = Date.now() - filesStart;
    const fileCount = Files.files?.length || 0;
    
    logTiming("✅ ALL FILES FETCHED", { 
      duration: `${filesDuration}ms`,
      count: fileCount
    });
    timings.details.fetchFiles = filesDuration;
    timings.details.fileCount = fileCount;

    if (!Files.files || Files.files.length === 0) {
      logTiming("⚠️  NO FILES FOUND");
      timings.total = Date.now() - timings.start;
      return res.status(200).json({
        filesData: {},
        timings,
        message: "No files found in categories"
      });
    }

    // ========================================
    // STEP 6: Organize Files by Category
    // ========================================
    const organizeStart = Date.now();
    logTiming("📦 Organizing files by category");
    
    const filesData = {};
    let organizedCount = 0;
    let skippedCount = 0;

    Files.files.forEach((file) => {
      const parentId = file.parents?.[0];
      const parentName = categoryMap[parentId];
      
      if (parentName) {
        if (!filesData[parentName]) {
          filesData[parentName] = [];
        }
        filesData[parentName].push(file);
        organizedCount++;
      } else {
        skippedCount++;
      }
    });

    const organizeDuration = Date.now() - organizeStart;
    logTiming("✅ Files organized", { 
      duration: `${organizeDuration}ms`,
      categories: Object.keys(filesData).length,
      organized: organizedCount,
      skipped: skippedCount
    });
    timings.details.organize = organizeDuration;

    // ========================================
    // FINAL: Return Data
    // ========================================
    timings.total = Date.now() - timings.start;
    logTiming("🎉 FILES REQUEST COMPLETED", { 
      totalDuration: `${timings.total}ms`
    });

    // Print summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 FILES PERFORMANCE SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Subject:          ${subject}`);
    console.log(`Auth creation:    ${timings.details.authCreation}ms`);
    console.log(`Drive client:     ${timings.details.driveClient}ms`);
    console.log(`Folder structure: ${timings.details.folderStructure === "provided" ? "provided" : timings.details.folderStructure + "ms"}`);
    console.log(`Query build:      ${timings.details.queryBuild}ms`);
    console.log(`Fetch files:      ${timings.details.fetchFiles}ms`);
    console.log(`Organize files:   ${timings.details.organize}ms`);
    console.log(`Total time:       ${timings.total}ms`);
    console.log(`Files fetched:    ${fileCount}`);
    console.log(`Categories:       ${Object.keys(filesData).length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return res.status(200).json({
      filesData,
      metadata: {
        subject,
        totalFiles: fileCount,
        categories: Object.keys(filesData).length,
        organized: organizedCount,
        skipped: skippedCount,
      },
      timings,
    });

  } catch (error) {
    const errorTime = Date.now() - timings.start;
    logTiming("❌ ERROR OCCURRED", { 
      message: error.message,
      atTime: `${errorTime}ms`
    });
    
    console.error("\n🔥 ERROR DETAILS:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({ 
      error: "Failed to fetch files",
      details: error.message,
      timings 
    });
  }
}