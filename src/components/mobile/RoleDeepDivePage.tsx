// src/components/mobile/RoleDeepDivePage.tsx
'use client';

import { useState, useEffect } from 'react';
import { AIDeepDiveResponse } from '@/types/ai.types';

interface RoleDeepDivePageProps {
  roleId: string;
  roleName: string;
  personaContext: string;
  onBack: () => void;
  onStartLearning: () => void;
  roleRank?: number;
}

export default function RoleDeepDivePage({ 
  roleId, 
  roleName, 
  personaContext, 
  onBack, 
  onStartLearning,
  roleRank = 1
}: RoleDeepDivePageProps) {
  const [deepDiveData, setDeepDiveData] = useState<AIDeepDiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeepDiveData = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Fetching Deep Dive Data ==========");
        console.log("📝 Role Name:", roleName);
        console.log("📋 Persona Context:", personaContext.substring(0, 100) + "...");

        setLoading(true);
        setError(null);

        // Call our API route to generate AI deep dive content
        console.log("📤 Calling /api/ai-deep-dive...");
        const requestBody = {
          role: roleName,
          personaContext: personaContext
        };
        console.log("📦 Request body:", requestBody);

        const response = await fetch('/api/ai-deep-dive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log("📥 Deep dive API response status:", response.status);
        console.log("📥 Response OK:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Deep dive API request failed:", errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ Received deep dive data:");
        console.log("📊 Role:", data.role);
        console.log("📊 Description:", data.description?.substring(0, 100) + "...");
        console.log("📊 Daily Responsibilities:", data.dailyResponsibilities?.length || 0, "items");
        console.log("📊 Salary Range:", data.salaryRange);
        console.log("📊 Career Path:", data.careerPath?.length || 0, "items");
        console.log("📊 Required Skills:", data.requiredSkills?.length || 0, "items");
        console.log("📊 Education:", data.education?.substring(0, 50) + "...");
        console.log("📊 Job Market:", data.jobMarket?.substring(0, 50) + "...");

        // Check if we got fallback data
        const isFallbackData = data.description?.includes("professional who specializes in this field");
        const isHardcodedFallback = data.role === "Software Engineer" && roleName !== "Software Engineer";

        if (isFallbackData) {
          console.warn("⚠️ WARNING: Received generic fallback data (from getFallbackDeepDive)");
        }
        if (isHardcodedFallback) {
          console.warn("⚠️ WARNING: Received hardcoded 'Software Engineer' fallback instead of requested role:", roleName);
        }

        console.log("🎯 ========== CLIENT: Deep Dive Data Received ==========\n");

        setDeepDiveData(data);
      } catch (err) {
        console.error("\n❌ ========== CLIENT: Deep Dive Error ==========");
        console.error('🚨 Error fetching deep dive data:', err);
        console.error("🎯 ========== CLIENT: Deep Dive Error End ==========\n");
        setError('Failed to load role information. Please try again.');
        
        // Fallback to sample data
        const sampleData: AIDeepDiveResponse = {
          role: roleName,
          description: `A ${roleName} is a professional who specializes in this field. This role typically involves a combination of technical skills and soft skills to deliver value in their domain.`,
          dailyResponsibilities: [
            "Performing core duties related to the role",
            "Collaborating with team members on projects",
            "Attending meetings and providing updates",
            "Documenting processes and outcomes",
            "Continuously learning and adapting to new challenges"
          ],
          salaryRange: {
            entry: "₹3,00,000 - ₹6,00,000 per year",
            mid: "₹6,00,000 - ₹12,00,000 per year",
            senior: "₹12,00,000 - ₹25,00,000 per year"
          },
          careerPath: [
            "Year 1: Entry-level position",
            "Year 2: Junior specialist",
            "Year 3: Mid-level professional",
            "Year 5: Senior specialist or team lead",
            "Year 7-10: Manager or domain expert"
          ],
          requiredSkills: [
            "Core technical skills for the role",
            "Communication and collaboration",
            "Problem-solving abilities",
            "Time management and organization",
            "Continuous learning mindset"
          ],
          education: "A bachelor's degree in a relevant field is typically required, though alternative education paths and certifications may be available.",
          jobMarket: "This role has steady demand in the Indian job market with opportunities across various industries and company sizes."
        };
        setDeepDiveData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchDeepDiveData();
  }, [roleName, personaContext]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center p-4">
            <button 
              className="flex size-10 shrink-0 items-center justify-center text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={onBack}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Role Title Skeleton */}
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
          
          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
          
          {/* Section Skeletons */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Role Information</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              onClick={onBack}
            >
              Go Back
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deepDiveData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Information Available</h2>
          <p className="text-gray-600">Unable to load detailed information for this role.</p>
          <button
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            onClick={onBack}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center p-4">
          <button 
            className="flex size-10 shrink-0 items-center justify-center text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={onBack}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              {roleRank && (
                <span className="text-xs font-bold px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full">
                  #{roleRank} Recommendation
                </span>
              )}
              <h1 className="text-lg font-bold text-slate-800 truncate">{deepDiveData.role}</h1>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-6">
          {/* Role Description */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">About This Career Path</h2>
            <p className="text-slate-600">{deepDiveData.description}</p>
          </div>

          {/* Daily Responsibilities */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Daily Responsibilities</h2>
            <ul className="space-y-2">
              {deepDiveData.dailyResponsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <span className="text-slate-600">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Salary Range (INR)</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Entry Level</div>
                <div className="font-bold text-slate-800">{deepDiveData.salaryRange.entry}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Mid Level</div>
                <div className="font-bold text-slate-800">{deepDiveData.salaryRange.mid}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Senior Level</div>
                <div className="font-bold text-slate-800">{deepDiveData.salaryRange.senior}</div>
              </div>
            </div>
          </div>

          {/* Career Path */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Career Progression</h2>
            <div className="space-y-4">
              {deepDiveData.careerPath.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex flex-col items-center mr-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    {index < deepDiveData.careerPath.length - 1 && (
                      <div className="w-0.5 h-8 bg-blue-200 mt-1"></div>
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span className="text-slate-600">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {deepDiveData.requiredSkills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Job Market */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Education</h2>
              <p className="text-slate-600">{deepDiveData.education}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Job Market</h2>
              <p className="text-slate-600">{deepDiveData.jobMarket}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <button 
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-md shadow-green-200/50 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02]"
          onClick={onStartLearning}
        >
          <span className="truncate">Calculate My Starting Level</span>
        </button>
      </div>
    </div>
  );
}