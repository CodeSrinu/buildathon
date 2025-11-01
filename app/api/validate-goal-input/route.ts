// app/api/validate-goal-input/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to validate if the input is a legitimate career goal using AI
async function validateCareerGoalLegitimacy(userGoal: string): Promise<{ isValid: boolean; reason: string }> {
  try {
    // Basic checks first
    const trimmedGoal = userGoal.trim();
    
    console.log("\n🔍 ========== VALIDATING CAREER GOAL INPUT ==========");
    console.log("📝 User Input:", trimmedGoal);
    
    // Check if empty or too short
    if (trimmedGoal.length === 0) {
      console.log("❌ Empty input");
      return { isValid: false, reason: "Career goal cannot be empty." };
    }
    
    if (trimmedGoal.length < 3) {
      console.log("❌ Input too short");
      return { isValid: false, reason: "Career goal is too short. Please provide a valid career or profession." };
    }
    
    // Check for inappropriate or non-career terms using AI
    console.log("🤖 Calling AI to validate career goal...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are a career validation expert. Your task is to determine if the following text represents a VALID CAREER GOAL or PROFESSION.

User Input: "${trimmedGoal}"

A VALID career goal is:
- A profession, job title, or career path (e.g., "Software Developer", "Doctor", "Teacher", "Engineer", "Business Analyst")
- A field of work (e.g., "Healthcare", "Technology", "Education")
- A specific role (e.g., "Data Scientist", "Marketing Manager", "Architect")

An INVALID career goal is:
- Personal characteristics (e.g., "gay", "happy", "tall", "smart")
- Random words or gibberish (e.g., "xyz", "abc", "123")
- Offensive or inappropriate content
- Non-career related terms
- Single letters or very short meaningless text
- Adjectives or descriptive words that are not careers

Respond with ONLY a JSON object in this exact format:
{
  "isValid": true or false,
  "reason": "Brief explanation (only if invalid)"
}

Examples:
Input: "Software Developer" → {"isValid": true, "reason": ""}
Input: "gay" → {"isValid": false, "reason": "This appears to be a personal characteristic, not a career goal."}
Input: "Doctor" → {"isValid": true, "reason": ""}
Input: "xyz" → {"isValid": false, "reason": "This does not appear to be a valid career or profession."}
Input: "happy" → {"isValid": false, "reason": "This is an emotion, not a career goal."}
Input: "AI Engineer" → {"isValid": true, "reason": ""}

Now validate: "${trimmedGoal}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("📥 AI Response:", text);
    
    // Extract JSON from response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    const validation = JSON.parse(jsonString);
    
    console.log("✅ Validation result:", validation);
    console.log("🔍 ========== VALIDATION COMPLETE ==========\n");
    
    return {
      isValid: validation.isValid,
      reason: validation.reason || "This does not appear to be a valid career goal."
    };
    
  } catch (error) {
    console.error("❌ Error validating career goal legitimacy:", error);
    // If validation fails, allow it to proceed (fail open)
    return { isValid: true, reason: "" };
  }
}

export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API: /api/validate-goal-input ==========");
    
    const { userGoal } = await request.json();
    
    console.log("📥 Received request to validate goal");
    console.log("📝 User Goal:", userGoal);
    
    if (!userGoal) {
      console.error("❌ Missing userGoal in request");
      return NextResponse.json(
        { 
          error: 'Missing required field: userGoal',
          message: 'Please provide a career goal to validate.'
        },
        { status: 400 }
      );
    }
    
    // Validate the career goal
    const validation = await validateCareerGoalLegitimacy(userGoal);
    
    if (!validation.isValid) {
      console.error("❌ Invalid career goal detected");
      console.error("📝 Reason:", validation.reason);
      return NextResponse.json(
        { 
          error: 'Invalid career goal',
          message: validation.reason,
          suggestion: 'Please enter a valid career or profession (e.g., Software Developer, Doctor, Teacher, Engineer, etc.)'
        },
        { status: 400 }
      );
    }
    
    console.log("✅ Career goal is valid");
    console.log("🌐 ========== API COMPLETE ==========\n");
    
    return NextResponse.json({
      success: true,
      message: 'Career goal is valid'
    });
    
  } catch (error: any) {
    console.error("\n❌ ========== API ERROR ==========");
    console.error("🚨 Error:", error.message);
    console.error("🌐 ========== API ERROR END ==========\n");
    
    return NextResponse.json(
      { 
        error: 'Failed to validate career goal',
        message: error.message || 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

