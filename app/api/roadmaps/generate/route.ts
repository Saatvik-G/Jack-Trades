import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export interface RoadmapStep {
  stepNumber: number;
  concept: string;
  buildsOn: string;
  borrowedIntuition: string;
  details: string;
}

const SYSTEM_PROMPT = `
You are an expert polymath educator. Your task is to generate a sequenced, cross-disciplinary learning path/roadmap to achieve a given user goal.

Create exactly 5 to 8 sequential steps.
For each step, you must explicitly state:
1. "stepNumber": The 1-based sequence index.
2. "concept": The core concept to learn.
3. "buildsOn": How it builds on a specific prior step (e.g. "Step 2's gradient descent", or "None" for Step 1).
4. "borrowedIntuition": A clear cross-disciplinary comparison where intuition is borrowed from a different discipline to make the concept easier to grasp (e.g. "feedback loops in control theory / biology").
5. "details": 2-3 sentences explaining the concept and how the borrowed cross-disciplinary intuition facilitates learning it.

Format the output as a strict JSON object with this shape:
{
  "goal": "user goal here",
  "steps": [
    {
      "stepNumber": 1,
      "concept": "Concept Name",
      "buildsOn": "prior step name or None",
      "borrowedIntuition": "intuition comparison",
      "details": "explanation of concept using the analogy"
    }
  ]
}

Ensure the response contains ONLY the valid JSON object, with no markdown code fences or conversational boilerplate.
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to generate roadmaps.' },
        { status: 401 }
      );
    }

    const { goal } = await req.json();

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return NextResponse.json(
        { error: 'Goal topic is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const userPrompt = `GOAL TO ACHIEVE: "${goal.trim()}"`;

    let response: Response;
    let attempt = 0;
    const maxRetries = 3;

    while (true) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.status === 429) {
        attempt++;
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(
          `[RATE LIMIT] Gemini API returned 429. Attempt ${attempt} of ${maxRetries}. Retrying in ${backoffMs}ms for roadmap: "${goal.trim()}"`
        );
        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        } else {
          return NextResponse.json(
            { error: 'Getting a lot of requests right now — try again in a few seconds' },
            { status: 429 }
          );
        }
      }

      break;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        { error: `Gemini API request failed (${response.status}). Please check your API key.` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return NextResponse.json(
        { error: 'Empty response received from Gemini API.' },
        { status: 502 }
      );
    }

    let cleanJsonStr = rawContent.trim();
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(cleanJsonStr);

    if (!parsedData.steps || !Array.isArray(parsedData.steps)) {
      return NextResponse.json(
        { error: 'Invalid structure returned from model.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      goal: goal.trim(),
      steps: parsedData.steps,
    });
  } catch (err: any) {
    console.error('Roadmap generate route exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while generating learning roadmap.' },
      { status: 500 }
    );
  }
}
