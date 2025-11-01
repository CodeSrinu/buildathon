// app/api/ai-deep-dive/route.ts
import { generateRoleDeepDive } from '@/lib/aiService';
import { NextResponse } from 'next/server';

// POST /api/ai-deep-dive
// Generate AI-powered deep dive content for a specific role
export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API: /api/ai-deep-dive ==========");
    
    // Parse the request body
    const body = await request.json();
    const { role, personaContext } = body;

    console.log("📥 Request body:", { role, personaContext });

    // Validate input
    if (!role) {
      console.error("❌ Missing role in request body");
      return NextResponse.json(
        { error: 'Missing role in request body' },
        { status: 400 }
      );
    }

    console.log("🤖 Generating deep dive content for role:", role);

    // Generate deep dive content using our AI service
    const deepDiveContent = await generateRoleDeepDive(role, personaContext || '');

    console.log("✅ Deep dive content generated successfully");
    console.log("🌐 ========== API COMPLETE ==========\n");

    // Return the deep dive content
    return NextResponse.json(deepDiveContent);
  } catch (error) {
    console.error("\n❌ ========== API ERROR ==========");
    console.error('🚨 Error in ai-deep-dive API route:', error);
    console.error("🌐 ========== API ERROR END ==========\n");
    
    // Return a fallback response in case of error
    return NextResponse.json(
      {
        role: 'Software Engineer',
        description: 'A Software Engineer designs, develops, and maintains software applications and systems.',
        dailyResponsibilities: [
          'Writing and testing code',
          'Debugging and resolving issues',
          'Collaborating with team members',
          'Participating in code reviews',
          'Documenting technical specifications'
        ],
        salaryRange: {
          entry: '₹3-6 LPA',
          mid: '₹6-12 LPA',
          senior: '₹12-25 LPA+'
        },
        careerPath: [
          'Year 1: Junior Developer',
          'Year 2: Software Engineer',
          'Year 3: Senior Engineer',
          'Year 5: Tech Lead',
          'Year 7-10: Engineering Manager/Architect'
        ],
        requiredSkills: [
          'Programming languages (Java, Python, etc.)',
          'Problem-solving abilities',
          'Communication skills',
          'Team collaboration',
          'Continuous learning mindset'
        ],
        education: 'Bachelor\'s degree in Computer Science or related field',
        jobMarket: 'High demand across various industries with good growth prospects'
      },
      { status: 200 }
    );
  }
}

