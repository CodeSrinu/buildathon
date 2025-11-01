// app/api/ai-skill-assessment/analyze-skills/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define TypeScript interfaces for our request
interface SkillQuestion {
  id: string;
  text: string;
  category: 'technical' | 'soft' | 'experience' | 'education';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface AnalyzeSkillsRequest {
  roleId: string;
  roleName: string;
  domainId: string;
  questions: SkillQuestion[];
  answers: Record<string, boolean>;
  openResponse: string;
}

// Define TypeScript interface for our response
interface SkillAssessmentResult {
  skillLevel: number; // 0-4 scale (0: Absolute Beginner, 1: Novice, 2: Apprentice, 3: Advanced, 4: Expert)
  analysisSummary: string;
  strengths: string[];
  learningOpportunities: string[];
}

export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API: /api/ai-skill-assessment/analyze-skills ==========");
    
    // Parse the request body
    const body: AnalyzeSkillsRequest = await request.json();
    
    console.log("📥 Request body received");
    console.log("📝 Role ID:", body.roleId);
    console.log("📝 Role Name:", body.roleName);
    console.log("📝 Domain ID:", body.domainId);
    console.log("📊 Questions count:", body.questions?.length || 0);
    console.log("📊 Answers count:", Object.keys(body.answers || {}).length);
    console.log("📊 'Yes' answers:", Object.values(body.answers || {}).filter(Boolean).length);
    console.log("📝 Open response length:", body.openResponse?.length || 0);
    console.log("⏰ Timestamp:", new Date().toISOString());
    
    // Validate input
    if (!body.roleId || !body.roleName || !body.questions || !body.answers) {
      console.error("❌ Missing required fields");
      console.error("📋 Missing:", {
        roleId: !body.roleId,
        roleName: !body.roleName,
        questions: !body.questions,
        answers: !body.answers
      });
      return NextResponse.json(
        { error: 'Missing required fields: roleId, roleName, questions, answers' },
        { status: 400 }
      );
    }

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log("🔑 API Key available:", !!apiKey);
    if (apiKey) {
      console.log("🔑 API Key length:", apiKey.length);
      console.log("🔑 API Key starts with:", apiKey.substring(0, 10) + "...");
    } else {
      console.error("❌ API Key is NULL or UNDEFINED");
    }
    
    if (!apiKey) {
      console.warn("⚠️ NO API KEY - Using default analysis");
      const fallbackAnalysis = getDefaultAnalysis();
      console.log("📊 Returning default analysis:", fallbackAnalysis);
      console.log("🌐 ========== API COMPLETE (FALLBACK) ==========\n");
      return NextResponse.json(fallbackAnalysis);
    }

    console.log("🤖 Initializing Google Generative AI client...");
    
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // FIXED: Using gemini-2.5-flash instead of gemini-1.5-flash
    console.log("🔧 Getting generative model: gemini-2.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("✅ Model initialized successfully");
    
    // Format answers for the prompt
    console.log("📝 Formatting answers for AI prompt...");
    const formattedAnswers = body.questions.map(q => {
      const userAnswer = body.answers[q.id] ? 'Yes' : 'No';
      return `* "${q.text}": ${userAnswer}`;
    }).join('\n');
    
    console.log("📊 Formatted", body.questions.length, "answers");
    
    // PROMPT FOR ANALYZING USER INPUTS AND GIVING RESULTS
    const prompt = `ROLE:
You are an expert career mentor and performance coach. Your task is to analyze a student's self-assessed skill level for their chosen career and provide a clear, encouraging, and actionable evaluation.

CONTEXT:
A student has answered a skill assessment test for the career: "${body.roleName}". Analyze their answers below to determine their starting skill level, identify their current strengths, and pinpoint the best learning opportunities for them.

User's Checklist Answers:
${formattedAnswers}

User's Open Response Answer: "${body.openResponse || 'No response provided'}"

TASK:
Based on your expert analysis of all the user's answers, perform the following tasks:

1.  Determine Skill Level: Assign a single skill level from 0 to 4 based on the combination of their checklist answers and the depth and quality of their open response.
    * 0: Absolute Beginner (Little to no experience)
    * 1: Novice (Has theoretical knowledge but little practical application)
    * 2: Apprentice (Has completed some small projects or courses)
    * 3: Advanced (Has solid practical experience and can work independently)
    * 4: Expert (Deep knowledge and extensive project experience)
2.  Analysis Summary: Provide a brief, encouraging summary of their current position (2-3 sentences).
3.  Identify Strengths: Based on their positive answers ("Yes" responses) and project descriptions, identify 1-2 key "Strengths." These are the skills they can already build upon.
4.  Identify Learning Opportunities: Based on the gaps in their knowledge (the "No" answers) and their open response, identify the top 2-3 most important "Learning Opportunities." These are the areas they should focus on first.

OUTPUT FORMAT:
Your final output MUST be a single, clean, valid JSON object.

{
  "skillLevel": 2,
  "analysisSummary": "You have a great foundation! You've started using the right tools and have completed a real project, which puts you at a solid Apprentice level.",
  "strengths": [
    "Practical Experience: You've already built a real website, which is the most important first step.",
    "Tool Familiarity: You have hands-on experience with Figma."
  ],
  "learningOpportunities": [
    "Focus on User Research: Your next big step is to learn how to conduct user research to inform your designs.",
    "Master Prototyping: Learn how to create interactive prototypes in Figma to bring your designs to life.",
    "Learn Design Systems: Understanding design systems is a key skill for working in professional teams."
  ]
}

Important Notes:
1. Treat all "No" answers seriously - they represent genuine gaps in knowledge or experience
2. Focus on the specific tools, technologies, and skills mentioned in the questions
3. Pay special attention to any hands-on experience mentioned in the open response
4. Consider the depth and quality of the open response when determining skill level`;

    console.log("📝 Generated prompt length:", prompt.length);
    console.log("📤 Sending request to Gemini API...");
    
    // Generate content using the AI model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Received response from Gemini API");
    console.log("📏 Response length:", text.length);
    console.log("📄 First 200 chars:", text.substring(0, 200));
    
    // Parse the JSON response
    console.log("🔧 Extracting JSON from response...");
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    // Validate that we have a valid JSON string
    if (jsonString.length === 0) {
      console.error("❌ AI response did not contain valid JSON");
      throw new Error("AI response did not contain valid JSON");
    }
    
    console.log("📋 Extracted JSON length:", jsonString.length);
    console.log("🔧 Parsing JSON...");
    
    const parsedResponse: SkillAssessmentResult = JSON.parse(jsonString);
    
    console.log("✅ JSON parsed successfully");
    console.log("📊 Skill Level:", parsedResponse.skillLevel);
    console.log("📊 Analysis Summary length:", parsedResponse.analysisSummary?.length || 0);
    console.log("📊 Strengths count:", parsedResponse.strengths?.length || 0);
    console.log("📊 Learning Opportunities count:", parsedResponse.learningOpportunities?.length || 0);
    
    // Validate that the response has the expected structure
    if (parsedResponse.skillLevel === undefined || !parsedResponse.analysisSummary || 
        !parsedResponse.strengths || !parsedResponse.learningOpportunities) {
      console.error("❌ AI response does not have the expected structure");
      console.error("📋 Missing fields:", {
        skillLevel: parsedResponse.skillLevel === undefined,
        analysisSummary: !parsedResponse.analysisSummary,
        strengths: !parsedResponse.strengths,
        learningOpportunities: !parsedResponse.learningOpportunities
      });
      throw new Error("AI response does not have the expected structure");
    }
    
    console.log("✅ Response structure validated");
    console.log("📊 Final result:", {
      skillLevel: parsedResponse.skillLevel,
      strengthsCount: parsedResponse.strengths.length,
      opportunitiesCount: parsedResponse.learningOpportunities.length
    });
    console.log("🌐 ========== API COMPLETE (SUCCESS) ==========\n");
    
    return NextResponse.json(parsedResponse);
    
  } catch (error: any) {
    console.error("\n❌ ========== API ERROR ==========");
    console.error("🚨 Error in AI skill analysis:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.error("🌐 ========== API ERROR END ==========\n");
    
    // Return a fallback response in case of error
    console.log("⚠️ USING FALLBACK ANALYSIS");
    const fallbackAnalysis = getDefaultAnalysis();
    console.log("📊 Fallback analysis:", fallbackAnalysis);
    
    return NextResponse.json(
      fallbackAnalysis,
      { status: 200 }
    );
  }
}

// Default analysis for fallback
function getDefaultAnalysis(): SkillAssessmentResult {
  console.log("📋 Generating default analysis...");
  return {
    skillLevel: 1,
    analysisSummary: "You're taking your first steps in this exciting field! Your enthusiasm to learn is your greatest asset. With dedication and the right guidance, you'll progress quickly.",
    strengths: ["Enthusiasm to learn", "Willingness to grow"],
    learningOpportunities: [
      "Start with foundational courses in your chosen field",
      "Complete hands-on beginner projects",
      "Join online communities and forums for support",
      "Practice regularly to build muscle memory"
    ]
  };
}

