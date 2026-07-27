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
