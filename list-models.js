// list-models.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in .env.local");
  process.exit(1);
}

console.log("Testing Gemini API with key:", apiKey.substring(0, 10) + "...");

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Try to list models
async function listModels() {
  try {
    console.log("\nAttempting to list available models...");
    
    // Make a direct API call to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("\nAvailable models:");
    console.log(JSON.stringify(data, null, 2));
    
    // Extract model names
    if (data.models) {
      console.log("\nModel names:");
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error("Error listing models:", error.message);
    console.error("Full error:", error);
  }
}

listModels();

