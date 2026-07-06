import { NextResponse } from 'next/server';

export interface ConnectionItem {
  id: string;
  field: string;
  analogy: string;
  explanation: string;
  funFact: string;
  emoji: string;
}

const SYSTEM_PROMPT = `
You are the AI engine behind "Jack&Trades" (The Cross-Discipline Explorer), built on the core philosophy:
"A jack of all trades is a master of none, but oftentimes better than a master of one."

YOUR MISSION:
When given any topic, concept, technique, or skill, generate 4 to 6 distinct cross-disciplinary connections.
Each connection MUST come from a DIFFERENT field selected ONLY from these 12 allowed disciplines:
- Science
- Mathematics
- Psychology
- Philosophy
- History
- Art
- Economics
- Design
- Biology
- Music
- Architecture
- Game Theory

STRICT QUALITY BAR & TONE INSTRUCTIONS:
1. NO SURFACE-LEVEL WORDPLAY OR OVERUSED TRITE ANALOGIES:
   - BAD: "Recursion is like Russian nesting dolls because dolls go inside dolls." (Too shallow, surface object matching).
   - GOOD: Explaining how recursive stack frames mirror structural self-similarity in architectural cantilevers, fractal biological growth, or recursive narrative frames in literary history.
2. MECHANISM-LEVEL STRUCTURAL SIMILARITY:
   - Focus on the underlying abstract mechanics, feedback loops, optimization pathways, state spaces, equilibrium dynamics, or structural patterns that both fields share.
3. SUBSTANTIVELY INSIGHTFUL + LIGHTLY WITTY:
   - Tone must be sharp, intellectually illuminating, and lightly witty.
   - Humor MUST sit on top of a genuine structural connection. Never replace insight with a forced pun or superficial joke. A card that is funny but shallow is a complete FAILURE.
4. REQUIRED RESPONSE FIELDS FOR EACH CONNECTION:
   - "field": Must be one of the 12 exact disciplines.
   - "analogy": A crisp, high-impact one-line structural analogy.
   - "explanation": 2-3 sentences explaining the exact structural/mechanistic equivalence between the topic and this field.
   - "funFact": A punchy, shareable, screenshot-worthy one-liner with genuine wit tied directly to the real-world manifestation of this connection.
   - "emoji": A single fitting emoji representing the connection.

FEW-SHOT EXAMPLES OF THE EXPECTED QUALITY:

Example 1: Topic = "Gradient Descent"
[
  {
    "field": "Economics",
    "analogy": "Central bank interest rate adjustments attempting to navigate stagflation.",
    "explanation": "Gradient descent minimizes a loss function by taking incremental steps proportional to the local negative gradient. Similarly, central banks tweak monetary policy in iterative steps based on current inflation and employment metrics to navigate towards an optimal macroeconomic equilibrium, suffering from identical momentum and overshooting risks.",
    "funFact": "The 1970s Federal Reserve essentially acted as a learning rate that was set way too high, causing hyper-oscillations in inflation.",
    "emoji": "📈"
  },
  {
    "field": "Biology",
    "analogy": "Slime mold (Physarum polycephalum) foraging for nutrients across a maze.",
    "explanation": "Rather than calculating global paths, slime molds extend cytoplasm in all directions and retract channels where nutrient gradients decline, iteratively converging on the shortest path. This physical relaxation algorithm directly mirrors stochastic gradient descent finding minimum energy configurations without an explicit map.",
    "funFact": "Tokyo subway engineers spent decades designing efficient rail networks; a slime mold recreated their exact layout in 26 hours for a piece of oat flake.",
    "emoji": "🍄"
  },
  {
    "field": "Music",
    "analogy": "Improvised jazz soloist adjusting pitch towards key centers based on auditory feedback.",
    "explanation": "During rapid modal improvisation, a musician continuously samples tension (the local error metric) relative to the underlying chord harmony, making micro-adjustments in pitch and rhythm to descent into harmonic resolution.",
    "funFact": "Miles Davis's famous advice 'do not play what's there, play what's missing' is essentially regularized loss optimization for jazz.",
    "emoji": "🎷"
  }
]

Example 2: Topic = "Recursion"
[
  {
    "field": "Architecture",
    "analogy": "Self-supporting cantilever trusses in Gothic cathedral vaults.",
    "explanation": "Recursive code breaks a complex problem into identical sub-problems until reaching a base case. Gothic vaulted arches distribute structural load by delegating weight iteratively to smaller flying buttresses, each carrying a miniature replica of the main arch's vector forces down to the foundation.",
    "funFact": "If Gothic architects forgot their 'base case' bedrock foundation, the entire stack overflowed into the nave.",
    "emoji": "🏛️"
  },
  {
    "field": "Game Theory",
    "analogy": "Common knowledge loops in backward induction for multi-player games.",
    "explanation": "Evaluating game trees requires reasoning about 'what I think you think I think', creating recursive mental state stacks. Players collapse this infinite regress through backward induction, starting from the terminal payoff node (the base case) and unfolding back to move zero.",
    "funFact": "Poker champions are basically running deep call-stack recursion while trying to maintain a completely blank expression.",
    "emoji": "♟️"
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

    const userPrompt = `Explore 4 to 6 non-obvious, structural cross-disciplinary connections for the topic: "${topic.trim()}". Ensure each connection comes from a different allowed field.`;

    // Fetch call to Gemini API using gemini-2.5-flash (or gemini-1.5-flash) with structured JSON output
    const response = await fetch(
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
              parts: [{ text: `${SYSTEM_PROMPT}\n\nUSER TOPIC: ${topic.trim()}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

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

    // Clean potential markdown wrap if present
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

    // Inject unique IDs for React keys
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
