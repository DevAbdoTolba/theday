// pages/api/revalidate.js
export default async function handler(req, res) {
  const { rev } = req.query;

  try {
    if (rev) {
      // Manually trigger ISR revalidation
      await res.revalidate(`/subjects/${rev}`);
      return res.json({ revalidated: true });
    }

    return res.status(400).json({ message: "Missing subject" });
  } catch (error) {
    return res.status(500).json({ error: "Error revalidating" });
  }
}
