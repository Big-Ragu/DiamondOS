-- DiamondOS COMPLETE SETUP (handles existing data)
-- Run this single script to set up everything fresh
-- Replace 'YOUR-USER-ID-HERE' with your actual Supabase auth user ID

-- Step 1: Clean existing data (safe to run multiple times)
DROP TABLE IF EXISTS public.league_memberships CASCADE;
DROP TABLE IF EXISTS public.draft_picks CASCADE;
DROP TABLE IF EXISTS public.pitching_stats CASCADE;
DROP TABLE IF EXISTS public.player_stats CASCADE;
DROP TABLE IF EXISTS public.game_events CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.leagues CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 2: Create fresh schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('commissioner', 'manager', 'parent', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leagues table
CREATE TABLE public.leagues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  commissioner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{
    "max_teams": 6,
    "players_per_team": 15,
    "innings_per_game": 9,
    "draft_timer_minutes": 5,
    "allow_trades": true,
    "season_start": null,
    "season_end": null
  }',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table  
CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  colors JSONB DEFAULT '{"primary": "#1f2937", "secondary": "#6b7280"}',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, name)
);

-- Players table
CREATE TABLE public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'P')),
  age INTEGER,
  jersey_number INTEGER,
  is_drafted BOOLEAN DEFAULT false,
  draft_round INTEGER,
  draft_pick INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- Games table
CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  current_inning INTEGER DEFAULT 1,
  is_top_inning BOOLEAN DEFAULT true,
  game_status TEXT DEFAULT 'scheduled' CHECK (game_status IN ('scheduled', 'in_progress', 'paused', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Events table
CREATE TABLE public.game_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  inning INTEGER NOT NULL,
  is_top_inning BOOLEAN NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('at_bat', 'pitching_change', 'substitution', 'dispute', 'timeout')),
  result TEXT NOT NULL,
  runs_scored INTEGER DEFAULT 0,
  rbi_count INTEGER DEFAULT 0,
  manager1_input TEXT,
  manager2_input TEXT,
  commissioner_ruling TEXT,
  is_disputed BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes and triggers
CREATE INDEX idx_teams_league_id ON public.teams(league_id);
CREATE INDEX idx_players_team_id ON public.players(team_id);
CREATE INDEX idx_games_league_id ON public.games(league_id);
CREATE INDEX idx_game_events_game_id ON public.game_events(game_id);

-- Timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Insert sample data
-- IMPORTANT: Replace 'YOUR-USER-ID-HERE' with your real Supabase auth user ID

-- Sample League
INSERT INTO public.leagues (id, name, season, commissioner_id, settings) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Diamond League Championship', '2025', 'bbbc8629-8b42-450b-8285-b59a384ca54b', '{
  "max_teams": 6,
  "players_per_team": 15,
  "innings_per_game": 9,
  "draft_timer_minutes": 5,
  "allow_trades": true,
  "season_start": "2025-04-01",
  "season_end": "2025-09-30"
}');

-- Sample Teams (Mock MLB-inspired)
INSERT INTO public.teams (id, league_id, name, manager_id, wins, losses, colors) VALUES 
('team-001', '550e8400-e29b-41d4-a716-446655440000', 'NY Pinstripes', null, 8, 5, '{"primary": "#132448", "secondary": "#C4CED4"}'),
('team-002', '550e8400-e29b-41d4-a716-446655440000', 'NY Blue Apples', null, 7, 6, '{"primary": "#002D72", "secondary": "#FF5910"}'),
('team-003', '550e8400-e29b-41d4-a716-446655440000', 'LA Golden Angels', null, 9, 4, '{"primary": "#BA0021", "secondary": "#003263"}'),
('team-004', '550e8400-e29b-41d4-a716-446655440000', 'Boston Green Monsters', null, 6, 7, '{"primary": "#BD3039", "secondary": "#0C2340"}'),
('team-005', '550e8400-e29b-41d4-a716-446655440000', 'Chicago White Lightning', null, 5, 8, '{"primary": "#27251F", "secondary": "#C4CED4"}'),
('team-006', '550e8400-e29b-41d4-a716-446655440000', 'Houston Space Cowboys', null, 10, 3, '{"primary": "#002D62", "secondary": "#EB6E1F"}');

-- Sample Players (First 15 for NY Pinstripes - Mock Yankees)
INSERT INTO public.players (id, league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players
('player-001', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Jose Catcher', 'C', 28, 24, true),
('player-002', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Anthony Pizza', '1B', 32, 44, true),
('player-003', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Gleyber Towers', '2B', 26, 25, true),
('player-004', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'DJ LeMachine', '3B', 34, 26, true),
('player-005', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Anthony Volcano', 'SS', 22, 11, true),
('player-006', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Alex Verdugone', 'LF', 27, 24, true),
('player-007', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Aaron Jury', 'CF', 31, 99, true),
('player-008', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Juan Solo', 'RF', 25, 22, true),
-- Pitchers
('player-009', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Garrett Coal', 'P', 33, 45, true),
('player-010', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Carlos Rodan', 'P', 31, 55, true),
('player-011', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Nestor Cortez', 'P', 29, 65, true),
('player-012', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Clay Sherlock', 'P', 31, 35, true),
('player-013', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Jonathan Louisiana', 'P', 29, 43, true),
-- Utility
('player-014', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Oswaldo Cabrerra', '2B', 25, 95, true),
('player-015', '550e8400-e29b-41d4-a716-446655440000', 'team-001', 'Jose Treviso', 'C', 31, 39, true);

-- Success message
SELECT 'Setup complete! 6 teams and 15 players created. Check your scorekeeping app!' as status;