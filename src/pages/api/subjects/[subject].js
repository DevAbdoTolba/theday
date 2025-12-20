const { google } = require("googleapis");

/**
 * ENDPOINT 3: Combined Endpoint (Original Logic + Verbose Timing)
 * This is your fallback/legacy endpoint with detailed timing
 * Use the split endpoints for better performance
 */

export default async function handler(req, res) {
  const timings = {
    steps: [],
    details: {},
    apiCalls: [],
  };
  
  const logTiming = (step, data = {}) => {
    const timestamp = Date.now() - timings.start;
    timings.steps.push({ step, timestamp, ...data });
    console.log(`⏱️  [${timestamp}ms] ${step}`, JSON.stringify(data, null, 2));
  };

  const logApiCall = (callName, duration, result = {}) => {
    timings.apiCalls.push({ callName, duration, ...result });
    console.log(`🌐 API CALL: ${callName} took ${duration}ms`, result);
  };

  timings.start = Date.now();
  logTiming("🚀 COMBINED REQUEST STARTED", { 
    subject: req.query.subject,
    method: req.method,
    region: process.env.VERCEL_REGION || "unknown",
    nodeVersion: process.version,
  });

  const { subject } = req.query;

  if (!subject) {
    logTiming("❌ NO SUBJECT PROVIDED");
    return res.status(400).json({ error: "Subject parameter required" });
  }

  try {
    // ========================================
    // STEP 1: Environment Check
    // ========================================
    const envStart = Date.now();
    logTiming("🔍 Checking environment variables...");
    
    const hasClientEmail = !!process.env.CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.PRIVATE_KEY;
    const privateKeyLength = process.env.PRIVATE_KEY?.length || 0;
    
    logTiming("✅ Environment check complete", { 
      hasClientEmail,
      hasPrivateKey,
      privateKeyLength,
      duration: `${Date.now() - envStart}ms`
    });

    // ========================================
    // STEP 2: Create Auth Client
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
    // STEP 3: Create Drive Client
    // ========================================
    const driveStart = Date.now();
    logTiming("🔧 Creating Drive API client...");
    
    const drive = google.drive({ version: "v3", auth });
    
    const driveDuration = Date.now() - driveStart;
    logTiming("✅ Drive client created", { duration: `${driveDuration}ms` });
    timings.details.driveClient = driveDuration;

    // ========================================
    // STEP 4: Find Subject Folders (API CALL 1)
    // ========================================
    const findFoldersStart = Date.now();
    logTiming("🔍 API CALL 1: Searching for subject folders...", { 
      query: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`
    });
    
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });
    
    const findFoldersDuration = Date.now() - findFoldersStart;
    logApiCall("Find Subject Folders", findFoldersDuration, {
      count: SubjectFolders.files?.length || 0,
      folders: SubjectFolders.files?.map(f => ({ id: f.id, name: f.name })) || []
    });
    
    logTiming("✅ Subject folders found", { 
      count: SubjectFolders.files?.length || 0,
      duration: `${findFoldersDuration}ms`
    });
    timings.details.findFolders = findFoldersDuration;

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      logTiming("⚠️  NO FOLDERS FOUND - Returning empty result");
      timings.total = Date.now() - timings.start;
      
      return res.status(200).json({
        data: {},
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
    // STEP 5: Get Category Subfolders (API CALLS 2-N)
    // ========================================
    const subfoldersStart = Date.now();
    logTiming("📂 STARTING SUBFOLDER FETCH PHASE", { 
      parentFolders: SubjectFolderIds.length 
    });
    
    let dic = {};
    let Parents = "";
    let apiCallCount = 0;
    let totalSubfolders = 0;

    for (let i = 0; i < SubjectFolderIds.length; i++) {
      const folderId = SubjectFolderIds[i];
      const folderIterStart = Date.now();
      
      logTiming(`📁 API CALL ${2 + i}: Fetching subfolders for folder ${i + 1}/${SubjectFolderIds.length}`, { 
        folderId,
        query: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`
      });

      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      });

      const folderIterDuration = Date.now() - folderIterStart;
      apiCallCount++;
      const categoryCount = SubjectSubFolders.files?.length || 0;
      totalSubfolders += categoryCount;

      logApiCall(`Get Subfolders (${i + 1}/${SubjectFolderIds.length})`, folderIterDuration, {
        folderId,
        categories: categoryCount,
        categoryNames: SubjectSubFolders.files?.map(f => f.name) || []
      });

      logTiming(`✅ Subfolders fetched for folder ${i + 1}`, { 
        folderId,
        categories: categoryCount,
        duration: `${folderIterDuration}ms`
      });

      if (SubjectSubFolders.files) {
        SubjectSubFolders.files.forEach((subFolder) => {
          dic[subFolder.id] = subFolder.name;
          Parents += `'${subFolder.id}' in parents OR `;
        });
      }

      timings.details[`subfolder_call_${i + 1}`] = folderIterDuration;
    }

    Parents = Parents.slice(0, -4); // Remove trailing " OR "

    const subfoldersDuration = Date.now() - subfoldersStart;
    logTiming("✅ ALL SUBFOLDERS FETCHED", { 
      totalCategories: totalSubfolders,
      apiCalls: apiCallCount,
      duration: `${subfoldersDuration}ms`,
      avgPerCall: `${(subfoldersDuration / apiCallCount).toFixed(2)}ms`
    });
    timings.details.allSubfolders = subfoldersDuration;

    if (Parents.length === 0) {
      logTiming("⚠️  NO CATEGORY FOLDERS FOUND");
      timings.total = Date.now() - timings.start;
      
      return res.status(200).json({
        data: {},
        timings,
        message: "No category folders found"
      });
    }

    // ========================================
    // STEP 6: Build Files Query
    // ========================================
    const queryStart = Date.now();
    logTiming("🔨 Building files query...", { 
      categoriesCount: totalSubfolders,
      queryLength: Parents.length 
    });
    
    const queryDuration = Date.now() - queryStart;
    logTiming("✅ Query built", { 
      duration: `${queryDuration}ms`,
      queryPreview: Parents.substring(0, 100) + "..."
    });
    timings.details.queryBuild = queryDuration;

    // ========================================
    // STEP 7: Fetch ALL Files (API CALL FINAL)
    // ========================================
    const filesStart = Date.now();
    logTiming(`📥 API CALL ${2 + apiCallCount}: Fetching ALL files...`, { 
      query: `${Parents.substring(0, 100)}... and mimeType != 'application/vnd.google-apps.folder'`
    });

    const { data: Files } = await drive.files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents)",
      pageSize: 1000,
    });

    const filesDuration = Date.now() - filesStart;
    const fileCount = Files.files?.length || 0;
    
    logApiCall("Get All Files", filesDuration, {
      count: fileCount,
      avgTimePerFile: fileCount > 0 ? `${(filesDuration / fileCount).toFixed(2)}ms` : "N/A"
    });
    
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
        data: {},
        timings,
        message: "No files found in categories"
      });
    }

    // ========================================
    // STEP 8: Organize Files by Category
    // ========================================
    const organizeStart = Date.now();
    logTiming("📦 Organizing files by category...");
    
    const FilesData = {};
    let organizedCount = 0;
    let skippedCount = 0;

    Files.files.forEach((file) => {
      const parentId = file.parents?.[0];
      const parentName = dic[parentId];
      
      if (parentName) {
        if (!FilesData[parentName]) {
          FilesData[parentName] = [];
        }
        FilesData[parentName].push(file);
        organizedCount++;
      } else {
        skippedCount++;
      }
    });

    const organizeDuration = Date.now() - organizeStart;
    logTiming("✅ Files organized", { 
      duration: `${organizeDuration}ms`,
      categories: Object.keys(FilesData).length,
      organized: organizedCount,
      skipped: skippedCount
    });
    timings.details.organize = organizeDuration;

    // ========================================
    // FINAL: Calculate and Log Summary
    // ========================================
    timings.total = Date.now() - timings.start;
    timings.totalApiCalls = apiCallCount + 1; // +1 for final files call
    
    logTiming("🎉 REQUEST COMPLETED", { 
      totalDuration: `${timings.total}ms`,
      totalApiCalls: timings.totalApiCalls
    });

    // Calculate breakdown
    const breakdown = {
      auth: ((timings.details.authCreation / timings.total) * 100).toFixed(1),
      drive: ((timings.details.driveClient / timings.total) * 100).toFixed(1),
      findFolders: ((timings.details.findFolders / timings.total) * 100).toFixed(1),
      subfolders: ((timings.details.allSubfolders / timings.total) * 100).toFixed(1),
      fetchFiles: ((timings.details.fetchFiles / timings.total) * 100).toFixed(1),
      organize: ((timings.details.organize / timings.total) * 100).toFixed(1),
    };

    // Print beautiful summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 COMPLETE PERFORMANCE SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Subject:          ${subject}`);
    console.log(`Region:           ${process.env.VERCEL_REGION || "unknown"}`);
    console.log(`Node Version:     ${process.version}`);
    console.log("");
    console.log("⏱️  TIMING BREAKDOWN:");
    console.log(`   Auth creation:    ${timings.details.authCreation}ms (${breakdown.auth}%)`);
    console.log(`   Drive client:     ${timings.details.driveClient}ms (${breakdown.drive}%)`);
    console.log(`   Find folders:     ${timings.details.findFolders}ms (${breakdown.findFolders}%)`);
    console.log(`   Get subfolders:   ${timings.details.allSubfolders}ms (${breakdown.subfolders}%)`);
    console.log(`   Fetch files:      ${timings.details.fetchFiles}ms (${breakdown.fetchFiles}%)`);
    console.log(`   Organize data:    ${timings.details.organize}ms (${breakdown.organize}%)`);
    console.log(`   ─────────────────`);
    console.log(`   TOTAL:            ${timings.total}ms`);
    console.log("");
    console.log("📈 RESULTS:");
    console.log(`   API Calls:        ${timings.totalApiCalls}`);
    console.log(`   Parent Folders:   ${SubjectFolderIds.length}`);
    console.log(`   Categories:       ${totalSubfolders}`);
    console.log(`   Files Found:      ${fileCount}`);
    console.log(`   Files Organized:  ${organizedCount}`);
    console.log(`   Files Skipped:    ${skippedCount}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return res.status(200).json({
      data: FilesData,
      metadata: {
        subject,
        totalFiles: fileCount,
        categories: Object.keys(FilesData).length,
        organized: organizedCount,
        skipped: skippedCount,
        totalApiCalls: timings.totalApiCalls,
      },
      timings,
      breakdown,
    });

  } catch (error) {
    const errorTime = Date.now() - timings.start;
    logTiming("❌ CRITICAL ERROR", { 
      message: error.message,
      stack: error.stack,
      atTime: `${errorTime}ms`
    });
    
    console.error("\n🔥🔥🔥 ERROR DETAILS 🔥🔥🔥");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Timings:", JSON.stringify(timings, null, 2));
    console.error("API Calls Made:", JSON.stringify(timings.apiCalls, null, 2));

    return res.status(500).json({ 
      error: "Failed to fetch subject data",
      details: error.message,
      timings,
      apiCalls: timings.apiCalls,
    });
  }
}