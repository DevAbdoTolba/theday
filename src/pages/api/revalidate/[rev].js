/**
 * FIXED: On-demand ISR revalidation endpoint
 * This triggers background revalidation without blocking the user
 */

export default async function handler(req, res) {
  const { rev } = req.query;

  if (!rev) {
    return res.status(400).json({ message: "Missing subject parameter" });
  }

  try {
    console.log(`🔄 Triggering revalidation for: /subjects/${rev}`);
    
    // This triggers BACKGROUND revalidation
    // Next user will get fresh data, but this request returns immediately
    await res.revalidate(`/subjects/${rev}`);
    
    console.log(`✅ Revalidation queued successfully for: ${rev}`);
    
    return res.json({ 
      revalidated: true,
      subject: rev,
      message: "Revalidation triggered in background"
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);
    return res.status(500).json({ 
      error: "Error revalidating",
      details: error.message 
    });
  }
}
