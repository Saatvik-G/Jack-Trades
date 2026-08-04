import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export interface GeneratedIdea {
  title: string;
  description: string;
  whyNonObvious: string;
}

const SYSTEM_PROMPT = `
You are a creative, cross-disciplinary entrepreneur and inventor. Your mission is to propose exactly 3 concrete, buildable project or business ideas that combine ALL of the user-provided topics/fields together.

INSTRUCTIONS:
1. Avoid generic, surface-level intersections.
2. The ideas must be highly specific, exploiting deep mechanism-level overlaps between the selected topics.
3. For each idea, provide:
   - "title": A descriptive, premium name.
   - "description": 2-3 sentences describing what the project is, how it works, and how it combines the topics.
   - "whyNonObvious": 1-2 sentences explaining WHY combining these specific fields makes the idea non-obvious and what unique advantage/insight it unlocks.

Format the output as a strict JSON object with this shape:
{
  "ideas": [
    {
      "title": "Project Title",
      "description": "Project description detailing combined mechanism...",
      "whyNonObvious": "Why this specific combination is non-obvious and powerful..."
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
        { error: 'You must be logged in to generate ideas.' },
        { status: 401 }
      );
    }

    const { topics } = await req.json();

    if (!topics || !Array.isArray(topics) || topics.length < 2) {
      return NextResponse.json(
        { error: 'Please select at least 2 topics.' },
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

    const userPrompt = `COMBINE ALL OF THESE FIELDS/TOPICS: [${topics.map(t => `"${t.trim()}"`).join(', ')}]`;

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
              temperature: 0.8,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.status === 429) {
        attempt++;
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(
          `[RATE LIMIT] Gemini API returned 429. Attempt ${attempt} of ${maxRetries}. Retrying in ${backoffMs}ms for ideas with topics: ${topics.join(', ')}`
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

    if (!parsedData.ideas || !Array.isArray(parsedData.ideas)) {
      return NextResponse.json(
        { error: 'Invalid structure returned from model.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      topics,
      ideas: parsedData.ideas,
    });
  } catch (err: any) {
    console.error('Ideas generate route exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while generating project ideas.' },
      { status: 500 }
    );
  }
}
