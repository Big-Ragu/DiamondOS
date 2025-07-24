-- DiamondOS Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
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
  UNIQUE(team_id, jersey_number) -- No duplicate jersey numbers on same team
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

-- Game Events table (for play-by-play tracking)
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

-- Player Statistics table
CREATE TABLE public.player_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  season TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  at_bats INTEGER DEFAULT 0,
  hits INTEGER DEFAULT 0,
  runs INTEGER DEFAULT 0,
  rbis INTEGER DEFAULT 0,
  home_runs INTEGER DEFAULT 0,
  doubles INTEGER DEFAULT 0,
  triples INTEGER DEFAULT 0,
  walks INTEGER DEFAULT 0,
  strikeouts INTEGER DEFAULT 0,
  stolen_bases INTEGER DEFAULT 0,
  caught_stealing INTEGER DEFAULT 0,
  batting_average DECIMAL(4,3) DEFAULT 0.000,
  on_base_percentage DECIMAL(4,3) DEFAULT 0.000,
  slugging_percentage DECIMAL(4,3) DEFAULT 0.000,
  ops DECIMAL(5,3) DEFAULT 0.000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, season)
);

-- Pitching Statistics table
CREATE TABLE public.pitching_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  season TEXT NOT NULL,
  games_pitched INTEGER DEFAULT 0,
  innings_pitched INTEGER DEFAULT 0, -- stored as thirds (21 = 7.0 innings)
  hits_allowed INTEGER DEFAULT 0,
  runs_allowed INTEGER DEFAULT 0,
  earned_runs INTEGER DEFAULT 0,
  walks_allowed INTEGER DEFAULT 0,
  strikeouts INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  era DECIMAL(4,2) DEFAULT 0.00,
  whip DECIMAL(4,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, season)
);

-- Draft Picks table
CREATE TABLE public.draft_picks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  pick_number INTEGER NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  pick_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_auto_pick BOOLEAN DEFAULT false,
  UNIQUE(league_id, round_number, pick_number)
);

-- League Memberships (for access control)
CREATE TABLE public.league_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('commissioner', 'manager', 'viewer')),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_teams_league_id ON public.teams(league_id);
CREATE INDEX idx_players_team_id ON public.players(team_id);
CREATE INDEX idx_players_league_id ON public.players(league_id);
CREATE INDEX idx_games_league_id ON public.games(league_id);
CREATE INDEX idx_games_status ON public.games(game_status);
CREATE INDEX idx_game_events_game_id ON public.game_events(game_id);
CREATE INDEX idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX idx_pitching_stats_player_id ON public.pitching_stats(player_id);
CREATE INDEX idx_draft_picks_league_id ON public.draft_picks(league_id);
CREATE INDEX idx_league_memberships_user_id ON public.league_memberships(user_id);
CREATE INDEX idx_league_memberships_league_id ON public.league_memberships(league_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitching_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_memberships ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- League access policies (users can access leagues they're members of)
CREATE POLICY "League access for members" ON public.leagues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.league_memberships 
      WHERE league_id = leagues.id AND user_id = auth.uid()
    )
  );

-- Teams access (same as leagues)
CREATE POLICY "Team access for league members" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.league_memberships 
      WHERE league_id = teams.league_id AND user_id = auth.uid()
    )
  );

-- Players access (same as leagues)
CREATE POLICY "Player access for league members" ON public.players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.league_memberships 
      WHERE league_id = players.league_id AND user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
-- (Additional RLS policies would be added for complete security)

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON public.player_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pitching_stats_updated_at BEFORE UPDATE ON public.pitching_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for development)
-- Uncomment to populate with demo data:

/*
-- Sample commissioner user (you'll need to create this after Supabase auth signup)
INSERT INTO public.users (id, email, name, role) VALUES 
('your-user-id-from-auth', 'commissioner@diamondos.com', 'League Commissioner', 'commissioner');

-- Sample league
INSERT INTO public.leagues (name, season, commissioner_id) VALUES 
('Youth Baseball League', '2025', 'your-user-id-from-auth');

-- Sample teams
INSERT INTO public.teams (league_id, name, colors) VALUES 
((SELECT id FROM public.leagues LIMIT 1), 'Thunder Bolts', '{"primary": "#1e40af", "secondary": "#fbbf24"}'),
((SELECT id FROM public.leagues LIMIT 1), 'Fire Dragons', '{"primary": "#dc2626", "secondary": "#f97316"}'),
((SELECT id FROM public.leagues LIMIT 1), 'Ice Wolves', '{"primary": "#0891b2", "secondary": "#64748b"}'),
((SELECT id FROM public.leagues LIMIT 1), 'Storm Eagles', '{"primary": "#7c2d12", "secondary": "#a3a3a3"}'),
((SELECT id FROM public.leagues LIMIT 1), 'Wild Cats', '{"primary": "#166534", "secondary": "#84cc16"}'),
((SELECT id FROM public.leagues LIMIT 1), 'Lightning Strikes', '{"primary": "#7c3aed", "secondary": "#fde047"}');
*/