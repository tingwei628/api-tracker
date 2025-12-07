import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FoodInput, AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an advanced **Antioxidant Nutritional Expert Assistant**. 
Your goal is to calculate the **API (Antioxidant Protection Index)** score (0-100 scale per item, normalized to a daily target) based on user inputs.

**API Definition:** standardized score representing comprehensive antioxidant density (ORAC, vitamin, polyphenol).

**Rules:**
1. **Analyze** all provided text and images (food photos or nutrition labels).
2. **Estimate** portions if not provided (visual estimation).
3. **Calculate** API per item and Total API.
4. **Determine Target** based on the user's stated Activity/Lifestyle Goal.
5. **Logic:** If Total API < 80% of Target, status is DEFICIENT.

**Output:**
Return strictly JSON.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.NUMBER, description: "The calculated Grand Total API Score." },
    targetScore: { type: Type.NUMBER, description: "The calculated Target API based on user activity." },
    percentage: { type: Type.NUMBER, description: "Percentage of target met (0-100)." },
    deficiencyCategory: { type: Type.STRING, description: "Primary antioxidant deficiency (e.g., 'Vitamin C', 'Polyphenols') or 'None'." },
    breakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, description: "Input source (e.g., 'Photo', 'Text', 'Label')." },
          item: { type: Type.STRING, description: "Name of the food item." },
          portion: { type: Type.STRING, description: "Portion size in grams." },
          totalAPI: { type: Type.NUMBER, description: "API contribution of this item." },
        },
        required: ["source", "item", "portion", "totalAPI"]
      },
    },
    recommendation: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["TARGET_MET", "DEFICIENT"] },
        message: { type: Type.STRING, description: "Concise actionable advice." },
        foodSuggestion: { type: Type.STRING, description: "One specific high-efficiency food to fix the deficiency." }
      },
      required: ["status", "message"]
    }
  },
  required: ["totalScore", "targetScore", "percentage", "deficiencyCategory", "breakdown", "recommendation"]
};

export default async function handler(  
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResult | { error: string }>
){

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inputs, activityGoal } = req.body as { inputs: FoodInput[], activityGoal: string };

  if (!inputs || !activityGoal) {
    return res.status(400).json({ error: 'Missing inputs or activityGoal' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // Add Context
  parts.push({ text: `User Activity/Lifestyle Goal: ${activityGoal}` });

  // Add Inputs
  inputs.forEach((input, index) => {
    if (input.type === 'text') {
      parts.push({ text: `Input ${index + 1} (Text): Food: ${input.value}, Portion: ${input.portion || 'Unknown'}` });
    } else {
      // Image or Camera (Base64)
      // Extract actual base64 data if it contains the prefix
      const base64Data = input.value.includes('base64,') 
        ? input.value.split('base64,')[1] 
        : input.value;
      
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
      parts.push({ text: `Input ${index + 1} (Image): Analyze this image for food content or nutrition labels.` });
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
      contents: [{ role: 'user', parts }]
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text) as AnalysisResult;
    res.status(200).json(result);
    
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    res.status(500).json({ error: 'Gemini Analysis Failed' });
  }
};