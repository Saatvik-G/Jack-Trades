import { NextResponse } from 'next/server';

export interface ConnectionItem {
  id: string;
  field: string;
  analogy: string;
  explanation: string;
  funFact: string;
  emoji: string;
}

const ALL_DISCIPLINES = [
  'Science',
  'Mathematics',
  'Psychology',
  'Philosophy',
  'History',
  'Art',
  'Economics',
  'Design',
  'Biology',
  'Music',
  'Architecture',
  'Game Theory',
  'Sociology',
  'Engineering',
  'Literature',
  'Ecology',
];

function getRandomCandidates(allFields: string[], count: number = 9): string[] {
  const shuffled = [...allFields].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const BASE_SYSTEM_PROMPT = `
You are the AI engine behind "Jack&Trades" (The Cross-Discipline Explorer), built on the core philosophy:
"A jack of all trades is a master of none, but oftentimes better than a master of one."

YOUR MISSION:
When given any topic, concept, technique, or skill, generate 4 to 6 distinct cross-disciplinary connections.

VARIETY & NOVELTY INSTRUCTIONS:
- You will be provided a candidate subset of fields for this specific prompt.
- You MUST pick your 4 to 6 fields EXCLUSIVELY from the provided candidate list.
- Each connection MUST come from a DIFFERENT field in the candidate list.
- Actively avoid defaulting to standard "safe" combinations (like Science/Art/Philosophy). Seek surprising, non-obvious, but structurally precise choices.

STRICT QUALITY BAR & TONE INSTRUCTIONS:
1. NO SURFACE-LEVEL WORDPLAY OR OVERUSED TRITE ANALOGIES:
   - BAD: "Recursion is like Russian nesting dolls because dolls go inside dolls." (Too shallow, surface object matching).
   - GOOD: Explaining how recursive stack frames mirror structural self-similarity in architectural cantilevers, biological morphogenesis, or recursive narrative frames in literature.
2. MECHANISM-LEVEL STRUCTURAL SIMILARITY:
   - Focus on underlying abstract mechanics, feedback loops, optimization pathways, state spaces, equilibrium dynamics, or structural patterns that both fields share.
3. SUBSTANTIVELY INSIGHTFUL + LIGHTLY WITTY:
   - Tone must be sharp, intellectually illuminating, and lightly witty.
   - Humor MUST sit on top of a genuine structural connection. Never replace insight with a forced pun or superficial joke. A card that is funny but shallow is a complete FAILURE.
4. REQUIRED RESPONSE FIELDS FOR EACH CONNECTION:
   - "field": Must be one of the exact fields from your candidate list.
   - "analogy": A crisp, high-impact one-line structural analogy.
   - "explanation": 2-3 sentences explaining the exact structural/mechanistic equivalence between the topic and this field.
   - "funFact": A punchy, shareable, screenshot-worthy one-liner with genuine wit tied directly to the real-world manifestation of this connection.
   - "emoji": A single fitting emoji representing the connection.

FEW-SHOT EXAMPLES OF THE EXPECTED QUALITY:

Example 1: Topic = "Gradient Descent"
[
  {
    "field": "Sociology",
    "analogy": "Social norms gradually shifting toward cultural equilibrium via group feedback.",
    "explanation": "Societal conventions evolve through continuous micro-interactions where social friction acts as a loss metric. Individuals make incremental behavioral adjustments based on peer reaction gradient, steering collective behavior toward social stability.",
    "funFact": "Fashion trends are basically society's collective attempt to find local minima in the landscape of social approval.",
    "emoji": "👥"
  },
  {
    "field": "Ecology",
    "analogy": "Forest canopy trees competing for sunlight through adaptive growth vectors.",
    "explanation": "Trees don't plan full growth maps; they extend branches iteratively along photon density gradients while shedding shaded leaves. This localized energy optimization finds optimal canopy coverage without central coordination.",
    "funFact": "Trees were running gradient descent optimization on solar capture millions of years before gradient descent had a name.",
    "emoji": "🌲"
  },
  {
    "field": "Literature",
    "analogy": "Drafting an epic novel through iterative structural revisions.",
    "explanation": "An author refines plot consistency by gauging narrative tension (the error signal) chapter by chapter, taking small structural edits to minimize plot holes and converge on character arc resolution.",
    "funFact": "Hemingway rewrote the ending to A Farewell to Arms 39 times—39 iterations of loss minimization to find the perfect emotional impact.",
    "emoji": "📚"
  }
]

CRITICAL: Return ONLY valid JSON in the following format, with no markdown code fences or conversational boilerplate:
{
  "connections": [
    {
      "field": "DisciplineName",
      "analogy": "...",
      "explanation": "...",
      "funFact": "...",
      "emoji": "..."
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required.' },
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

    // Step 3: Randomly select a subset of 8-10 candidate fields for this request
    const candidateFields = getRandomCandidates(ALL_DISCIPLINES, 9);

    const userPrompt = `
CANDIDATE FIELDS FOR THIS REQUEST: [${candidateFields.join(', ')}]

TOPIC TO EXPLORE: "${topic.trim()}"

INSTRUCTION: Select 4 to 6 DIFFERENT fields from the candidate list above. Uncover non-obvious, mechanism-level structural connections for "${topic.trim()}".
`;

    // Fetch call to Gemini API using gemini-2.5-flash with retry resilience
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
                parts: [{ text: `${BASE_SYSTEM_PROMPT}\n\n${userPrompt}` }],
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
        const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1000ms, 2000ms, 4000ms
        console.warn(
          `[RATE LIMIT] Gemini API returned 429. Attempt ${attempt} of ${maxRetries}. Retrying in ${backoffMs}ms for topic: "${topic.trim()}"`
        );
        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        } else {
          console.error(
            `[RATE LIMIT FAILED] Max retries exhausted for 429 rate limit. Topic: "${topic.trim()}"`
          );
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

    if (!parsedData.connections || !Array.isArray(parsedData.connections)) {
      return NextResponse.json(
        { error: 'Invalid structure returned from model.' },
        { status: 502 }
      );
    }

    const connectionsWithIds: ConnectionItem[] = parsedData.connections.map(
      (item: any, idx: number) => ({
        id: `conn-${Date.now()}-${idx}`,
        field: item.field || 'General',
        analogy: item.analogy || '',
        explanation: item.explanation || '',
        funFact: item.funFact || '',
        emoji: item.emoji || '💡',
      })
    );

    return NextResponse.json({
      topic: topic.trim(),
      connections: connectionsWithIds,
    });
  } catch (err: any) {
    console.error('API Route Exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while connecting ideas.' },
      { status: 500 }
    );
  }
}
