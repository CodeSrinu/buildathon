// src/lib/goalValidation.ts

export interface ValidationQuizAnswers {
  primaryDrive: string;
  tenYearVision: string;
  problemSolvingApproach: string;
  preferredLearningStyle: string;
  confidenceRating: string;
}

interface AIValidationResponse {
  validatedGoal: string;
  validationStatus: "Excellent Match" | "Good Foundation" | "Requires Reflection";
  validationSummary: string;
  actionableInsights: {
    superpower: string;
    thingToConsider: string;
  };
}

// Function to validate user's goal using AI via API route
export async function validateUserGoal(
  userGoal: string,
  answers: ValidationQuizAnswers
): Promise<AIValidationResponse> {
  try {
    console.log("\n🎯 ========== CLIENT: Goal Validation Start ==========");
    console.log("📝 User Goal:", userGoal);
    console.log("📋 Answers:", answers);

    // Call the API route instead of calling AI directly
    console.log("📤 Sending request to /api/validate-goal...");
    const response = await fetch('/api/validate-goal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userGoal, answers }),
    });

    console.log("📥 Response received");
    console.log("✅ Response status:", response.status, response.statusText);
    console.log("📊 Response OK:", response.ok);

    if (!response.ok) {
      console.error("❌ Response not OK");
      const errorData = await response.json();
      console.error("📝 Error data:", errorData);

      // If it's an invalid career goal error, throw a specific error
      if (errorData.error === 'Invalid career goal') {
        const errorMessage = `${errorData.message}\n\n${errorData.suggestion || ''}`;
        throw new Error(errorMessage);
      }

      throw new Error(errorData.message || 'Failed to validate goal with AI API');
    }

    const data = await response.json();
    console.log("✅ Response data:", data);
    console.log("🎯 ========== CLIENT: Goal Validation Success ==========\n");
    return data.validationResponse;
  } catch (error: any) {
    console.error("\n❌ ========== CLIENT: Goal Validation Error ==========");
    console.error("🚨 Error Type:", error.constructor.name);
    console.error("📝 Error Message:", error.message);
    console.error("⚠️ Using fallback validation response");
    console.error("🎯 ========== CLIENT: Goal Validation Error End ==========\n");
    // Fallback to simple scoring if AI validation fails
    return getFallbackValidationResponse(userGoal, answers);
  }
}

// Function to calculate pressure score based on AI validation response
export function calculatePressureScore(validationResponse: AIValidationResponse): number {
  // Convert validation status to pressure score
  // Lower pressure score means more genuine interest
  switch (validationResponse.validationStatus) {
    case "Excellent Match":
      return 20; // Low pressure (20%)
    case "Good Foundation":
      return 50; // Moderate pressure (50%)
    case "Requires Reflection":
      return 80; // High pressure (80%)
    default:
      return 50; // Default moderate pressure
  }
}

// Fallback validation response when AI fails
function getFallbackValidationResponse(userGoal: string, answers: ValidationQuizAnswers): AIValidationResponse {
  // Simple logic to determine validation status based on key indicators
  let validationStatus: "Excellent Match" | "Good Foundation" | "Requires Reflection" = "Good Foundation";
  
  // Simple logic to determine validation status based on the answers
  if (
    answers.primaryDrive.includes("Passion") || 
    answers.primaryDrive.includes("Personal") ||
    answers.primaryDrive.includes("Social")
  ) {
    if (answers.confidenceRating === "4" || answers.confidenceRating === "5") {
      validationStatus = "Excellent Match";
    }
  } else if (
    answers.primaryDrive.includes("Family") || 
    answers.primaryDrive.includes("Financial") ||
    answers.primaryDrive.includes("Peer")
  ) {
    if (answers.confidenceRating === "1" || answers.confidenceRating === "2") {
      validationStatus = "Requires Reflection";
    }
  }
  
  // Simulated response based on validation status
  const simulatedResponses: Record<string, AIValidationResponse> = {
    "Excellent Match": {
      validatedGoal: userGoal,
      validationStatus: "Excellent Match",
      validationSummary: "Your passion for the subject combined with your preference for hands-on practice indicates strong alignment with technical fields. Your long-term vision shows focused ambition.",
      actionableInsights: {
        superpower: "Your passion for the subject is a true superpower, as it will sustain you through challenges and keep you motivated during difficult periods.",
        thingToConsider: "Your confidence is strong, but remember that expertise comes from continuous learning. Stay curious and keep updating your skills."
      }
    },
    "Good Foundation": {
      validatedGoal: userGoal,
      validationStatus: "Good Foundation",
      validationSummary: "You have a solid foundation for pursuing this career with some clear motivations and a reasonable vision. There are areas where you could develop stronger alignment.",
      actionableInsights: {
        superpower: "Your balanced approach to problem-solving will serve you well in navigating the complexities of this field.",
        thingToConsider: "Consider exploring how your preferred learning style aligns with the typical training and skill development in this career."
      }
    },
    "Requires Reflection": {
      validatedGoal: userGoal,
      validationStatus: "Requires Reflection",
      validationSummary: "There appears to be some misalignment between your stated motivations and your chosen career path. It might be worth exploring whether this goal truly resonates with your interests and strengths.",
      actionableInsights: {
        superpower: "Your openness to different approaches to learning and problem-solving shows adaptability, which is valuable in any field.",
        thingToConsider: "Take time to reflect on what genuinely excites you about this career beyond external factors like salary or prestige."
      }
    }
  };
  
  return simulatedResponses[validationStatus];
}