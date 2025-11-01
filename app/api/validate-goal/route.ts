// app/api/validate-goal/route.ts
import { validateUserGoalWithAI } from '@/lib/aiGoalValidation';
import { ValidationQuizAnswers } from '@/lib/goalValidation';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to validate if the input is a legitimate career goal using AI
async function validateCareerGoalLegitimacy(userGoal: string): Promise<{ isValid: boolean; reason: string }> {
  try {
    // Basic checks first
    const trimmedGoal = userGoal.trim();

    // Check if empty or too short
    if (trimmedGoal.length === 0) {
      return { isValid: false, reason: "Career goal cannot be empty." };
    }

    if (trimmedGoal.length < 3) {
      return { isValid: false, reason: "Career goal is too short. Please provide a valid career or profession." };
    }

    // Check for inappropriate or non-career terms using AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a career validation expert. Your task is to determine if the following text represents a VALID CAREER GOAL or PROFESSION.

User Input: "${trimmedGoal}"

A VALID career goal is:
- A profession, job title, or career path (e.g., "Software Developer", "Doctor", "Teacher", "Engineer", "Business Analyst")
- A field of work (e.g., "Healthcare", "Technology", "Education")
- A specific role (e.g., "Data Scientist", "Marketing Manager", "Architect")

An INVALID career goal is:
- Personal characteristics (e.g., "gay", "happy", "tall")
- Random words or gibberish
- Offensive or inappropriate content
- Non-career related terms
- Single letters or very short meaningless text

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

Now validate: "${trimmedGoal}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    const validation = JSON.parse(jsonString);

    return {
      isValid: validation.isValid,
      reason: validation.reason || "This does not appear to be a valid career goal."
    };

  } catch (error) {
    console.error("Error validating career goal legitimacy:", error);
    // If validation fails, allow it to proceed (fail open)
    return { isValid: true, reason: "" };
  }
}

export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API ROUTE: /api/validate-goal ==========");
    console.log("📥 Received POST request");

    const body = await request.json();
    console.log("📦 Request body:", JSON.stringify(body, null, 2));

    const { userGoal, answers } = body;

    // Validate input
    console.log("\n🔍 Validating input...");
    if (!userGoal || !answers) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: 'Missing required fields: userGoal and answers' },
        { status: 400 }
      );
    }
    console.log("✅ userGoal present:", !!userGoal);
    console.log("✅ answers present:", !!answers);

    // Validate that answers has the required structure
    const requiredFields = ['primaryDrive', 'tenYearVision', 'problemSolvingApproach', 'preferredLearningStyle', 'confidenceRating'];
    console.log("\n🔍 Validating answer fields...");
    for (const field of requiredFields) {
      if (!answers[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field in answers: ${field}` },
          { status: 400 }
        );
      }
      console.log(`✅ ${field}:`, answers[field]);
    }

    // Validate that userGoal is a legitimate career goal
    console.log("\n🔍 Validating career goal legitimacy...");
    const invalidGoalCheck = await validateCareerGoalLegitimacy(userGoal);
    if (!invalidGoalCheck.isValid) {
      console.error("❌ Invalid career goal detected:", userGoal);
      console.error("📝 Reason:", invalidGoalCheck.reason);
      return NextResponse.json(
        {
          error: 'Invalid career goal',
          message: invalidGoalCheck.reason,
          suggestion: 'Please enter a valid career or profession (e.g., Software Developer, Doctor, Teacher, Engineer, etc.)'
        },
        { status: 400 }
      );
    }
    console.log("✅ Career goal is valid");

    // Call AI validation service
    console.log("\n🤖 Calling AI validation service...");
    const validationResponse = await validateUserGoalWithAI(userGoal, answers);
    console.log("✅ AI validation completed successfully");
    console.log("📊 Validation response:", JSON.stringify(validationResponse, null, 2));

    // Return the validation response
    console.log("\n📤 Sending response to client");
    console.log("🌐 ========== API ROUTE END ==========\n");
    return NextResponse.json({
      validationResponse
    });
    
  } catch (error: any) {
    console.error("\n❌ ========== API ROUTE ERROR ==========");
    console.error("🚨 Error Type:", error.constructor.name);
    console.error("📝 Error Message:", error.message);
    console.error("📚 Error Stack:", error.stack);
    console.error("🌐 ========== API ROUTE ERROR END ==========\n");

    // Return a user-friendly error message
    return NextResponse.json(
      {
        error: 'Failed to validate goal with AI',
        message: error.message || 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

