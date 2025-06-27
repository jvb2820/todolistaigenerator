
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiGeneratedTask, AiLanguageCode } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
  console.error("API_KEY is not set or is a placeholder. Please ensure the API_KEY environment variable is configured correctly in index.html or your environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! }); 

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

async function parseGeminiResponse(response: GenerateContentResponse): Promise<any> {
  let jsonStr = response.text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON string from AI:", jsonStr, e);
    // Try to provide a more specific error if the API key is the issue
    if (jsonStr.toLowerCase().includes("api key not valid") || jsonStr.toLowerCase().includes("invalid api key")) {
        throw new Error("Invalid Gemini API Key. Please check your configuration in index.html or environment.");
    }
    throw new Error("AI returned invalid JSON format. Raw response: " + response.text);
  }
}

export async function generateTasksWithGemini(
  theme: string, 
  taskCountMin: number = 3, 
  taskCountMax: number = 7,
  languageCode: AiLanguageCode,
  languageName: string // e.g., "English", "Hindi"
): Promise<AiGeneratedTask[]> {
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("Gemini API Key is not configured. Cannot generate tasks.");
  }
  
  const prompt = `Generate ${taskCountMin}-${taskCountMax} tasks related to the theme: '${theme}'.
For each task, provide:
- 'text' (string description, concise and actionable. This text MUST be in ${languageName}.)
- 'priority' (string: 'High', 'Medium', or 'Low'. These priority values MUST be in English.)
- 'dueDateOffset' (integer: number of days from today, 0-7 days).

Ensure the response is ONLY a valid JSON array of objects. Do not include any explanatory text before or after the JSON.
JSON keys must be in English. Only the string value for the 'text' key should be in ${languageName}.
Example for theme 'Grocery Shopping' (if asked for 3 tasks and language is ${languageName}):
[
  {"text": "[Example task 1 in ${languageName}]", "priority": "High", "dueDateOffset": 0},
  {"text": "[Example task 2 in ${languageName}]", "priority": "Medium", "dueDateOffset": 1},
  {"text": "[Example task 3 in ${languageName}]", "priority": "Low", "dueDateOffset": 3}
]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.75,
      }
    });

    const parsedData = await parseGeminiResponse(response);

    if (!Array.isArray(parsedData) || parsedData.some(task => 
        typeof task.text !== 'string' || 
        !['High', 'Medium', 'Low'].includes(task.priority) ||
        typeof task.dueDateOffset !== 'number'
    )) {
      console.error("Unexpected JSON structure from Gemini for tasks:", parsedData);
      throw new Error("AI generated an unexpected data format for tasks.");
    }
    
    return parsedData as AiGeneratedTask[];

  } catch (error) {
    console.error(`Error calling Gemini API (generateTasksWithGemini for ${languageName}) or parsing response:`, error);
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || error.message.includes("Invalid Gemini API Key"))) {
        throw new Error("Invalid Gemini API Key. Please check your configuration in index.html.");
    }
    throw new Error(`Failed to generate tasks with AI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateMultiplePaperThemes(
  count: number,
  languageCode: AiLanguageCode,
  languageName: string
): Promise<string[]> {
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("Gemini API Key is not configured. Cannot generate themes.");
  }

  const prompt = `Generate ${count} diverse and concise (2-4 words each) themes for to-do list papers.
The theme text itself MUST be in ${languageName}.
Focus on common activities, projects, or goals.
Examples (if language is ${languageName}): "[Theme 1 in ${languageName}]", "[Theme 2 in ${languageName}]".
Ensure the response is ONLY a valid JSON array of strings. Do not include any explanatory text before or after the JSON.
Example for count 3 (if language is ${languageName}):
["[Example Theme 1 in ${languageName}]", "[Example Theme 2 in ${languageName}]", "[Example Theme 3 in ${languageName}]"]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8, 
      }
    });

    const parsedData = await parseGeminiResponse(response);

    if (!Array.isArray(parsedData) || parsedData.some(theme => typeof theme !== 'string')) {
      console.error("Unexpected JSON structure from Gemini for themes:", parsedData);
      throw new Error("AI generated an unexpected data format for themes.");
    }
    return parsedData as string[];

  } catch (error) {
    console.error(`Error calling Gemini API (generateMultiplePaperThemes for ${languageName}) or parsing response:`, error);
     if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || error.message.includes("Invalid Gemini API Key"))) {
        throw new Error("Invalid Gemini API Key. Please check your configuration in index.html.");
    }
    throw new Error(`Failed to generate themes with AI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateTasksForExistingSet(
  themeHint: string, 
  taskCountMin: number = 3, 
  taskCountMax: number = 5,
  languageCode: AiLanguageCode,
  languageName: string
): Promise<AiGeneratedTask[]> {
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("Gemini API Key is not configured. Cannot generate tasks.");
  }
  
  const prompt = `Given a to-do list paper titled '${themeHint}' (the title itself might be in any language, use it as context), suggest ${taskCountMin}-${taskCountMax} additional, varied tasks that would fit this theme.
The tasks should be concise and actionable.
For each task, provide:
- 'text' (string description. This text MUST be in ${languageName}.)
- 'priority' (string: 'High', 'Medium', or 'Low'. These priority values MUST be in English.)
- 'dueDateOffset' (integer: number of days from today, 0-7 days).

Ensure the response is ONLY a valid JSON array of objects. Do not include any explanatory text before or after the JSON.
JSON keys must be in English. Only the string value for the 'text' key should be in ${languageName}.
Example for themeHint 'Household Maintenance' (if language is ${languageName}):
[
  {"text": "[Suggested task 1 in ${languageName}]", "priority": "Medium", "dueDateOffset": 2},
  {"text": "[Suggested task 2 in ${languageName}]", "priority": "High", "dueDateOffset": 0},
  {"text": "[Suggested task 3 in ${languageName}]", "priority": "Medium", "dueDateOffset": 1}
]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const parsedData = await parseGeminiResponse(response);

    if (!Array.isArray(parsedData) || parsedData.some(task => 
        typeof task.text !== 'string' || 
        !['High', 'Medium', 'Low'].includes(task.priority) ||
        typeof task.dueDateOffset !== 'number'
    )) {
      console.error("Unexpected JSON structure from Gemini for existing set tasks:", parsedData);
      throw new Error("AI generated an unexpected data format for suggested tasks.");
    }
    
    return parsedData as AiGeneratedTask[];

  } catch (error) {
    console.error(`Error calling Gemini API (generateTasksForExistingSet for ${languageName}) or parsing response:`, error);
     if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || error.message.includes("Invalid Gemini API Key"))) {
        throw new Error("Invalid Gemini API Key. Please check your configuration in index.html.");
    }
    throw new Error(`Failed to suggest tasks with AI: ${error instanceof Error ? error.message : String(error)}`);
  }
}
