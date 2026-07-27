# Football League App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app for a 28-player football league with IPL-style snake draft, round-robin group stage, and knockout finals.

**Architecture:** Next.js 14 App Router for all pages and API routes; Supabase for PostgreSQL database, auth (admin + captain logins), and Realtime for live draft updates; Tailwind CSS for styling.

**Tech Stack:** Next.js 14, TypeScript, Supabase JS v2, Tailwind CSS 3, Jest + React Testing Library, Vercel (deployment)

## Global Constraints

- Node.js ≥ 18
- Next.js `"^14"` App Router (not Pages Router)
- `@supabase/supabase-js` v2, `@supabase/ssr` for server-side auth
- TypeScript strict mode
- All DB access via `lib/db/*.ts` — never call Supabase directly from page components
- All types in `types/index.ts`
- 4 teams, snake draft order, round-robin group + knockout semis/final/3rd-place
- Project root: `/home/user/football-league/`

---

## File Map

```
football-league/
├── app/
│   ├── layout.tsx                        # Root layout, nav bar
│   ├── page.tsx                          # Home: overview, upcoming match
│   ├── teams/page.tsx                    # Public team rosters
│   ├── fixtures/page.tsx                 # Public schedule + scores
│   ├── standings/page.tsx                # Public points table
│   ├── draft/page.tsx                    # Live draft room (auth required)
│   ├── admin/
│   │   ├── layout.tsx                    # Admin layout with sidebar
│   │   ├── page.tsx                      # Admin dashboard redirect
│   │   ├── players/page.tsx              # Player management
│   │   ├── teams/page.tsx                # Team setup
│   │   ├── draft/page.tsx                # Draft control panel
│   │   └── results/page.tsx              # Enter match results
│   └── auth/login/page.tsx               # Login page
├── components/
│   ├── Nav.tsx                           # Top navigation bar
│   ├── PlayerCard.tsx                    # Player card (draft + roster)
│   ├── TeamBadge.tsx                     # Team color + name chip
│   ├── StandingsTable.tsx                # Points table component
│   └── FixtureList.tsx                   # Match list component
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client (singleton)
│   │   └── server.ts                     # Server Supabase client (cookies)
│   ├── db/
│   │   ├── players.ts                    # Player CRUD + draft queries
│   │   ├── teams.ts                      # Team CRUD queries
│   │   ├── draft.ts                      # Draft session read/write
│   │   └── matches.ts                    # Match CRUD + fixture gen trigger
│   └── utils/
│       ├── snake-draft.ts                # generateSnakeOrder()
│       ├── round-robin.ts                # generateRoundRobin()
│       └── standings.ts                  # computeStandings()
├── supabase/
│   ├── migrations/001_initial_schema.sql # Full DB schema
│   └── seed.sql                          # 28 players seed data
├── middleware.ts                         # Route protection
├── types/index.ts                        # All shared TS types
└── __tests__/
    ├── snake-draft.test.ts
    ├── round-robin.test.ts
    └── standings.test.ts
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `/home/user/football-league/` (Next.js project)
- Create: `.env.local`
- Create: `types/index.ts`

**Interfaces:**
- Produces: Next.js project with Tailwind, Supabase deps installed

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /home/user
npx create-next-app@latest football-league \
  --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd football-league
```

- [ ] **Step 2: Install Supabase dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Create `.env.local`**

```bash
# .env.local — fill in from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these from: https://supabase.com/dashboard → your project → Settings → API

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```
Expected: server running at http://localhost:3000

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Supabase deps"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `types/index.ts`

**Interfaces:**
- Produces: `Player`, `Team`, `DraftSession`, `Match`, `Standing` types used by all subsequent tasks

- [ ] **Step 1: Write `types/index.ts`**

```typescript
// types/index.ts

export type PlayerStatus = 'confirmed' | 'tentative'
export type DraftSessionStatus = 'setup' | 'active' | 'paused' | 'completed'
export type MatchStage = 'group' | 'semi' | 'third_place' | 'final'
export type MatchStatus = 'scheduled' | 'completed'

export interface Player {
  id: string
  name: string
  base_price: number
  status: PlayerStatus
  team_id: string | null
  sold_price: number | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  color: string
  captain_id: string | null
  budget_remaining: number
  created_at: string
}

export interface DraftSession {
  id: string
  status: DraftSessionStatus
  snake_order: string[]   // ordered array of team_ids
  current_pick_index: number
  starting_budget: number
  created_at: string
}

export interface Match {
  id: string
  team1_id: string
  team2_id: string
  team1_score: number | null
  team2_score: number | null
  stage: MatchStage
  round: number | null
  scheduled_at: string | null
  status: MatchStatus
  created_at: string
}

export interface Standing {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface CompletedMatch {
  team1Id: string
  team2Id: string
  team1Score: number
  team2Score: number
  status: MatchStatus
}

export interface RoundFixture {
  team1Id: string
  team2Id: string
  round: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Snake Draft Utility (TDD)

**Files:**
- Create: `lib/utils/snake-draft.ts`
- Create: `__tests__/snake-draft.test.ts`

**Interfaces:**
- Produces: `generateSnakeOrder(teamIds: string[], totalPicks: number): string[]`

- [ ] **Step 1: Install Jest**

```bash
npm install -D jest @types/jest ts-jest jest-environment-node
```

Create `jest.config.ts`:

```typescript
// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default config
```

Add to `package.json` scripts:
```json
"test": "jest"
```

- [ ] **Step 2: Write failing test**

```typescript
// __tests__/snake-draft.test.ts
import { generateSnakeOrder } from '@/lib/utils/snake-draft'

describe('generateSnakeOrder', () => {
  const teams = ['T1', 'T2', 'T3', 'T4']

  it('produces round 1 in forward order', () => {
    const order = generateSnakeOrder(teams, 4)
    expect(order).toEqual(['T1', 'T2', 'T3', 'T4'])
  })

  it('produces round 2 in reverse order (snake)', () => {
    const order = generateSnakeOrder(teams, 8)
    expect(order).toEqual(['T1', 'T2', 'T3', 'T4', 'T4', 'T3', 'T2', 'T1'])
  })

  it('produces round 3 in forward order again', () => {
    const order = generateSnakeOrder(teams, 12)
    expect(order.slice(8)).toEqual(['T1', 'T2', 'T3', 'T4'])
  })

  it('handles totalPicks not divisible by team count', () => {
    const order = generateSnakeOrder(teams, 6)
    expect(order).toEqual(['T1', 'T2', 'T3', 'T4', 'T4', 'T3'])
    expect(order).toHaveLength(6)
  })

  it('each team gets equal picks when totalPicks is divisible', () => {
    const order = generateSnakeOrder(teams, 24)
    const counts = teams.map(t => order.filter(x => x === t).length)
    expect(counts).toEqual([6, 6, 6, 6])
  })
})
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npx jest __tests__/snake-draft.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/utils/snake-draft'"

- [ ] **Step 4: Implement `lib/utils/snake-draft.ts`**

```typescript
// lib/utils/snake-draft.ts

export function generateSnakeOrder(teamIds: string[], totalPicks: number): string[] {
  const order: string[] = []
  let round = 0
  while (order.length < totalPicks) {
    const roundOrder = round % 2 === 0 ? [...teamIds] : [...teamIds].reverse()
    for (const id of roundOrder) {
      if (order.length >= totalPicks) break
      order.push(id)
    }
    round++
  }
  return order
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npx jest __tests__/snake-draft.test.ts
```
Expected: PASS — all 5 tests green

- [ ] **Step 6: Commit**

```bash
git add lib/utils/snake-draft.ts __tests__/snake-draft.test.ts jest.config.ts
git commit -m "feat: add snake draft order generator with tests"
```

---

### Task 4: Round-Robin Fixture Generator (TDD)

**Files:**
- Create: `lib/utils/round-robin.ts`
- Create: `__tests__/round-robin.test.ts`

**Interfaces:**
- Produces: `generateRoundRobin(teamIds: string[]): RoundFixture[]`
- Consumes: `RoundFixture` from `types/index.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/round-robin.test.ts
import { generateRoundRobin } from '@/lib/utils/round-robin'

describe('generateRoundRobin', () => {
  const teams = ['T1', 'T2', 'T3', 'T4']

  it('generates correct number of matches for 4 teams', () => {
    // C(4,2) = 6 matches
    const fixtures = generateRoundRobin(teams)
    expect(fixtures).toHaveLength(6)
  })

  it('each pair plays exactly once', () => {
    const fixtures = generateRoundRobin(teams)
    const pairs = fixtures.map(f => [f.team1Id, f.team2Id].sort().join('|')).sort()
    const expected = [
      'T1|T2', 'T1|T3', 'T1|T4', 'T2|T3', 'T2|T4', 'T3|T4'
    ]
    expect(pairs).toEqual(expected)
  })

  it('no team plays itself', () => {
    const fixtures = generateRoundRobin(teams)
    fixtures.forEach(f => expect(f.team1Id).not.toBe(f.team2Id))
  })

  it('assigns round numbers starting from 1', () => {
    const fixtures = generateRoundRobin(teams)
    const rounds = [...new Set(fixtures.map(f => f.round))].sort()
    expect(rounds[0]).toBe(1)
  })

  it('works for 5 teams (10 matches)', () => {
    const fiveTeams = ['T1', 'T2', 'T3', 'T4', 'T5']
    const fixtures = generateRoundRobin(fiveTeams)
    expect(fixtures).toHaveLength(10)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest __tests__/round-robin.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/utils/round-robin'"

- [ ] **Step 3: Implement `lib/utils/round-robin.ts`**

```typescript
// lib/utils/round-robin.ts
import type { RoundFixture } from '@/types'

export function generateRoundRobin(teamIds: string[]): RoundFixture[] {
  const teams = [...teamIds]
  // Add dummy team for odd counts (shouldn't happen but guard anyway)
  if (teams.length % 2 !== 0) teams.push('__bye__')

  const rounds = teams.length - 1
  const matchesPerRound = teams.length / 2
  const fixtures: RoundFixture[] = []

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const team1 = teams[match]
      const team2 = teams[teams.length - 1 - match]
      if (team1 !== '__bye__' && team2 !== '__bye__') {
        fixtures.push({ team1Id: team1, team2Id: team2, round: round + 1 })
      }
    }
    // Rotate all teams except the first (standard round-robin rotation)
    const last = teams.pop()!
    teams.splice(1, 0, last)
  }

  return fixtures
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx jest __tests__/round-robin.test.ts
```
Expected: PASS — all 5 tests green

- [ ] **Step 5: Commit**

```bash
git add lib/utils/round-robin.ts __tests__/round-robin.test.ts
git commit -m "feat: add round-robin fixture generator with tests"
```

---

### Task 5: Standings Computation (TDD)

**Files:**
- Create: `lib/utils/standings.ts`
- Create: `__tests__/standings.test.ts`

**Interfaces:**
- Produces: `computeStandings(teamIds: string[], matches: CompletedMatch[]): Standing[]`
- Consumes: `CompletedMatch`, `Standing` from `types/index.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/standings.test.ts
import { computeStandings } from '@/lib/utils/standings'
import type { CompletedMatch } from '@/types'

const teams = ['T1', 'T2', 'T3', 'T4']

describe('computeStandings', () => {
  it('starts all teams at zero with no matches', () => {
    const standings = computeStandings(teams, [])
    expect(standings).toHaveLength(4)
    standings.forEach(s => {
      expect(s.points).toBe(0)
      expect(s.played).toBe(0)
    })
  })

  it('awards 3 points to winner and 0 to loser', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 2, team2Score: 1, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    const t1 = standings.find(s => s.teamId === 'T1')!
    const t2 = standings.find(s => s.teamId === 'T2')!
    expect(t1.points).toBe(3)
    expect(t1.won).toBe(1)
    expect(t2.points).toBe(0)
    expect(t2.lost).toBe(1)
  })

  it('awards 1 point each for a draw', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 1, team2Score: 1, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    const t1 = standings.find(s => s.teamId === 'T1')!
    const t2 = standings.find(s => s.teamId === 'T2')!
    expect(t1.points).toBe(1)
    expect(t1.drawn).toBe(1)
    expect(t2.points).toBe(1)
  })

  it('sorts by points descending, then goal difference', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 3, team2Score: 0, status: 'completed' },
      { team1Id: 'T3', team2Id: 'T4', team1Score: 1, team2Score: 0, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    expect(standings[0].teamId).toBe('T1') // 3pts, GD+3
    expect(standings[1].teamId).toBe('T3') // 3pts, GD+1
  })

  it('correctly computes goal difference', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 4, team2Score: 1, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    const t1 = standings.find(s => s.teamId === 'T1')!
    expect(t1.goalsFor).toBe(4)
    expect(t1.goalsAgainst).toBe(1)
    expect(t1.goalDifference).toBe(3)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest __tests__/standings.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/utils/standings'"

- [ ] **Step 3: Implement `lib/utils/standings.ts`**

```typescript
// lib/utils/standings.ts
import type { Standing, CompletedMatch } from '@/types'

export function computeStandings(teamIds: string[], matches: CompletedMatch[]): Standing[] {
  const map = new Map<string, Standing>()

  for (const teamId of teamIds) {
    map.set(teamId, {
      teamId, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    })
  }

  for (const match of matches) {
    if (match.status !== 'completed') continue
    const s1 = map.get(match.team1Id)!
    const s2 = map.get(match.team2Id)!

    s1.played++; s2.played++
    s1.goalsFor += match.team1Score; s1.goalsAgainst += match.team2Score
    s2.goalsFor += match.team2Score; s2.goalsAgainst += match.team1Score

    if (match.team1Score > match.team2Score) {
      s1.won++; s1.points += 3; s2.lost++
    } else if (match.team2Score > match.team1Score) {
      s2.won++; s2.points += 3; s1.lost++
    } else {
      s1.drawn++; s1.points++; s2.drawn++; s2.points++
    }
  }

  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })
}
```

- [ ] **Step 4: Run all tests**

```bash
npx jest
```
Expected: PASS — all 15 tests across 3 files green

- [ ] **Step 5: Commit**

```bash
git add lib/utils/standings.ts __tests__/standings.test.ts
git commit -m "feat: add standings computation with tests"
```

---

### Task 6: Database Schema + Seed Data

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Produces: all DB tables — `players`, `teams`, `draft_session`, `matches`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Players table (no team_id FK yet — added below to break circular ref)
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_price integer not null default 50,
  status text not null default 'confirmed' check (status in ('confirmed', 'tentative')),
  team_id uuid,
  sold_price integer,
  created_at timestamptz default now()
);

-- Teams table
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#3B82F6',
  captain_id uuid references players(id),
  budget_remaining integer not null default 1000,
  created_at timestamptz default now()
);

-- Add FK from players → teams now that teams exists
alter table players
  add constraint players_team_id_fkey foreign key (team_id) references teams(id);

-- Draft session (singleton row)
create table draft_session (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'setup' check (status in ('setup', 'active', 'paused', 'completed')),
  snake_order jsonb not null default '[]',
  current_pick_index integer not null default 0,
  starting_budget integer not null default 1000,
  created_at timestamptz default now()
);

-- Matches
create table matches (
  id uuid primary key default gen_random_uuid(),
  team1_id uuid not null references teams(id),
  team2_id uuid not null references teams(id),
  team1_score integer,
  team2_score integer,
  stage text not null default 'group' check (stage in ('group', 'semi', 'third_place', 'final')),
  round integer,
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),
  created_at timestamptz default now()
);

-- Indexes for common queries
create index on players(team_id);
create index on matches(stage);
create index on matches(status);

-- Row Level Security
alter table players enable row level security;
alter table teams enable row level security;
alter table draft_session enable row level security;
alter table matches enable row level security;

-- Public read access for all tables
create policy "Public read players" on players for select using (true);
create policy "Public read teams" on teams for select using (true);
create policy "Public read draft_session" on draft_session for select using (true);
create policy "Public read matches" on matches for select using (true);

-- Admin write access (service role bypasses RLS, or use auth.jwt() metadata check)
-- For admin writes, we use the service role key from server-side API routes
-- Captains can update draft_session.current_pick_index via API route (not direct DB)
```

- [ ] **Step 2: Write seed data**

Create `supabase/seed.sql`:

```sql
-- Seed 28 players with base prices (admin will adjust prices in UI)
-- Tentative players marked with status 'tentative'
insert into players (name, base_price, status) values
  ('Ankush', 100, 'confirmed'),
  ('Arpit', 100, 'confirmed'),
  ('Sanjeev Sir', 150, 'confirmed'),
  ('Zizou', 100, 'confirmed'),
  ('Mayank Chaturvedi', 100, 'confirmed'),
  ('Yavart', 100, 'confirmed'),
  ('Pritam', 100, 'confirmed'),
  ('Jayant', 100, 'confirmed'),
  ('Mukul', 100, 'confirmed'),
  ('Shailendra', 100, 'confirmed'),
  ('Akshaj', 100, 'confirmed'),
  ('Chiru', 100, 'confirmed'),
  ('Bishu', 100, 'confirmed'),
  ('Rohit', 100, 'confirmed'),
  ('Prajjwal', 100, 'confirmed'),
  ('Anush', 100, 'confirmed'),
  ('Rakshit', 100, 'confirmed'),
  ('Harsh', 100, 'confirmed'),
  ('Ankur', 100, 'tentative'),
  ('Puneet', 100, 'confirmed'),
  ('Penny', 100, 'confirmed'),
  ('Rohan', 100, 'confirmed'),
  ('Yojit', 100, 'confirmed'),
  ('Vansh', 100, 'tentative'),
  ('Archit', 100, 'confirmed'),
  ('SK', 100, 'confirmed'),
  ('Gaurav', 100, 'tentative'),
  ('Eesh', 100, 'tentative');
```

- [ ] **Step 3: Apply schema in Supabase**

Go to your Supabase project dashboard → SQL Editor → paste and run `001_initial_schema.sql`, then run `seed.sql`.

Verify in Table Editor: `players` table has 28 rows.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema and player seed data"
```

---

### Task 7: Supabase Client Setup + Auth Middleware

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

**Interfaces:**
- Produces:
  - `createBrowserClient()` → Supabase browser client
  - `createServerClient()` → Supabase server client (uses cookies)
  - `middleware.ts` → protects `/admin/*` and `/draft`

- [ ] **Step 1: Create browser client**

```typescript
// lib/supabase/client.ts
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 2: Create server client**

```typescript
// lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if (!user && (path.startsWith('/admin') || path.startsWith('/draft'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect non-admins away from /admin
  if (user && path.startsWith('/admin')) {
    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/draft'],
}
```

- [ ] **Step 4: Create admin user in Supabase**

Go to Supabase dashboard → Authentication → Users → "Add User":
- Email: your admin email (e.g., `admin@league.local`)
- Password: set a strong password
- In "User Metadata" JSON: `{ "role": "admin" }`

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/ middleware.ts
git commit -m "feat: add Supabase client setup and auth middleware"
```

---

### Task 8: Login Page

**Files:**
- Create: `app/auth/login/page.tsx`

**Interfaces:**
- Consumes: `createBrowserClient()` from `lib/supabase/client.ts`
- Produces: login form that authenticates via Supabase and redirects to `/draft` or `/admin`

- [ ] **Step 1: Create login page**

```tsx
// app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    router.push(role === 'admin' ? '/admin/players' : '/draft')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">League Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Test login manually**

```bash
npm run dev
```
Open http://localhost:3000/auth/login → log in with the admin credentials created in Task 7.
Expected: redirects to `/admin/players`

- [ ] **Step 3: Commit**

```bash
git add app/auth/login/page.tsx
git commit -m "feat: add login page with Supabase auth"
```

---

### Task 9: Database Query Layer

**Files:**
- Create: `lib/db/players.ts`
- Create: `lib/db/teams.ts`
- Create: `lib/db/draft.ts`
- Create: `lib/db/matches.ts`

**Interfaces:**
- Consumes: `createServerClient()` from `lib/supabase/server.ts`; types from `types/index.ts`
- Produces:
  - `getPlayers(): Promise<Player[]>`
  - `getConfirmedPlayers(): Promise<Player[]>`
  - `updatePlayer(id, data): Promise<void>`
  - `getTeams(): Promise<Team[]>`
  - `createTeam(data): Promise<Team>`
  - `updateTeam(id, data): Promise<void>`
  - `getDraftSession(): Promise<DraftSession | null>`
  - `upsertDraftSession(data): Promise<DraftSession>`
  - `getMatches(stage?): Promise<Match[]>`
  - `createMatches(fixtures): Promise<void>`
  - `updateMatchResult(id, score1, score2): Promise<void>`

- [ ] **Step 1: Write `lib/db/players.ts`**

```typescript
// lib/db/players.ts
import { createServerClient } from '@/lib/supabase/server'
import type { Player } from '@/types'

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getConfirmedPlayers(): Promise<Player[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('status', 'confirmed')
    .order('base_price', { ascending: false })
  if (error) throw error
  return data
}

export async function getAvailablePlayers(): Promise<Player[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('status', 'confirmed')
    .is('team_id', null)
    .order('base_price', { ascending: false })
  if (error) throw error
  return data
}

export async function updatePlayer(id: string, data: Partial<Player>): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase.from('players').update(data).eq('id', id)
  if (error) throw error
}

export async function draftPlayer(playerId: string, teamId: string, soldPrice: number): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('players')
    .update({ team_id: teamId, sold_price: soldPrice })
    .eq('id', playerId)
  if (error) throw error
}
```

- [ ] **Step 2: Write `lib/db/teams.ts`**

```typescript
// lib/db/teams.ts
import { createServerClient } from '@/lib/supabase/server'
import type { Team } from '@/types'

export async function getTeams(): Promise<Team[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createTeam(data: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  const supabase = await createServerClient()
  const { data: team, error } = await supabase
    .from('teams')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return team
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase.from('teams').update(data).eq('id', id)
  if (error) throw error
}

export async function deductBudget(teamId: string, amount: number): Promise<void> {
  const supabase = await createServerClient()
  const { data: team, error: fetchError } = await supabase
    .from('teams')
    .select('budget_remaining')
    .eq('id', teamId)
    .single()
  if (fetchError) throw fetchError
  const { error } = await supabase
    .from('teams')
    .update({ budget_remaining: team.budget_remaining - amount })
    .eq('id', teamId)
  if (error) throw error
}
```

- [ ] **Step 3: Write `lib/db/draft.ts`**

```typescript
// lib/db/draft.ts
import { createServerClient } from '@/lib/supabase/server'
import type { DraftSession } from '@/types'

export async function getDraftSession(): Promise<DraftSession | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('draft_session')
    .select('*')
    .single()
  if (error?.code === 'PGRST116') return null // no rows
  if (error) throw error
  return data
}

export async function upsertDraftSession(data: Partial<DraftSession>): Promise<DraftSession> {
  const supabase = await createServerClient()
  const existing = await getDraftSession()
  if (existing) {
    const { data: updated, error } = await supabase
      .from('draft_session')
      .update(data)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return updated
  }
  const { data: created, error } = await supabase
    .from('draft_session')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return created
}

export async function advancePick(): Promise<void> {
  const supabase = await createServerClient()
  const session = await getDraftSession()
  if (!session) throw new Error('No draft session')
  const { error } = await supabase
    .from('draft_session')
    .update({ current_pick_index: session.current_pick_index + 1 })
    .eq('id', session.id)
  if (error) throw error
}
```

- [ ] **Step 4: Write `lib/db/matches.ts`**

```typescript
// lib/db/matches.ts
import { createServerClient } from '@/lib/supabase/server'
import type { Match, MatchStage, RoundFixture } from '@/types'

export async function getMatches(stage?: MatchStage): Promise<Match[]> {
  const supabase = await createServerClient()
  let query = supabase.from('matches').select('*').order('round').order('created_at')
  if (stage) query = query.eq('stage', stage)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createGroupMatches(fixtures: RoundFixture[]): Promise<void> {
  const supabase = await createServerClient()
  const rows = fixtures.map(f => ({
    team1_id: f.team1Id,
    team2_id: f.team2Id,
    round: f.round,
    stage: 'group' as MatchStage,
  }))
  const { error } = await supabase.from('matches').insert(rows)
  if (error) throw error
}

export async function updateMatchResult(
  id: string,
  team1Score: number,
  team2Score: number
): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('matches')
    .update({ team1_score: team1Score, team2_score: team2Score, status: 'completed' })
    .eq('id', id)
  if (error) throw error
}

export async function createKnockoutMatches(
  standings: { teamId: string }[]
): Promise<void> {
  // After group stage: 1st vs 4th (semi1), 2nd vs 3rd (semi2)
  const supabase = await createServerClient()
  const semis = [
    { team1_id: standings[0].teamId, team2_id: standings[3].teamId, stage: 'semi' as MatchStage, round: 1 },
    { team1_id: standings[1].teamId, team2_id: standings[2].teamId, stage: 'semi' as MatchStage, round: 2 },
  ]
  const { error } = await supabase.from('matches').insert(semis)
  if (error) throw error
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/
git commit -m "feat: add database query layer for players, teams, draft, matches"
```

---

### Task 10: Root Layout + Nav

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Nav.tsx`

**Interfaces:**
- Consumes: nothing external
- Produces: root layout with dark theme + nav bar for public pages

- [ ] **Step 1: Create Nav component**

```tsx
// components/Nav.tsx
import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-green-400 font-bold text-lg tracking-tight">
          ⚽ League 2026
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/teams" className="text-gray-300 hover:text-white transition">Teams</Link>
          <Link href="/fixtures" className="text-gray-300 hover:text-white transition">Fixtures</Link>
          <Link href="/standings" className="text-gray-300 hover:text-white transition">Standings</Link>
          <Link href="/draft" className="text-green-400 hover:text-green-300 transition">Draft</Link>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Update root layout**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Football League 2026',
  description: 'IPL-style football league manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify layout renders**

```bash
npm run dev
```
Open http://localhost:3000 — should see dark layout with nav bar.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/Nav.tsx app/globals.css
git commit -m "feat: add root layout and nav bar"
```

---

### Task 11: Admin – Player Management

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/players/page.tsx`
- Create: `app/api/admin/players/route.ts`

**Interfaces:**
- Consumes: `getPlayers()`, `updatePlayer()` from `lib/db/players.ts`
- Produces: `/admin/players` — list of all players, editable base price, toggle confirmed/tentative

- [ ] **Step 1: Create admin layout**

```tsx
// app/admin/layout.tsx
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-800 pb-4">
        <Link href="/admin/players" className="text-gray-300 hover:text-white">Players</Link>
        <Link href="/admin/teams" className="text-gray-300 hover:text-white">Teams</Link>
        <Link href="/admin/draft" className="text-gray-300 hover:text-white">Draft</Link>
        <Link href="/admin/results" className="text-gray-300 hover:text-white">Results</Link>
      </div>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create admin index redirect**

```tsx
// app/admin/page.tsx
import { redirect } from 'next/navigation'
export default function AdminPage() {
  redirect('/admin/players')
}
```

- [ ] **Step 3: Create player management API route**

```typescript
// app/api/admin/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updatePlayer } from '@/lib/db/players'

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  await updatePlayer(id, data)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create player management page**

```tsx
// app/admin/players/page.tsx
import { getPlayers } from '@/lib/db/players'
import PlayerAdminTable from './PlayerAdminTable'

export const dynamic = 'force-dynamic'

export default async function AdminPlayersPage() {
  const players = await getPlayers()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Players ({players.length})</h1>
      <p className="text-gray-400 text-sm mb-6">
        Set base prices and confirm tentative players before the draft.
      </p>
      <PlayerAdminTable players={players} />
    </div>
  )
}
```

- [ ] **Step 5: Create interactive player table**

Create `app/admin/players/PlayerAdminTable.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Player } from '@/types'

export default function PlayerAdminTable({ players }: { players: Player[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)

  async function update(id: string, data: Partial<Player>) {
    setSaving(id)
    await fetch('/api/admin/players', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    setSaving(null)
    router.refresh()
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-400 border-b border-gray-800">
          <th className="pb-2 pr-4">Name</th>
          <th className="pb-2 pr-4">Base Price (₹)</th>
          <th className="pb-2 pr-4">Status</th>
          <th className="pb-2">Team</th>
        </tr>
      </thead>
      <tbody>
        {players.map(p => (
          <tr key={p.id} className="border-b border-gray-900 hover:bg-gray-900">
            <td className="py-2 pr-4 font-medium">{p.name}</td>
            <td className="py-2 pr-4">
              <input
                type="number"
                defaultValue={p.base_price}
                min={0}
                step={10}
                onBlur={e => update(p.id, { base_price: parseInt(e.target.value) })}
                className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
              />
            </td>
            <td className="py-2 pr-4">
              <button
                onClick={() => update(p.id, {
                  status: p.status === 'confirmed' ? 'tentative' : 'confirmed'
                })}
                disabled={saving === p.id}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  p.status === 'confirmed'
                    ? 'bg-green-900 text-green-300'
                    : 'bg-yellow-900 text-yellow-300'
                }`}
              >
                {p.status}
              </button>
            </td>
            <td className="py-2 text-gray-400">
              {p.team_id ? '✓ drafted' : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 6: Test player management manually**

Visit http://localhost:3000/admin/players (log in as admin).
- Verify 28 players listed
- Change a base price → blur → should save (check Supabase Table Editor)
- Toggle a tentative player to confirmed

- [ ] **Step 7: Commit**

```bash
git add app/admin/ app/api/admin/players/
git commit -m "feat: add admin player management page"
```

---

### Task 12: Admin – Team Setup

**Files:**
- Create: `app/admin/teams/page.tsx`
- Create: `app/api/admin/teams/route.ts`

**Interfaces:**
- Consumes: `getTeams()`, `createTeam()`, `updateTeam()` from `lib/db/teams.ts`; `getConfirmedPlayers()` from `lib/db/players.ts`
- Produces: `/admin/teams` — create 4 teams, assign captain from confirmed players, set purse

- [ ] **Step 1: Create teams API route**

```typescript
// app/api/admin/teams/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createTeam, updateTeam } from '@/lib/db/teams'

export async function POST(request: NextRequest) {
  const data = await request.json()
  const team = await createTeam(data)
  return NextResponse.json(team)
}

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  await updateTeam(id, data)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create teams page**

```tsx
// app/admin/teams/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getConfirmedPlayers } from '@/lib/db/players'
import TeamSetupPanel from './TeamSetupPanel'

export const dynamic = 'force-dynamic'

export default async function AdminTeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getConfirmedPlayers()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Teams</h1>
      <TeamSetupPanel teams={teams} players={players} />
    </div>
  )
}
```

- [ ] **Step 3: Create TeamSetupPanel component**

Create `app/admin/teams/TeamSetupPanel.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Team, Player } from '@/types'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7']

export default function TeamSetupPanel({
  teams,
  players,
}: {
  teams: Team[]
  players: Player[]
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[teams.length % COLORS.length])
  const [captainId, setCaptainId] = useState('')
  const [budget, setBudget] = useState(1000)
  const [creating, setCreating] = useState(false)

  async function createTeam() {
    if (!name || !captainId) return
    setCreating(true)
    await fetch('/api/admin/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, captain_id: captainId, budget_remaining: budget }),
    })
    setName('')
    setCaptainId('')
    setCreating(false)
    router.refresh()
  }

  const assignedCaptainIds = new Set(teams.map(t => t.captain_id).filter(Boolean))
  const availableCaptains = players.filter(p => !assignedCaptainIds.has(p.id) && !p.team_id)

  return (
    <div className="space-y-6">
      {/* Existing teams */}
      <div className="space-y-3">
        {teams.map(team => (
          <div key={team.id} className="flex items-center gap-3 bg-gray-900 rounded-lg p-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
            <span className="font-semibold">{team.name}</span>
            <span className="text-gray-400 text-sm">
              Captain: {players.find(p => p.id === team.captain_id)?.name ?? '—'}
            </span>
            <span className="ml-auto text-green-400 text-sm">₹{team.budget_remaining} left</span>
          </div>
        ))}
      </div>

      {/* Create team form */}
      {teams.length < 5 && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">New Team</h2>
          <input
            placeholder="Team name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <select
            value={captainId}
            onChange={e => setCaptainId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">Select captain…</option>
            {availableCaptains.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">Starting purse ₹</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(parseInt(e.target.value))}
              step={100}
              className="w-24 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
            />
          </div>
          <button
            onClick={createTeam}
            disabled={creating || !name || !captainId}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
          >
            {creating ? 'Creating…' : 'Create Team'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Test team setup**

Visit http://localhost:3000/admin/teams → create 4 teams, assign captains.

- [ ] **Step 5: Commit**

```bash
git add app/admin/teams/ app/api/admin/teams/
git commit -m "feat: add admin team setup with captain assignment"
```

---

### Task 13: Admin – Draft Control + Captain Auth

**Files:**
- Create: `app/admin/draft/page.tsx`
- Create: `app/api/admin/draft/route.ts`
- Create: `app/api/admin/captain/route.ts`

**Interfaces:**
- Consumes: `getDraftSession()`, `upsertDraftSession()` from `lib/db/draft.ts`; `getTeams()` from `lib/db/teams.ts`; `generateSnakeOrder()` from `lib/utils/snake-draft.ts`
- Produces: admin can configure starting budget, create captain logins, start draft

- [ ] **Step 1: Create draft API route**

```typescript
// app/api/admin/draft/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { upsertDraftSession } from '@/lib/db/draft'
import { getTeams } from '@/lib/db/teams'
import { generateSnakeOrder } from '@/lib/utils/snake-draft'
import { getConfirmedPlayers } from '@/lib/db/players'

export async function POST(request: NextRequest) {
  const { action, starting_budget } = await request.json()

  if (action === 'start') {
    const [teams, players] = await Promise.all([getTeams(), getConfirmedPlayers()])
    const teamIds = teams.map(t => t.id)
    const snakeOrder = generateSnakeOrder(teamIds, players.length)
    const session = await upsertDraftSession({
      status: 'active',
      snake_order: snakeOrder,
      current_pick_index: 0,
      starting_budget: starting_budget ?? 1000,
    })
    return NextResponse.json(session)
  }

  if (action === 'pause') {
    const session = await upsertDraftSession({ status: 'paused' })
    return NextResponse.json(session)
  }

  if (action === 'resume') {
    const session = await upsertDraftSession({ status: 'active' })
    return NextResponse.json(session)
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
```

- [ ] **Step 2: Create captain account API route**

```typescript
// app/api/admin/captain/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  const { email, password, teamId } = await request.json()
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'captain', team_id: teamId },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user: data.user })
}
```

- [ ] **Step 3: Create draft control page**

```tsx
// app/admin/draft/page.tsx
import { getDraftSession } from '@/lib/db/draft'
import { getTeams } from '@/lib/db/teams'
import DraftControl from './DraftControl'

export const dynamic = 'force-dynamic'

export default async function AdminDraftPage() {
  const [session, teams] = await Promise.all([getDraftSession(), getTeams()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Draft Control</h1>
      <DraftControl session={session} teams={teams} />
    </div>
  )
}
```

Create `app/admin/draft/DraftControl.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DraftSession, Team } from '@/types'

export default function DraftControl({
  session,
  teams,
}: {
  session: DraftSession | null
  teams: Team[]
}) {
  const router = useRouter()
  const [budget, setBudget] = useState(1000)
  const [captainEmail, setCaptainEmail] = useState('')
  const [captainPass, setCaptainPass] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function draftAction(action: string) {
    setLoading(true)
    await fetch('/api/admin/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, starting_budget: budget }),
    })
    setLoading(false)
    router.refresh()
  }

  async function createCaptain() {
    setLoading(true)
    const res = await fetch('/api/admin/captain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: captainEmail, password: captainPass, teamId: selectedTeam }),
    })
    const json = await res.json()
    setMsg(json.error ?? `Captain account created: ${captainEmail}`)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Captain account creation */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-400 text-sm uppercase">Create Captain Login</h2>
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        >
          <option value="">Select team…</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          placeholder="Captain email"
          value={captainEmail}
          onChange={e => setCaptainEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={captainPass}
          onChange={e => setCaptainPass(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        />
        <button
          onClick={createCaptain}
          disabled={loading || !captainEmail || !captainPass || !selectedTeam}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          Create Account
        </button>
        {msg && <p className="text-sm text-green-400">{msg}</p>}
      </div>

      {/* Draft start/pause/resume */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-400 text-sm uppercase">Draft Session</h2>
        <p className="text-sm">
          Status: <span className="text-green-400 font-mono">{session?.status ?? 'not started'}</span>
          {session && ` | Pick ${session.current_pick_index + 1} of ${session.snake_order.length}`}
        </p>
        {!session || session.status === 'setup' ? (
          <>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Starting purse ₹</label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(parseInt(e.target.value))}
                step={100}
                className="w-24 bg-gray-800 border border-gray-700 rounded px-3 py-2"
              />
            </div>
            <button
              onClick={() => draftAction('start')}
              disabled={loading || teams.length < 2}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              Start Draft
            </button>
          </>
        ) : session.status === 'active' ? (
          <button
            onClick={() => draftAction('pause')}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            Pause Draft
          </button>
        ) : session.status === 'paused' ? (
          <button
            onClick={() => draftAction('resume')}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            Resume Draft
          </button>
        ) : (
          <p className="text-green-400">Draft complete!</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/draft/ app/api/admin/draft/ app/api/admin/captain/
git commit -m "feat: add draft control panel and captain account creation"
```

---

### Task 14: Live Draft Room

**Files:**
- Create: `app/draft/page.tsx`
- Create: `app/api/draft/pick/route.ts`

**Interfaces:**
- Consumes: `getDraftSession()` from `lib/db/draft.ts`; `getAvailablePlayers()`, `draftPlayer()` from `lib/db/players.ts`; `deductBudget()` from `lib/db/teams.ts`; `advancePick()` from `lib/db/draft.ts`; `createBrowserClient()` from `lib/supabase/client.ts`
- Produces: real-time draft room where active captain picks a player; all screens update via Supabase Realtime

- [ ] **Step 1: Create pick API route**

```typescript
// app/api/draft/pick/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getDraftSession, advancePick } from '@/lib/db/draft'
import { draftPlayer } from '@/lib/db/players'
import { deductBudget, getTeams } from '@/lib/db/teams'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = user.user_metadata?.team_id
  const isAdmin = user.user_metadata?.role === 'admin'

  const session = await getDraftSession()
  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Draft not active' }, { status: 400 })
  }

  const activeTeamId = session.snake_order[session.current_pick_index]

  // Only the active captain (or admin) can pick
  if (!isAdmin && teamId !== activeTeamId) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
  }

  const { playerId } = await request.json()

  // Get player base price
  const teams = await getTeams()
  const team = teams.find(t => t.id === activeTeamId)
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 400 })

  // Fetch player to get base_price
  const { data: player, error: playerErr } = await (await createServerClient())
    .from('players')
    .select('base_price, team_id')
    .eq('id', playerId)
    .single()

  if (playerErr || !player) return NextResponse.json({ error: 'Player not found' }, { status: 400 })
  if (player.team_id) return NextResponse.json({ error: 'Already drafted' }, { status: 400 })
  if (team.budget_remaining < player.base_price) {
    return NextResponse.json({ error: 'Insufficient budget' }, { status: 400 })
  }

  await draftPlayer(playerId, activeTeamId, player.base_price)
  await deductBudget(activeTeamId, player.base_price)

  // Advance to next pick (or complete if last pick)
  const nextIndex = session.current_pick_index + 1
  if (nextIndex >= session.snake_order.length) {
    const { upsertDraftSession } = await import('@/lib/db/draft')
    await upsertDraftSession({ status: 'completed', current_pick_index: nextIndex })
  } else {
    await advancePick()
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create draft room page**

```tsx
// app/draft/page.tsx
import { getDraftSession } from '@/lib/db/draft'
import { getAvailablePlayers } from '@/lib/db/players'
import { getTeams } from '@/lib/db/teams'
import { createServerClient } from '@/lib/supabase/server'
import DraftRoom from './DraftRoom'

export const dynamic = 'force-dynamic'

export default async function DraftPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [session, players, teams] = await Promise.all([
    getDraftSession(),
    getAvailablePlayers(),
    getTeams(),
  ])

  const myTeamId = user?.user_metadata?.team_id ?? null
  const isAdmin = user?.user_metadata?.role === 'admin'

  return (
    <DraftRoom
      initialSession={session}
      initialPlayers={players}
      initialTeams={teams}
      myTeamId={myTeamId}
      isAdmin={isAdmin}
    />
  )
}
```

Create `app/draft/DraftRoom.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { DraftSession, Player, Team } from '@/types'

export default function DraftRoom({
  initialSession,
  initialPlayers,
  initialTeams,
  myTeamId,
  isAdmin,
}: {
  initialSession: DraftSession | null
  initialPlayers: Player[]
  initialTeams: Team[]
  myTeamId: string | null
  isAdmin: boolean
}) {
  const [session, setSession] = useState(initialSession)
  const [players, setPlayers] = useState(initialPlayers)
  const [teams, setTeams] = useState(initialTeams)
  const [picking, setPicking] = useState<string | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    // Subscribe to realtime changes on draft_session and players tables
    const channel = supabase
      .channel('draft-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draft_session' }, payload => {
        setSession(payload.new as DraftSession)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players' }, payload => {
        const updated = payload.new as Player
        setPlayers(prev => prev.filter(p => p.id !== updated.id))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, payload => {
        const updated = payload.new as Team
        setTeams(prev => prev.map(t => t.id === updated.id ? updated : t))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function pickPlayer(playerId: string) {
    setPicking(playerId)
    const res = await fetch('/api/draft/pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(error)
    }
    setPicking(null)
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 text-lg">Draft has not started yet. Check back soon!</p>
      </div>
    )
  }

  const activeTeamId = session.status === 'active'
    ? session.snake_order[session.current_pick_index]
    : null
  const activeTeam = teams.find(t => t.id === activeTeamId)
  const isMyTurn = myTeamId === activeTeamId || isAdmin

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Draft</h1>
          {session.status === 'active' && activeTeam && (
            <p className="text-gray-400 mt-1">
              Pick {session.current_pick_index + 1}/{session.snake_order.length} —
              <span className="font-semibold" style={{ color: activeTeam.color }}>
                {' '}{activeTeam.name}'s turn
              </span>
            </p>
          )}
          {session.status === 'paused' && (
            <p className="text-yellow-400 mt-1">Draft is paused</p>
          )}
          {session.status === 'completed' && (
            <p className="text-green-400 mt-1">Draft complete!</p>
          )}
        </div>

        {/* Team budgets */}
        <div className="flex gap-4 text-sm">
          {teams.map(t => (
            <div key={t.id} className="text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: t.color }} />
              <div className="font-mono text-xs">₹{t.budget_remaining}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player pool */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {players.map(p => (
          <button
            key={p.id}
            onClick={() => pickPlayer(p.id)}
            disabled={!isMyTurn || session.status !== 'active' || picking === p.id}
            className={`bg-gray-900 border rounded-lg p-3 text-left transition ${
              isMyTurn && session.status === 'active'
                ? 'border-gray-700 hover:border-green-500 hover:bg-gray-800 cursor-pointer'
                : 'border-gray-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="font-medium text-sm">{p.name}</div>
            <div className="text-gray-400 text-xs mt-1">₹{p.base_price}</div>
            {picking === p.id && (
              <div className="text-green-400 text-xs mt-1">Picking…</div>
            )}
          </button>
        ))}
        {players.length === 0 && session.status !== 'completed' && (
          <p className="col-span-full text-gray-400 text-center py-8">All players drafted!</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Enable Realtime in Supabase**

Go to Supabase dashboard → Database → Replication → enable Realtime for tables: `players`, `teams`, `draft_session`.

- [ ] **Step 4: Test draft room**

1. Open two browser windows: one as admin (http://localhost:3000/admin/draft → Start Draft), one as a captain.
2. Captain should see available players.
3. When it's captain's turn, their cards become clickable.
4. Clicking a player should: remove it from pool on both screens, deduct budget, advance to next pick.

- [ ] **Step 5: Commit**

```bash
git add app/draft/ app/api/draft/
git commit -m "feat: add live draft room with Supabase Realtime"
```

---

### Task 15: Admin – Result Entry + Fixture Generation

**Files:**
- Create: `app/admin/results/page.tsx`
- Create: `app/api/admin/results/route.ts`
- Create: `app/api/admin/fixtures/route.ts`

**Interfaces:**
- Consumes: `getMatches()`, `updateMatchResult()`, `createGroupMatches()`, `createKnockoutMatches()` from `lib/db/matches.ts`; `getTeams()` from `lib/db/teams.ts`; `generateRoundRobin()` from `lib/utils/round-robin.ts`; `computeStandings()` from `lib/utils/standings.ts`
- Produces: admin can generate fixtures post-draft and enter match results

- [ ] **Step 1: Create fixtures generation API**

```typescript
// app/api/admin/fixtures/route.ts
import { NextResponse } from 'next/server'
import { getTeams } from '@/lib/db/teams'
import { createGroupMatches, getMatches } from '@/lib/db/matches'
import { generateRoundRobin } from '@/lib/utils/round-robin'

export async function POST() {
  const existing = await getMatches('group')
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Fixtures already generated' }, { status: 400 })
  }
  const teams = await getTeams()
  const fixtures = generateRoundRobin(teams.map(t => t.id))
  await createGroupMatches(fixtures)
  return NextResponse.json({ count: fixtures.length })
}
```

- [ ] **Step 2: Create results API**

```typescript
// app/api/admin/results/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateMatchResult, getMatches, createKnockoutMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import { computeStandings } from '@/lib/utils/standings'
import type { CompletedMatch } from '@/types'

export async function PATCH(request: NextRequest) {
  const { id, team1Score, team2Score } = await request.json()
  await updateMatchResult(id, team1Score, team2Score)
  return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const { action } = await request.json()
  if (action !== 'generate_knockouts') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const [teams, matches] = await Promise.all([getTeams(), getMatches('group')])
  const completedMatches: CompletedMatch[] = matches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id,
      team2Id: m.team2_id,
      team1Score: m.team1_score!,
      team2Score: m.team2_score!,
      status: 'completed',
    }))

  const standings = computeStandings(teams.map(t => t.id), completedMatches)
  await createKnockoutMatches(standings)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create results page**

```tsx
// app/admin/results/page.tsx
import { getMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import ResultsPanel from './ResultsPanel'

export const dynamic = 'force-dynamic'

export default async function AdminResultsPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()])
  const teamMap = new Map(teams.map(t => [t.id, t]))
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Match Results</h1>
      <ResultsPanel matches={matches} teamMap={teamMap} />
    </div>
  )
}
```

Create `app/admin/results/ResultsPanel.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Match, Team } from '@/types'

export default function ResultsPanel({
  matches,
  teamMap,
}: {
  matches: Match[]
  teamMap: Map<string, Team>
}) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, [string, string]>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  async function saveResult(matchId: string) {
    const [s1, s2] = scores[matchId] ?? ['', '']
    if (s1 === '' || s2 === '') return
    setSaving(matchId)
    await fetch('/api/admin/results', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: matchId, team1Score: parseInt(s1), team2Score: parseInt(s2) }),
    })
    setSaving(null)
    router.refresh()
  }

  async function generateKnockouts() {
    setGenerating(true)
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_knockouts' }),
    })
    setGenerating(false)
    if (res.ok) router.refresh()
    else alert('Failed to generate knockouts — ensure all group matches are complete')
  }

  async function generateFixtures() {
    setGenerating(true)
    await fetch('/api/admin/fixtures', { method: 'POST' })
    setGenerating(false)
    router.refresh()
  }

  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockoutMatches = matches.filter(m => m.stage !== 'group')
  const allGroupDone = groupMatches.length > 0 && groupMatches.every(m => m.status === 'completed')

  function MatchRow({ m }: { m: Match }) {
    const t1 = teamMap.get(m.team1_id)
    const t2 = teamMap.get(m.team2_id)
    if (!t1 || !t2) return null
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-800">
        <span className="w-32 text-right font-medium">{t1.name}</span>
        {m.status === 'completed' ? (
          <span className="text-gray-400 font-mono w-16 text-center">
            {m.team1_score} – {m.team2_score}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number" min={0}
              value={scores[m.id]?.[0] ?? ''}
              onChange={e => setScores(prev => ({ ...prev, [m.id]: [e.target.value, prev[m.id]?.[1] ?? ''] }))}
              className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
            />
            <span className="text-gray-500">–</span>
            <input
              type="number" min={0}
              value={scores[m.id]?.[1] ?? ''}
              onChange={e => setScores(prev => ({ ...prev, [m.id]: [prev[m.id]?.[0] ?? '', e.target.value] }))}
              className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
            />
            <button
              onClick={() => saveResult(m.id)}
              disabled={saving === m.id}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
          </div>
        )}
        <span className="font-medium">{t2.name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupMatches.length === 0 ? (
        <button
          onClick={generateFixtures}
          disabled={generating}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {generating ? 'Generating…' : 'Generate Group Fixtures'}
        </button>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">Group Stage</h2>
            {groupMatches.map(m => <MatchRow key={m.id} m={m} />)}
          </div>

          {allGroupDone && knockoutMatches.length === 0 && (
            <button
              onClick={generateKnockouts}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              {generating ? 'Generating…' : 'Generate Knockout Matches'}
            </button>
          )}

          {knockoutMatches.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Knockouts</h2>
              {knockoutMatches.map(m => <MatchRow key={m.id} m={m} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/results/ app/api/admin/results/ app/api/admin/fixtures/
git commit -m "feat: add result entry and fixture generation"
```

---

### Task 16: Public Pages (Teams, Fixtures, Standings, Home)

**Files:**
- Create: `app/teams/page.tsx`
- Create: `app/fixtures/page.tsx`
- Create: `app/standings/page.tsx`
- Modify: `app/page.tsx`
- Create: `components/StandingsTable.tsx`

**Interfaces:**
- Consumes: `getTeams()`, `getPlayers()`, `getMatches()`, `computeStandings()` from their respective modules
- Produces: public read-only pages for teams, fixtures, standings, home

- [ ] **Step 1: Create StandingsTable component**

```tsx
// components/StandingsTable.tsx
import type { Standing, Team } from '@/types'

export default function StandingsTable({
  standings,
  teams,
}: {
  standings: Standing[]
  teams: Team[]
}) {
  const teamMap = new Map(teams.map(t => [t.id, t]))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-800">
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-6">Team</th>
            <th className="pb-2 pr-4 text-center">P</th>
            <th className="pb-2 pr-4 text-center">W</th>
            <th className="pb-2 pr-4 text-center">D</th>
            <th className="pb-2 pr-4 text-center">L</th>
            <th className="pb-2 pr-4 text-center">GF</th>
            <th className="pb-2 pr-4 text-center">GA</th>
            <th className="pb-2 pr-4 text-center">GD</th>
            <th className="pb-2 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const team = teamMap.get(s.teamId)
            return (
              <tr key={s.teamId} className="border-b border-gray-900">
                <td className="py-2 pr-3 text-gray-500">{i + 1}</td>
                <td className="py-2 pr-6 flex items-center gap-2">
                  {team && (
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: team.color }} />
                  )}
                  {team?.name ?? s.teamId}
                </td>
                <td className="py-2 pr-4 text-center">{s.played}</td>
                <td className="py-2 pr-4 text-center">{s.won}</td>
                <td className="py-2 pr-4 text-center">{s.drawn}</td>
                <td className="py-2 pr-4 text-center">{s.lost}</td>
                <td className="py-2 pr-4 text-center">{s.goalsFor}</td>
                <td className="py-2 pr-4 text-center">{s.goalsAgainst}</td>
                <td className="py-2 pr-4 text-center text-gray-400">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                <td className="py-2 text-center font-bold text-white">{s.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create teams page**

```tsx
// app/teams/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getPlayers } from '@/lib/db/players'

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getPlayers()])

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teams</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        {teams.map(team => {
          const roster = players.filter(p => p.team_id === team.id)
          const captain = players.find(p => p.id === team.captain_id)
          return (
            <div key={team.id} className="bg-gray-900 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: team.color }} />
                <h2 className="text-xl font-bold">{team.name}</h2>
              </div>
              <ul className="space-y-2">
                {roster.map(p => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className={p.id === team.captain_id ? 'font-semibold text-yellow-400' : ''}>
                      {p.name}{p.id === team.captain_id ? ' ©' : ''}
                    </span>
                    {p.sold_price != null && (
                      <span className="text-gray-400">₹{p.sold_price}</span>
                    )}
                  </li>
                ))}
                {roster.length === 0 && (
                  <li className="text-gray-500 text-sm">Draft not started</li>
                )}
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
                Budget remaining: ₹{team.budget_remaining}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create fixtures page**

```tsx
// app/fixtures/page.tsx
import { getMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'

export const dynamic = 'force-dynamic'

export default async function FixturesPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()])
  const teamMap = new Map(teams.map(t => [t.id, t]))

  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockouts = matches.filter(m => m.stage !== 'group')

  function MatchCard({ m }: { m: typeof matches[0] }) {
    const t1 = teamMap.get(m.team1_id)
    const t2 = teamMap.get(m.team2_id)
    return (
      <div className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          {t1 && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t1.color }} />}
          <span className="font-medium">{t1?.name}</span>
        </div>
        <span className="text-gray-400 font-mono text-lg px-4">
          {m.status === 'completed' ? `${m.team1_score} – ${m.team2_score}` : 'vs'}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{t2?.name}</span>
          {t2 && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t2.color }} />}
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fixtures</h1>

      {groupMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-400 mb-3">Group Stage</h2>
          <div className="space-y-2">
            {groupMatches.map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {knockouts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-400 mb-3">Knockouts</h2>
          <div className="space-y-2">
            {knockouts.map(m => (
              <div key={m.id}>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  {m.stage === 'semi' ? `Semi-final ${m.round}` : m.stage === 'final' ? 'Final' : '3rd Place'}
                </p>
                <MatchCard m={m} />
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <p className="text-gray-400">Fixtures will appear here once the draft is complete.</p>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Create standings page**

```tsx
// app/standings/page.tsx
import { getMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import { computeStandings } from '@/lib/utils/standings'
import StandingsTable from '@/components/StandingsTable'
import type { CompletedMatch } from '@/types'

export const dynamic = 'force-dynamic'

export default async function StandingsPage() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches('group')])

  const completedMatches: CompletedMatch[] = matches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id,
      team2Id: m.team2_id,
      team1Score: m.team1_score!,
      team2Score: m.team2_score!,
      status: 'completed',
    }))

  const standings = computeStandings(teams.map(t => t.id), completedMatches)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Standings</h1>
      {teams.length === 0 ? (
        <p className="text-gray-400">Standings will appear once teams are set up.</p>
      ) : (
        <StandingsTable standings={standings} teams={teams} />
      )}
    </main>
  )
}
```

- [ ] **Step 5: Create home page**

```tsx
// app/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getMatches } from '@/lib/db/matches'
import { computeStandings } from '@/lib/utils/standings'
import StandingsTable from '@/components/StandingsTable'
import Link from 'next/link'
import type { CompletedMatch } from '@/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches()])
  const groupMatches = matches.filter(m => m.stage === 'group')
  const completedMatches: CompletedMatch[] = groupMatches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id, team2Id: m.team2_id,
      team1Score: m.team1_score!, team2Score: m.team2_score!,
      status: 'completed',
    }))
  const standings = computeStandings(teams.map(t => t.id), completedMatches)

  const upcoming = matches.find(m => m.status === 'scheduled')
  const teamMap = new Map(teams.map(t => [t.id, t]))

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-2">⚽ League 2026</h1>
      <p className="text-gray-400 mb-8">9th August 2026 · IPL Format</p>

      {upcoming && (
        <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 mb-8">
          <p className="text-xs text-green-400 uppercase font-semibold mb-2">Next Match</p>
          <p className="text-lg font-semibold">
            {teamMap.get(upcoming.team1_id)?.name} vs {teamMap.get(upcoming.team2_id)?.name}
          </p>
        </div>
      )}

      {standings.length > 0 && (
        <section>
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="text-xl font-bold">Standings</h2>
            <Link href="/standings" className="text-sm text-green-400 hover:underline">View full →</Link>
          </div>
          <StandingsTable standings={standings} teams={teams} />
        </section>
      )}

      {teams.length === 0 && (
        <p className="text-gray-500">League setup in progress. Check back soon!</p>
      )}
    </main>
  )
}
```

- [ ] **Step 6: Run full test suite**

```bash
npx jest
```
Expected: all 15 tests pass

- [ ] **Step 7: Test all public pages manually**

```bash
npm run dev
```
Verify: `/teams`, `/fixtures`, `/standings`, `/` all render without errors.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx app/teams/ app/fixtures/ app/standings/ components/StandingsTable.tsx
git commit -m "feat: add public teams, fixtures, standings, and home pages"
```

---

### Task 17: Deployment

**Files:**
- Create: `.env.example`
- Modify: `next.config.ts` (if needed)

**Interfaces:**
- Produces: app running on Vercel connected to Supabase

- [ ] **Step 1: Create `.env.example`**

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/football-league.git
git push -u origin main
```

- [ ] **Step 3: Deploy to Vercel**

1. Go to https://vercel.com → New Project → Import your GitHub repo
2. In Environment Variables, add all 3 keys from `.env.local`
3. Click Deploy

- [ ] **Step 4: Verify production**

Visit your Vercel URL:
- Public pages load without login
- Login as admin → admin panel works
- Create a captain account → log in as captain → draft room accessible

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "chore: add env example and prepare for deployment"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 28 players pre-loaded with tentative flags — Task 6 seed
- ✅ Admin confirms/removes tentative players — Task 11
- ✅ 4 teams with name, color, captain, purse — Task 12
- ✅ Captain logins created by admin — Task 13
- ✅ Snake draft order — Task 3 + Task 13
- ✅ Draft room with Realtime — Task 14
- ✅ Pick player deducts purse — Task 14 API
- ✅ Round-robin fixture generation — Task 4 + Task 15
- ✅ Semi-finals (1v4, 2v3), final, 3rd-place — Task 15 `createKnockoutMatches`
- ✅ Points: 3/1/0 — Task 5
- ✅ Tiebreaker: GD, then GF — Task 5
- ✅ Admin enters results — Task 15
- ✅ Public: teams roster — Task 16
- ✅ Public: fixtures — Task 16
- ✅ Public: standings — Task 16
- ✅ Home page — Task 16
- ✅ Auth middleware protects /admin and /draft — Task 7

**Type consistency check:**
- `generateSnakeOrder` returns `string[]` → used as `snake_order: string[]` in `DraftSession` ✅
- `generateRoundRobin` returns `RoundFixture[]` → consumed by `createGroupMatches(fixtures: RoundFixture[])` ✅
- `computeStandings` takes `CompletedMatch[]` → `standings.ts` and `results/route.ts` both use same shape ✅
- `draftPlayer(playerId, teamId, soldPrice)` → called correctly in `pick/route.ts` ✅
- `advancePick()` → no params, matches `lib/db/draft.ts` definition ✅
