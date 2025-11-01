// src/components/mobile/GoalValidation.tsx
'use client';

import { useState } from 'react';
import { validateUserGoal, calculatePressureScore } from '@/lib/goalValidation';

interface GoalValidationQuestion {
  id: number;
  text: string;
  options: string[];
  type: 'single-select' | 'rating';
  ratingLabels?: [string, string];
}

interface ValidationQuizAnswers {
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

interface GoalValidationProps {
  userGoal: string;
  onComplete: (answers: Record<number, string>, pressureScore: number) => void;
  onBack: () => void;
  onExploreAlternatives: () => void;
  onGetAIRecommendation: () => void;
  onContinueWithGoal?: () => void;
}

export default function GoalValidation({ userGoal, onComplete, onBack, onExploreAlternatives, onGetAIRecommendation, onContinueWithGoal }: GoalValidationProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [pressureScore, setPressureScore] = useState<number | null>(null);
  const [validationSummary, setValidationSummary] = useState<string | null>(null);
  const [actionableInsights, setActionableInsights] = useState<{ superpower: string; thingToConsider: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Goal validation questions for users with existing goals
  const questions: GoalValidationQuestion[] = [
    {
      id: 1,
      text: "What primarily drives your interest in this field?",
      options: [
        "Passion for the subject",
        "Financial prospects",
        "Family expectations",
        "Peer influence",
        "Personal achievement",
        "Social impact"
      ],
      type: 'single-select'
    },
    {
      id: 2,
      text: "Where do you see yourself in this field in 10 years?",
      options: [
        "Technical expert",
        "Team leader",
        "Entrepreneur",
        "Researcher",
        "Educator",
        "Policy maker"
      ],
      type: 'single-select'
    },
    {
      id: 3,
      text: "When faced with a difficult problem in your field, what's your approach?",
      options: [
        "Solve it alone",
        "Seek help from others",
        "Research extensively",
        "Take a break and return",
        "Ask an expert",
        "Try different methods"
      ],
      type: 'single-select'
    },
    {
      id: 4,
      text: "How do you prefer to learn new skills in your field?",
      options: [
        "Hands-on practice",
        "Watching tutorials",
        "Reading documentation",
        "Group discussions",
        "Mentoring others",
        "Formal education"
      ],
      type: 'single-select'
    },
    {
      id: 5,
      text: "Rate your confidence in pursuing this goal:",
      options: ["1", "2", "3", "4", "5"],
      type: 'rating',
      ratingLabels: ["Not Confident", "Very Confident"]
    }
  ];

  const currentQ = questions[currentQuestion];
  const isRatingQuestion = currentQ.type === 'rating';

  const handleAnswerSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate validation score
      calculateValidationScore();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const calculateValidationScore = async () => {
    setIsCalculating(true);
    setErrorMessage(null); // Clear any previous errors

    try {
      // Map answers to the validation quiz format
      const validationAnswers: ValidationQuizAnswers = {
        primaryDrive: answers[0] || "",
        tenYearVision: answers[1] || "",
        problemSolvingApproach: answers[2] || "",
        preferredLearningStyle: answers[3] || "",
        confidenceRating: answers[4] || ""
      };

      // Call validation service (which will use the API route)
      const validationResponse = await validateUserGoal(userGoal, validationAnswers);

      // Calculate pressure score based on validation response
      const score = calculatePressureScore(validationResponse);

      setPressureScore(score);
      setValidationSummary(validationResponse.validationSummary);
      setActionableInsights(validationResponse.actionableInsights);

      setIsCalculating(false);
    } catch (error: any) {
      console.error("Error validating goal:", error);
      setErrorMessage(error.message || "An error occurred while validating your goal.");
      setIsCalculating(false);
    }
  };

  const handleViewResults = () => {
    if (pressureScore !== null) {
      onComplete(answers, pressureScore);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setPressureScore(null);
    setValidationSummary(null);
    setActionableInsights(null);
  };

  const isQuestionAnswered = () => {
    return answers[currentQuestion] !== undefined && answers[currentQuestion] !== '';
  };

  // Wireframe loading skeleton based on ResultsPage and RoleDeepDivePage patterns
  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center p-4">
            <div className="flex size-10 shrink-0 items-center justify-center">
              <div className="bg-gray-200 rounded-full w-6 h-6 animate-pulse"></div>
            </div>
            <div className="flex-1 text-center">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mx-auto"></div>
            </div>
            <div className="w-10"></div>
          </div>
        </header>
        
        <main className="flex-1 p-4">
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
            
            {/* Analysis status */}
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <div className="bg-gray-200 rounded-full w-6 h-6 animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
            </div>
            
            {/* Validation Card Skeleton */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-md">
                  <div className="bg-gray-200 rounded-full w-8 h-8 animate-pulse"></div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Section Skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                    <div className="bg-gray-200 rounded-full w-5 h-5 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Info Card Skeleton */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="bg-gray-200 rounded-full w-5 h-5 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button onClick={handleBack} className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-gray-800">Goal Validation</h1>
            <div className="w-6"></div>
          </div>
        </header>

        {/* Error Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Invalid Career Goal</h3>
                  <p className="text-red-700 whitespace-pre-line">{errorMessage}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <strong>Examples of valid career goals:</strong><br/>
                    Software Developer, Doctor, Teacher, Data Scientist, Marketing Manager, Civil Engineer, Graphic Designer, etc.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onBack}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go Back and Enter Valid Goal
              </button>

              <button
                onClick={handleRetakeQuiz}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (pressureScore !== null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button onClick={handleBack} className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-gray-800">Goal Validation</h1>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Validation Results</h2>
            <p className="text-gray-600">Your goal: <span className="font-medium">{userGoal}</span></p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {pressureScore}%
                </div>
                <p className="text-gray-600">
                  {pressureScore >= 70 
                    ? "High external pressure detected" 
                    : pressureScore >= 40 
                      ? "Moderate external pressure" 
                      : "Low external pressure - genuine interest"}
                </p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                    pressureScore >= 70 ? 'bg-red-500' : pressureScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${pressureScore}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Genuine Interest</span>
                <span>External Pressure</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">AI Validation Summary</h3>
              {validationSummary ? (
                <p className="text-gray-600">{validationSummary}</p>
              ) : pressureScore >= 70 ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Our analysis suggests your goal may be influenced by external factors. This isn't necessarily negative, but it's important to ensure your career path aligns with your authentic interests.
                  </p>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">Recommendation</h4>
                    <p className="text-red-700 text-sm">
                      We recommend exploring alternative career paths to discover what truly resonates with your interests and strengths. Our AI can provide personalized recommendations.
                    </p>
                  </div>
                </div>
              ) : pressureScore >= 40 ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    There appears to be some external influence on your career choice. While you may have genuine interest, exploring other options might reveal better alignments.
                  </p>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Recommendation</h4>
                    <p className="text-yellow-700 text-sm">
                      Consider exploring alternative career paths that might better align with your interests, or proceed confidently with your current goal.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Your responses indicate strong alignment with your chosen career path. You've thought deeply about your motivations and future direction.
                  </p>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Recommendation</h4>
                    <p className="text-green-700 text-sm">
                      Continue with your chosen path with confidence. Let's explore this career in detail.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {actionableInsights && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Key Insights</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-700 mb-1"><strong>Your Strength:</strong> {actionableInsights.superpower}</h4>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-1"><strong>Consider:</strong> {actionableInsights.thingToConsider}</h4>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Navigation buttons */}
        <footer className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col gap-3">
            {pressureScore >= 70 && (
              <>
                <button
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-indigo-600 hover:to-indigo-700"
                  onClick={onGetAIRecommendation}
                >
                  AI Recommendation
                </button>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-purple-600 hover:to-purple-700"
                    onClick={onExploreAlternatives}
                  >
                    Explore All Domains
                  </button>
                  <button
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-red-600 hover:to-red-700"
                    onClick={onContinueWithGoal || handleViewResults}
                  >
                    Continue Anyway
                  </button>
                </div>
              </>
            )}
            {pressureScore < 70 && (
              <button
                className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all duration-300 ${
                  pressureScore < 40 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                }`}
                onClick={onContinueWithGoal || handleViewResults}
              >
                Continue
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <span className="text-sm text-gray-500 w-12 text-right">{currentQuestion + 1}/{questions.length}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Goal Validation</h2>
        <p className="text-gray-600 mb-6">Your goal: <span className="font-medium">{userGoal}</span></p>

        <h3 className="text-lg font-medium mb-6 text-gray-800">{currentQ.text}</h3>

        <div className="space-y-4">
          {isRatingQuestion ? (
            <div>
              <div className="flex justify-between">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    className={`flex-1 py-3 px-2 rounded-lg mx-1 transition-all duration-200 ${ 
                      answers[currentQuestion] === option
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    <span className="text-sm font-medium">{index + 1}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2 px-2">
                <span>{currentQ.ratingLabels?.[0]}</span>
                <span>{currentQ.ratingLabels?.[1]}</span>
              </div>
            </div>
          ) : (
            currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${ 
                  answers[currentQuestion] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${ 
                    answers[currentQuestion] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === option && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Navigation buttons */}
      <footer className="p-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between gap-3">
          <button
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all duration-300"
            onClick={handleBack}
          >
            Back
          </button>
          <button
            className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all duration-300 ${ 
              isQuestionAnswered()
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={!isQuestionAnswered()}
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  );
}