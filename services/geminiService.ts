import { GoogleGenAI, Type } from "@google/genai";
import { ReviewAnalysis } from "../types";

export const analyzeReviews = async (reviews: string[]): Promise<ReviewAnalysis> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API Key is not configured. Please ensure it is set in your environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const reviewsString = JSON.stringify(reviews);
    const prompt = `
      You are a review analyst. Analyze the following ${reviews.length} user reviews for a gas station.
      In one or two sentences, summarize the most common good things (praise) mentioned.
      In one or two sentences, summarize the most common bad things (issues) mentioned.
      Reviews:
      ${reviewsString}
      Provide the output in this exact JSON format, with no other text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryGood: { type: Type.STRING, description: "A one or two sentence summary of common positive feedback." },
            summaryBad: { type: Type.STRING, description: "A one or two sentence summary of common negative feedback." },
          },
          required: ["summaryGood", "summaryBad"],
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as ReviewAnalysis;
  } catch (error) {
    console.error("Error analyzing reviews:", error);
    if (error instanceof Error) {
        if(error.message.toLowerCase().includes("json")) {
          throw new Error("The AI returned an invalid data format. Please try again.");
        }
        throw new Error(`Failed to analyze reviews: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing reviews.");
  }
};

export const summarizeStationHighlights = async (reviews: string[], sentiment: 'positive' | 'negative'): Promise<string[]> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API Key is not configured.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const promptAction = sentiment === 'positive' ? 'praise' : 'issues';
  const examplePoints = sentiment === 'positive' 
    ? "Example: ['Clean facilities', 'Great coffee']" 
    : "Example: ['Slow service', 'High prices']";

  try {
    const reviewsString = JSON.stringify(reviews.slice(0, 20)); // Limit reviews to avoid overly large prompts
    const prompt = `
      Analyze these user reviews for a gas station.
      Provide a JSON array of 2-3 very brief, summarized bullet points highlighting the most common ${promptAction}.
      Each bullet point should be a short string, ideally 2-4 words.
      Reviews:
      ${reviewsString}
      ${examplePoints}
      Provide the output in this exact JSON format: an array of strings.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: `A brief summary point about the station's ${sentiment} aspects.`,
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as string[];
  } catch (error) {
    console.error(`Error summarizing ${sentiment} highlights:`, error);
     if (error instanceof Error) {
        if(error.message.toLowerCase().includes("json")) {
          throw new Error("The AI returned an invalid data format for highlights. Please try again.");
        }
        throw new Error(`Failed to summarize highlights: ${error.message}`);
    }
    throw new Error("An unknown error occurred while summarizing highlights.");
  }
};