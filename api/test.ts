import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Simple test endpoint to verify serverless functions are working
 * Access at: /api/test
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if GEMINI_API_KEY is set
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const geminiKeyPrefix = process.env.GEMINI_API_KEY?.substring(0, 8) || "NOT_SET";

  return res.status(200).json({
    status: "✅ API is working!",
    timestamp: new Date().toISOString(),
    environment: {
      hasGeminiKey,
      geminiKeyPrefix: hasGeminiKey ? `${geminiKeyPrefix}...` : "NOT_SET",
      nodeVersion: process.version,
      platform: process.platform
    },
    endpoints: {
      main: "/api/gemini",
      test: "/api/test"
    },
    message: hasGeminiKey
      ? "✅ GEMINI_API_KEY is configured correctly"
      : "❌ GEMINI_API_KEY is missing! Add it in Vercel Environment Variables"
  });
}
