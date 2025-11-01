// src/components/mobile/OnboardingScreen.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingScreenProps {
  onContinue: (data: {
    language: string;
    state: string;
    hasGoal: boolean;
    goal: string;
  }) => void;
}

export default function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  const router = useRouter();
  const [language, setLanguage] = useState('telugu');
  const [state, setState] = useState('');
  const [hasGoal, setHasGoal] = useState<boolean | null>(null);
  const [goal, setGoal] = useState('');
  const [isValidatingGoal, setIsValidatingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const languages = [
    { value: 'telugu', label: 'Telugu' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'english', label: 'English' }
  ];

  const states = [
    { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
    { value: 'telangana', label: 'Telangana' },
    { value: 'tamil-nadu', label: 'Tamil Nadu' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'delhi', label: 'Delhi' }
  ];

  const handleContinue = async () => {
    if (hasGoal === null) return;
    if (hasGoal && !goal.trim()) return;

    // If user has a goal, validate it first
    if (hasGoal) {
      setIsValidatingGoal(true);
      setGoalError(null);

      try {
        console.log("🔍 Validating career goal before proceeding...");
        const response = await fetch('/api/validate-goal-input', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userGoal: goal.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("❌ Invalid career goal:", data.message);
          setGoalError(data.message || 'Invalid career goal. Please enter a valid profession.');
          setIsValidatingGoal(false);
          return;
        }

        console.log("✅ Career goal is valid, proceeding...");

        // Save the goal to session storage for the next screen
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('userGoal', goal);
        }

        setIsValidatingGoal(false);
        router.push('/goal-validation');

      } catch (error) {
        console.error("Error validating goal:", error);
        setGoalError('Unable to validate career goal. Please try again.');
        setIsValidatingGoal(false);
      }
    } else {
      // If user doesn't have a goal, continue with onboarding
      onContinue({
        language,
        state,
        hasGoal: false,
        goal: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 font-manrope text-[#333333]">
      {/* Header */}
      <div className="flex items-center justify-center py-6">
        <h2 className="text-[#333333] text-xl font-bold leading-tight tracking-[-0.015em]">Career Quest</h2>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-[#333333] text-3xl font-bold leading-tight tracking-tight">Welcome!</h1>
        <p className="text-[#888888] text-lg font-normal leading-normal mt-2">Let's personalize your journey.</p>
      </div>

      {/* Form Sections */}
      <div className="space-y-6 flex-1">
        {/* Language Selection */}
        <div>
          <label className="text-[#333333] text-base font-medium leading-normal pb-2 block" htmlFor="native-language">
            Native Language
          </label>
          <select 
            className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#333333] focus:outline-0 focus:ring-0 border border-[#E0E0E0] bg-[#F5F5F5] focus:border-[#19b357] h-14 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(51,51,51)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M215.39 92.61a8 8 0 0 0-11.38 0L128 168.69 51.99 92.61a8 8 0 0 0-11.32 11.32l82.01 82.01a8 8 0 0 0 11.32 0l81.39-82a8 8 0 0 0 0-11.33Z%27%3e%3c/path%3e%3c/svg%3e') bg-right bg-[length:24px_24px] p-3.5 text-base font-normal leading-normal appearance-none"
            id="native-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <p className="text-[#28a745] text-sm font-normal leading-normal pt-2 px-1">
            You have selected {languages.find(l => l.value === language)?.label}
          </p>
        </div>

        {/* State Selection */}
        <div>
          <label className="text-[#333333] text-base font-medium leading-normal pb-2 block" htmlFor="state">
            State
          </label>
          <select 
            className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#333333] focus:outline-0 focus:ring-0 border border-[#E0E0E0] bg-[#F5F5F5] focus:border-[#19b357] h-14 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(51,51,51)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M215.39 92.61a8 8 0 0 0-11.38 0L128 168.69 51.99 92.61a8 8 0 0 0-11.32 11.32l82.01 82.01a8 8 0 0 0 11.32 0l81.39-82a8 8 0 0 0 0-11.33Z%27%3e%3c/path%3e%3c/svg%3e') bg-right bg-[length:24px_24px] placeholder:text-[#888888] p-3.5 text-base font-normal leading-normal appearance-none"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option className="text-[#888888]" value="">Select your state</option>
            {states.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Goal Selection */}
        <div>
          <h3 className="text-[#333333] text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-3">Do you have a career goal in mind?</h3>
          <div className="space-y-4">
            <div 
              className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer ${
                hasGoal === false 
                  ? 'border-2 border-[#19b357]' 
                  : 'border-[#E0E0E0]'
              }`}
              onClick={() => setHasGoal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#19b357]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#333333] text-lg font-medium flex-1">No, help me explore</p>
              {hasGoal === false && (
                <div className="w-6 h-6 rounded-full bg-[#19b357] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            <div 
              className={`relative flex items-center gap-4 p-4 rounded-lg cursor-pointer ${
                hasGoal === true 
                  ? 'bg-[#F0FAF4] border-2 border-[#19b357]' 
                  : 'bg-white border border-[#E0E0E0]'
              }`}
              onClick={() => setHasGoal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#19b357]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#333333] text-lg font-medium flex-1">Yes, I have a goal</p>
              {hasGoal === true && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#19b357] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goal Input (if user has a goal) */}
        {hasGoal === true && (
          <div className="flex flex-col flex-1">
            <label className="text-[#333333] text-base font-medium leading-normal pb-2" htmlFor="current-goal">
              What is your current goal?
            </label>
            <input
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#333333] focus:outline-0 focus:ring-0 border bg-[#F5F5F5] h-14 placeholder:text-[#888888] p-3.5 text-base font-normal leading-normal ${
                goalError ? 'border-red-500 focus:border-red-500' : 'border-[#E0E0E0] focus:border-[#19b357]'
              }`}
              id="current-goal"
              placeholder="e.g., AI Developer, Doctor, IAS..."
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                setGoalError(null); // Clear error when user types
              }}
            />

            {/* Error Message */}
            {goalError && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Invalid Career Goal</p>
                    <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{goalError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-2">
              Examples: Software Developer, Doctor, Teacher, Data Scientist, Civil Engineer, etc.
            </p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="py-4">
        <button
          className={`flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 text-white text-lg font-bold leading-normal tracking-[0.015em] ${
            hasGoal === null || (hasGoal === true && !goal.trim()) || isValidatingGoal
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#19b357] hover:bg-[#19b357]'
          }`}
          onClick={handleContinue}
          disabled={hasGoal === null || (hasGoal === true && !goal.trim()) || isValidatingGoal}
        >
          {isValidatingGoal ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="truncate">Validating...</span>
            </div>
          ) : (
            <span className="truncate">Continue</span>
          )}
        </button>
      </div>
    </div>
  );
}