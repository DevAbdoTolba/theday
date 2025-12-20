// pages/api/test-revalidate.js
export default async function handler(req, res) {
  const start = Date.now();
  
  try {
    console.log("🧪 Testing revalidate...");
    
    // This will trigger getStaticProps
    await res.revalidate('/subjects/OOPR');
    
    const duration = Date.now() - start;
    console.log(`✅ Revalidate took ${duration}ms`);
    
    return res.json({ 
      success: true, 
      duration: `${duration}ms` 
    });
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Error after ${duration}ms:`, error.message);
    
    return res.json({ 
      success: false, 
      duration: `${duration}ms`,
      error: error.message 
    });
  }
}