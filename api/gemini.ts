import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow CORS for local development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { task, payload } = req.body;

  try {
    switch (task) {
      case "generateNews": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: payload.prompt,
          config: {
            tools: payload.useSearch ? [{ googleSearch: {} }] : undefined,
            responseMimeType: "application/json",
            responseSchema: payload.schema
          }
        });
        return res.json({ text: response.text });
      }

      case "generateDirectoryNews": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: payload.prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: payload.schema
          }
        });
        return res.json({ text: response.text });
      }

      case "generateTools": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: payload.prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: payload.schema
          }
        });
        return res.json({ text: response.text });
      }

      case "generateImage": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: { parts: [{ text: payload.prompt }] },
          config: {
            imageConfig: {
              aspectRatio: payload.aspectRatio || "16:9",
              imageSize: payload.imageSize || "1K"
            }
          }
        });
        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return res.json({ data });
      }

      case "chat": {
        const tools: any[] = [];
        if (payload.useSearch) tools.push({ googleSearch: {} });
        if (payload.useMaps) tools.push({ googleMaps: {} });

        const model = (payload.useSearch || payload.useMaps)
          ? "gemini-1.5-flash-latest"
          : "gemini-1.5-pro-latest";

        const response = await ai.models.generateContent({
          model: model,
          contents: payload.message,
          config: {
            tools: tools.length > 0 ? tools : undefined,
          }
        });

        return res.json({ response });
      }

      case "transcribeAudio": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: {
            parts: [
              { inlineData: { mimeType: payload.mimeType || "audio/wav", data: payload.audioBase64 } },
              { text: "Transcribe this audio exactly." }
            ]
          }
        });
        return res.json({ text: response.text });
      }

      case "generateSpeech": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: { parts: [{ text: payload.text }] },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: payload.voice || "Kore" } }
            }
          }
        });
        return res.json({ response });
      }

      case "intelligentSearch": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash-latest",
          contents: payload.prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: payload.schema
          }
        });
        return res.json({ text: response.text });
      }

      default:
        return res.status(400).json({ error: "Unknown task" });
    }
  } catch (e) {
    console.error("Gemini API Error:", e);
    return res.status(500).json({ error: "Gemini request failed", details: e instanceof Error ? e.message : String(e) });
  }
}
