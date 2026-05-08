import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeStore = async (url: string, context: string) => {
  const prompt = `Analyze this URL: ${url}
${context ? "Additionally, here is some extracted data about the store (from Store Leads or similar):\n" + context : ""}
First, determine if this is an e-commerce store (where users can purchase physical or digital products online). 
If it is NOT an e-commerce store, return ONLY a JSON object with a single key "error" set to "This URL does not appear to be an e-commerce store."

If it IS an e-commerce store, perform a comprehensive, mandatory web search to gather accurate data.

Return ONLY a single, valid JSON object with the following structure:
{
  "brand": "string",
  "contactName": "string",
  "clientEmail": "string",
  "clientSocial": "string (@username or main social link)",
  "niche": "string (must be one of: supplements, fashion, beauty, homegood, electronics, pet, custom)",
  "visitors": number,
  "aovKnown": number,
  "productCount": number,
  "priceRangeMin": number,
  "priceRangeMax": number,
  "paidAdsActive": boolean,
  "esp": "string",
  "existingFlow": "string",
  "items": number,
  "freeship": number,
  "recoveryGaps": "string"
}

Ensure the JSON is strictly valid, with no markdown formatting, no trailing commas, and no explanations. If you cannot find a value, use null or a sensible default.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} } as any],
      }
    });
    
    let text = response.text || "";
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
    }
    text = text.replace(/^[^{]*\{/, "{").replace(/\}[^}]*$/, "}");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Store analysis failed:", error);
    throw error;
  }
};

export const refineProposal = async (brand: string, contact: string, niche: string, content: string) => {
  const prompt = `You are an expert copywriter and sales strategist for cart recovery proposals. 
Your goal is to refine, enhance, and structure the text of an e-commerce cart recovery proposal.
The proposal is for the brand "${brand}" and the contact "${contact}". Their niche is "${niche}".
Here is the current text/HTML of the proposal:

${content}

Make the proposal more compelling, professional, and convincing.
Improve the flow and persuasiveness of the Introduction, Problem Statement, Solution, and Call to Action based on the provided metrics in the HTML.
Keep the overall tone professional and confident but conversational. Do not make up fake data—rely on the data points in the text.
Format the output as clean HTML without any markdown code block wrappers (do NOT wrap in \`\`\`html ... \`\`\`, just the raw HTML).
Use appropriate HTML tags like <h3>, <p>, <ul>, <li>, <strong>, etc. Keep the formatting visually pleasing.
Do NOT include any inline styles or color attributes.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    let text = response.text || "";
    text = text.trim();
    if (text.startsWith("```html")) {
       text = text.replace(/^```html\s*/i, "").replace(/```$/i, "");
    } else if (text.startsWith("```")) {
       text = text.replace(/^```\s*/i, "").replace(/```$/i, "");
    }
    return text;
  } catch (error) {
    console.error("Proposal refinement failed:", error);
    throw error;
  }
};

export const getAovRecommendation = async (brand: string, niche: string, url: string) => {
  const prompt = `We are analyzing AOV (Average Order Value) for this e-commerce brand:
Brand: ${brand || "Unknown"}
URL: ${url || "Unknown"}
Niche: ${niche || "Unknown"}

Our estimate logic is missing these inputs: 'Catalog price range', 'Avg items per order', and 'Free shipping threshold'.

Provide a 1-2 sentence recommendation specifying realistic estimates for these missing values based on what you know about the brand, their typical products, or their specific industry. Explain briefly why these fit. Do NOT use markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return response.text || "";
  } catch (error) {
    console.error("AOV recommendation failed:", error);
    throw error;
  }
};
