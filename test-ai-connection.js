import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Get API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

console.log("Testing Gemini API connection with key:", apiKey.substring(0, 5) + "...");

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Get the generative model - try gemini-pro instead
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Simple test prompt
const prompt = "Say hello in 3 different languages";

console.log("Sending test prompt to Gemini API...");

model.generateContent(prompt)
  .then(result => {
    const response = result.response;
    const text = response.text();
    console.log("Received response from Gemini API:");
    console.log(text);
  })
  .catch(error => {
    console.error("Error calling Gemini API:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  });