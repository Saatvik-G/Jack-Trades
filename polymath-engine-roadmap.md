# The Polymath Engine — Build Roadmap & Antigravity Prompts

This doc maps your original 13 features onto a phased build plan. Nothing is cut — everything just has a *turn*. Use this alongside a `VISION.md` (your original pitch) as your north star; this doc is the execution plan.

Feature → Phase map:
| Phase | Features introduced |
|---|---|
| 1 | Cross-Discipline Explorer |
| 2 | Personal Second Brain, Knowledge Graph |
| 3 | Learning Roadmaps, Idea Generator |
| 4 | Skill Tracker, Reading Companion, Project Generator |
| 5 | Daily Curiosity Feed, Debate & Socratic Mode, Creativity Mode |
| 6 | AI Research Assistant, Innovation Lab |

Each phase only starts once the previous one is actually being used and feels solid. Resist starting Phase N+1 to escape a hard problem in Phase N — that instinct is usually your brain avoiding the prompt-engineering grind, not a sign the feature is actually ready.

**A note on `vision.txt`:** keep your original vision writeup as a plain file (`vision.txt` or `VISION.md`) sitting in the project folder. It's fine to reference it in a prompt for tone/philosophy grounding — a few prompts below do this explicitly — but never paste it in as the primary build instruction. It answers "why," the phase prompts answer "what to build right now." If a phase prompt below doesn't mention `vision.txt`, that's intentional — not every phase needs philosophical grounding, mostly just the ones where the model's tone/voice or connection-quality bar matters most.

---

## Phase 1 — Cross-Discipline Explorer (the core engine)

**Goal:** prove the central thesis works: an AI that gives genuinely insightful cross-domain connections, not generic ones.

### Antigravity prompt

```
Build a single-page web app called "Polymath Explorer" using Next.js (App Router), TypeScript, and Tailwind CSS.

FUNCTIONALITY:
- A centered input box where a user types any topic, concept, or skill (e.g. "gradient descent," "supply and demand," "recursion").
- On submit, call an LLM API (use the Gemini API via a server-side API route — read the key from an environment variable GEMINI_API_KEY, never hardcode it) with a prompt that asks for 4-6 cross-disciplinary connections to the input topic, each connection drawn from a DIFFERENT field among: Science, Mathematics, Psychology, Philosophy, History, Art, Economics, Design, Biology, Music, Architecture, Game Theory.
- For each connection, the response must include: (1) the field name, (2) a one-line analogy, (3) a 2-3 sentence explanation of the STRUCTURAL similarity (not just surface-level wordplay — e.g. "recursion is like a Russian nesting doll" is fine as a one-liner but the explanation must go deeper into why the same abstract pattern appears in both domains).
- Explicitly instruct the model in the system prompt to avoid generic, overused analogies and to prioritize non-obvious, specific, mechanism-level connections. Include 2-3 example outputs in the prompt (few-shot) showing the quality bar you want.
- Before writing the system prompt, read `vision.txt` in the project root for the philosophy behind this product (the "jack of all trades" framing and the emphasis on structural, not surface-level, connections) — use it to calibrate the tone and rigor of the system prompt you write, not to add scope to the app itself.
- Display results as a set of cards, one per field, in a responsive grid. Each card shows the field, the one-liner in bold, then the explanation.
- Include a loading state and graceful error handling if the API call fails.
- Add a small "regenerate" button per result set that re-calls the API for a fresh set of connections on the same topic.

NO auth, NO database, NO saving in this phase — pure input/output. Keep the UI clean and minimal: white background, one accent color, generous whitespace, readable typography. Deploy-ready (Vercel-compatible).

Do not add any other features beyond what's described above.
```

### What to validate before moving on
- Show it to 5+ people. At least 2 should say a connection surprised them.
- If outputs feel generic, don't add features — go back and iterate the prompt (more few-shot examples, stricter constraints, maybe ask the model to self-critique its first draft before returning).

---

## Phase 2 — Second Brain + Knowledge Graph

**Goal:** turn one-off explorations into a persistent, connected personal knowledge base — this is where 2 of your 13 features fall out naturally from Phase 1's usage data.

### Antigravity prompt

```
Extend the existing Polymath Explorer app with persistence and a knowledge graph view.

ADD:
1. Auth: simple email/password or Google OAuth using NextAuth.js (or Clerk if simpler to wire up). Each user has their own account.
2. Database: use Supabase (Postgres) or a simple SQLite/Prisma setup for local dev. Schema:
   - topics (id, user_id, title, created_at)
   - connections (id, topic_id, field, one_liner, explanation, created_at)
3. "Save" button on each connection card from the Explorer — saves that topic + its connections to the user's account if not already saved.
4. A new "My Second Brain" page listing all saved topics as a searchable, filterable list (filter by field, sort by date).
5. A new "Knowledge Graph" page that visualizes saved topics and their connected fields as an interactive node graph (use react-force-graph or d3.js). Topics are central nodes; fields they connect to are surrounding nodes; shared fields across multiple topics should visually cluster, so the user can see which fields their curiosity gravitates toward, and which topics link back to the same field (e.g. multiple topics connecting to "game theory").
6. Clicking a node in the graph opens the relevant topic's saved connections.

Keep the existing Explorer page and flow completely intact — this is additive, not a rewrite. Match the existing minimal visual style.
```

### What to validate before moving on
- Do you personally check the Second Brain / graph after a few days, or did you just build it and forget it? If nobody's using it, don't add more on top — find out why (is it the graph? the saving flow?) before Phase 3.

---

## Phase 3 — Learning Roadmaps + Idea Generator

**Goal:** turn stored connections into forward-looking output — plans and ideas, not just reference material.

### Antigravity prompt

```
Add two new features to the Polymath Engine app, both reusing the existing saved topics/connections data:

1. LEARNING ROADMAPS:
   - New page "Roadmaps." User picks a goal topic (e.g. "understand machine learning deeply") either by typing a new one or selecting from saved topics.
   - Call the LLM API with a prompt asking it to generate a sequenced, cross-disciplinary learning path: 5-8 steps, where each step names a concept AND explicitly states which prior step it builds on and which other discipline it borrows intuition from (e.g. "Step 3: Backpropagation — builds on Step 2's gradient descent; intuition borrowed from feedback loops in control theory / biology").
   - Display as a vertical timeline UI. Each step is expandable for more detail. Allow the user to save a generated roadmap to their account (new `roadmaps` table: id, user_id, goal, steps as JSON).

2. IDEA GENERATOR:
   - New page "Ideas." User selects 2+ saved topics (or types new ones) from different fields.
   - Call the LLM API asking it to propose 3 concrete, buildable project or business ideas that combine ALL the selected topics/fields together — not generic ideas, but ones that specifically exploit the intersection (explain in 1-2 sentences per idea WHY combining those specific fields makes the idea non-obvious).
   - Display as idea cards with a "save to Second Brain" option (tag it as an idea type, distinct from a topic).

Keep both features visually consistent with the existing app. Add both to the main navigation.
```

---

## Phase 4 — Skill Tracker + Reading Companion + Project Generator

**Goal:** connect the engine to the user's actual ongoing learning and reading, not just abstract topics.

### Antigravity prompt

```
Add three features to the Polymath Engine, building on existing auth/database:

1. SKILL TRACKER:
   - New page "Skills." User can add skills they're learning (e.g. "Python," "Public Speaking," "Statistics") with a self-rated proficiency (1-5).
   - For each skill, use the LLM API to surface 2-3 saved topics/connections from the user's Second Brain that are relevant to that skill, plus 1 NEW cross-discipline connection specific to leveling up that skill.
   - Simple table/card view: skill name, proficiency slider, "related connections" expandable section.

2. READING COMPANION:
   - New page "Reading." User pastes in a book title, article title, or a short excerpt/summary of what they're reading.
   - LLM call returns: (a) 3 cross-disciplinary questions to think about while reading this, designed to surface connections the book itself won't make explicit, (b) 2-3 related saved topics from their Second Brain if any exist.
   - Save readings to a `readings` table (id, user_id, title, notes, created_at) with room for freeform notes the user adds themselves.

3. PROJECT GENERATOR:
   - New page "Projects." Similar to Idea Generator (Phase 3) but goes one level more concrete: given 1-2 selected topics/fields, the LLM returns a scoped, buildable weekend-project spec — not just an idea, but a rough spec (goal, core mechanic, tech/tools needed, a stretch feature) similar in spirit to how we scoped your CA site and Explorer prompts.
   - Save generated project specs to a `projects` table (id, user_id, title, spec as JSON, status: idea/in-progress/done).

Match existing UI patterns. Add all three to navigation.
```

---

## Phase 5 — Daily Curiosity Feed + Debate & Socratic Mode + Creativity Mode

**Goal:** make the app something users open unprompted, not just when they have a specific topic in mind.

### Antigravity prompt

```
Add three engagement-oriented features to the Polymath Engine:

1. DAILY CURIOSITY FEED:
   - New "Today" page/homepage widget. Once per day (cache the result per user per day in a `daily_feed` table), generate ONE cross-discipline connection via the LLM, seeded either from a topic in the user's Second Brain (weighted toward fields they've saved less of, to encourage breadth) or a curated fallback list of interesting general topics if the user has no saved topics yet.
   - Simple, low-friction card: topic, connection, a "save" and "explore further" (routes to full Explorer with that topic pre-filled) button.

2. DEBATE & SOCRATIC MODE:
   - New page "Debate." User picks or types a topic/claim. The app runs a turn-based LLM conversation where the AI takes a Socratic questioning stance — NOT giving answers, but asking probing questions that push the user to justify their reasoning, drawing analogies from other fields to challenge assumptions (e.g. if discussing an economics claim, it might probe using a biology or game-theory framing).
   - Simple chat UI, scoped to this one mode (separate system prompt from the rest of the app — this one should NOT converge quickly to an answer; it should extend the user's thinking for at least 4-5 exchanges before offering a synthesis if asked).
   - Read `vision.txt` before drafting this mode's system prompt — this feature is the closest one to the project's core philosophy (breadth of thinking over quick single-discipline answers), so its voice should read as distinctly more probing/patient than the rest of the app's assistant-style modes.

3. CREATIVITY MODE:
   - New page "Creativity." A constrained creative prompt generator: user picks two random or selected fields, and the LLM proposes a creative writing / design / art prompt that force-combines them (e.g. "write a short story about grief using the structure of a sorting algorithm"). Include a text box for the user to draft their response inline, saved to a `creative_prompts` table.

Keep these as clearly separate "modes" in navigation, distinct visually (e.g. a different accent color per mode) so users understand they're different interaction styles, not just more topic pages.
```

---

## Phase 6 — AI Research Assistant + Innovation Lab

**Goal:** the "capstone" tier — tie everything together into assistant-style and lab-style workflows. Only attempt once Phases 1-5 are stable and used.

### Antigravity prompt

```
Add two advanced, integrative features to the Polymath Engine:

1. AI RESEARCH ASSISTANT:
   - New page "Research Assistant" — a persistent chat interface (not single-shot like Explorer) that has access to the user's ENTIRE Second Brain (saved topics, connections, roadmaps, readings, skills) as context.
   - On each user message, retrieve the most relevant saved items (simple keyword/embedding-based retrieval — use a vector column in Postgres via pgvector, or a simple cosine-similarity approach over stored embeddings) and inject them into the LLM's context so its answers are grounded in what the user has already explored, explicitly referencing prior saved topics when relevant ("You saved a connection between X and biology last week — this builds on that").
   - This is the closest feature to a true personalized "second brain assistant" — treat it as the most technically ambitious piece and budget the most time for the retrieval quality, not just the chat UI.

2. INNOVATION LAB:
   - New page "Innovation Lab." A workspace where a user picks 3+ saved topics/ideas/projects and the LLM generates a longer-form "innovation brief": a synthesized concept combining all of them, including potential real-world applications, closest existing analogues (to check novelty), and open questions/risks.
   - Allow exporting the brief as a markdown or PDF document.
   - This page is meant to be used occasionally, for bigger swings — not a daily-use feature like the Curiosity Feed.
   - Read `vision.txt` before drafting the innovation-brief system prompt — this feature is the fullest expression of the "innovation happens at the intersection of disciplines" thesis, so the brief's framing should echo that language rather than reading like a generic startup-idea generator.

Both features should feel like the "advanced tier" of the app — gate them behind having at least, say, 10 saved topics, so users build up material before using them (prompt this gently in the UI rather than hard-blocking).
```

---

## Future improvements (post-Phase 6 / "someday" list)

Don't build these until the core product has real, sustained usage. Recording them here so they're out of your head but not lost:

- **Embeddings-based auto-clustering** of the knowledge graph, so fields/topics group themselves automatically as the graph grows, instead of relying only on explicit tags.
- **Multiplayer/shared graphs** — let two users compare or merge their knowledge graphs to find shared interests (nice growth/virality mechanic later).
- **Voice mode** for the Debate/Socratic mode, so it feels like an actual conversation rather than typed chat.
- **Browser extension** that lets you highlight text anywhere on the web and instantly send it to the Cross-Discipline Explorer or Reading Companion.
- **Spaced-repetition layer** on top of the Second Brain — resurface old saved connections periodically so they're not just archived and forgotten.
- **Public/shareable connection cards** — let users share a single generated connection as an image/link (good for organic marketing, e.g. LinkedIn posts, which also happens to fit your own personal brand-building goals).
- **Model upgrade path** — as Gemini/Claude models improve, periodically re-run your few-shot prompt evals from Phase 1 to check connection quality hasn't drifted, and to see if better models let you loosen constraints and get even more original connections.
- **Analytics dashboard** (for you, not users) — which fields/topics get the most saves, which features get used vs ignored — to guide which "someday" feature actually deserves to move up the list.

---

## How to use this doc

1. Save your original vision writeup as `vision.txt` in the project root, before starting Phase 1.
2. Copy the Phase 1 prompt into Antigravity as-is (or lightly adjust the model/API you want to call — Gemini via Antigravity's native integration is the path of least resistance since you're already in that ecosystem).
3. Don't paste Phase 2+ prompts until Phase 1 is deployed and validated with real users.
4. Update the "Future improvements" list whenever you get an idea mid-build — write it there, not into the current phase's scope.
5. When a prompt below references `vision.txt`, that's a deliberate signal to Antigravity to read it for tone/philosophy only — the prompt itself still defines the actual scope of what gets built.
