# Jack&Trades — The Polymath Engine 🧠

> *"A jack of all trades is a master of none, but oftentimes better than a master of one."*

**Jack&Trades** is an AI-powered cross-disciplinary knowledge explorer that helps you find deep, structural parallels between any concept (e.g. *Recursion*, *Supply & Demand*, *Photosynthesis*) and 16+ distinct fields of human thought (Science, Mathematics, Psychology, Philosophy, Economics, Art, Game Theory, Design, Music, Biology, and more).

---

## 🗺️ System Architecture

The following diagram maps out how the front-end router, session handlers, Gemini AI endpoints, and the Supabase database interact to discover, stream, and save cross-disciplinary similarities:

```mermaid
graph TD
    User([User Browser])
    
    subgraph "Next.js App Layer (Client & Server)"
        UI[React Client views / Explorer Pages]
        NextAuth[NextAuth.js Session Handler]
        API_Conn[API Endpoint: /api/connections]
        API_Save[API Endpoint: /api/topics/save]
        API_Topics[API Endpoint: /api/topics]
    end

    subgraph "Third-Party Services"
        Gemini[Google Gemini AI Engine]
        Supabase[(Supabase PostgreSQL Database)]
        Vercel_Analytic[Vercel Event Analytics]
    end

    User -->|Search query, mode toggles, graph navigation| UI
    UI -->|Manages session / credentials authentication| NextAuth
    UI -->|Requests parallel similarity sets| API_Conn
    UI -->|Saves single structural connections| API_Save
    UI -->|Queries all saved topics & badges| API_Topics
    
    API_Conn -->|Streams structured parallel mapping schemas| Gemini
    API_Save -->|Registers user / inserts topic connection mapping| Supabase
    API_Topics -->|Retrieves nodes & link coordinates| Supabase
    NextAuth -->|Interceptors for credentials verification| Supabase
    UI -->|Fires signup, search, and graph page view logs| Vercel_Analytic
```

---

## 🌟 Key Features

1. **AI Parallel Generator**: Enter any topic to reveal mechanism-level similarities. Avoids shallow puns in favor of deep structural optimization, feedback loops, and state spaces.
2. **Serious & Playful Modes**:
   * **Serious**: Displays clean, rigorous mechanism parallels.
   * **Playful**: Highlights witty, screenshot-worthy fun facts with custom emojis and colorful callout boxes.
3. **Credentials Onboarding**: Secure, customized signup and sign-in credentials onboarding.
4. **Interactive D3.js Knowledge Graph**: Beautiful, interactive force-directed network showing saved topics clustering around shared disciplines. Click nodes to open connection sidecards.
5. **Mobile-Responsive Accordion Fallback**: If the viewport is smaller than `768px`, the D3 graph automatically degrades to an expandable accordion list of topics, guaranteeing accessibility on mobile devices.
6. **Ambient Atmospheric Motion**: Subtly drifting low-opacity color blobs and spotlight card hovers created using Framer Motion spring physics.
7. **Keep-Alive Scheduler**: Integrates `/api/auth/session` ping targets compatible with UptimeRobot to keep free-tier databases warm.
8. **Learning Roadmaps**: Allows users to type or select a goal topic and generate a sequenced 5-8 step cross-disciplinary learning path with prior-step dependency tracking and borrowed-intuition highlights.
9. **Idea Intersection Generator**: Synthesizes 3 concrete project or business concepts combining 2+ selected fields with a grid-patterned blueprint showing the intersection mechanics.

---

## 📁 Repository Structure

```text
├── app/                  # Next.js App Router Pages
│   ├── api/              # Route handlers for connection generation, saving, and auth
│   │   ├── roadmaps/     # API routes for saving and generating learning roadmaps
│   │   ├── ideas/        # API routes for saving and generating project ideas
│   ├── knowledge-graph/  # D3 force-directed visual canvas & mobile fallback
│   ├── second-brain/     # Searchable/Filterable dashboard for saved topics/ideas
│   ├── roadmaps/         # Learning Roadmaps timeline explorer UI page
│   ├── ideas/            # Project Idea Intersection Generator page
│   ├── login/ & signup/  # Authentication forms
│   ├── layout.tsx        # HTML wrapper containing Analytics and AmbientBackground
│   └── page.tsx          # Homepage Explorer & client-side search content
├── components/           # Reusable layout and animated components
│   ├── AmbientBackground.tsx# Drifting background color blobs & noise layer
│   ├── SpotlightCard.tsx # Cursor spotlight hover tracker card wrapper
│   ├── MagneticButton.tsx# Spring physics magnetic button wrapper
│   ├── Navbar.tsx        # Persistent responsive header navbar
│   └── ConnectionCard.tsx# The card renderer for Serious/Playful mode parallels
├── lib/                  # Library utilities (NextAuth configuration, Supabase client)
├── supabase/             # SQL schema migrations and initial DDL definitions
├── public/               # Static preview assets, favicon icons, and preview card graphics
├── types/                # TypeScript core type interfaces
└── package.json          # Project script commands and package dependencies
```

---

## 🗄️ Database Schema

Jack&Trades uses **Supabase (PostgreSQL)**. Execute the SQL schema defined in [`supabase/schema.sql`](file:///d:/Projects/Jack&Trade/supabase/schema.sql) in your SQL editor. The schema outlines three tables:

### 1. `users` Table
Holds account logins (both credentials-based and OAuth-based).
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, Default: random_uuid() |
| `email` | VARCHAR | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR | NOT NULL (oauth accounts get unique placeholder keys) |
| `created_at` | TIMESTAMP | DEFAULT: NOW() |

### 2. `topics` Table
Holds search categories created by users.
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, Default: random_uuid() |
| `user_id` | UUID | REFERENCES `users(id)` ON DELETE CASCADE |
| `title` | VARCHAR | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT: NOW() |
| **Unique Constraint** | `(user_id, title)` | Prevents duplicate topics for a single user |

### 3. `connections` Table
Holds individual saved cards/similarities nested under a topic.
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, Default: random_uuid() |
| `topic_id` | UUID | REFERENCES `topics(id)` ON DELETE CASCADE |
| `field` | VARCHAR | NOT NULL |
| `analogy` | TEXT | NOT NULL |
| `explanation` | TEXT | NOT NULL |
| `fun_fact` | TEXT | NOT NULL |
| `emoji` | VARCHAR | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT: NOW() |

### 4. `roadmaps` Table
Holds saved cross-disciplinary learning paths.
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, Default: random_uuid() |
| `user_id` | UUID | REFERENCES `users(id)` ON DELETE CASCADE |
| `goal` | VARCHAR | NOT NULL |
| `steps` | JSONB | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT: NOW() |

### 5. `ideas` Table
Holds saved project/business ideas.
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, Default: random_uuid() |
| `user_id` | UUID | REFERENCES `users(id)` ON DELETE CASCADE |
| `title` | VARCHAR | NOT NULL |
| `description` | TEXT | NOT NULL |
| `why_non_obvious` | TEXT | NOT NULL |
| `combined_topics` | JSONB | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT: NOW() |

---

## 🚀 Getting Started Locally

### 1. Clone & Install
```bash
git clone https://github.com/Saatvik-G/Jack-Trades.git
cd Jack-Trades
npm install
```

### 2. Configure environment variables
Create a `.env.local` file in your root folder:
```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Supabase database keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret

# NextAuth secrets
NEXTAUTH_SECRET=your_jwt_signing_secret
NEXTAUTH_URL=http://localhost:3000

# (NextAuth automatically handles secure credentials tokens)
```

### 3. Run development build
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License

MIT License © 2026 Jack&Trades
