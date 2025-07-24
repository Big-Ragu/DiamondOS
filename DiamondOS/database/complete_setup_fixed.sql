-- DiamondOS COMPLETE SETUP - Fixed Version
-- This script will set up everything with realistic baseball teams and players
-- No user ID needed - creates a demo commissioner automatically

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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Step 3: Insert sample data (Demo Commissioner + 6 Realistic Teams + Players)

-- Create Demo Commissioner (no auth dependency)
INSERT INTO public.users (id, email, name, role) VALUES 
('demo-commissioner-001', 'commissioner@diamondos.com', 'Commissioner Jane Smith', 'commissioner');

-- Create Demo League
INSERT INTO public.leagues (id, name, season, commissioner_id, settings) VALUES 
('league-001', 'Diamond Valley Youth League', '2025 Spring Season', 'demo-commissioner-001', '{
  "max_teams": 6,
  "players_per_team": 15,
  "innings_per_game": 9,
  "draft_timer_minutes": 5,
  "allow_trades": true,
  "season_start": "2025-04-01",
  "season_end": "2025-09-30"
}');

-- Create 6 Realistic Teams (Youth Baseball Inspired)
INSERT INTO public.teams (id, league_id, name, wins, losses, colors) VALUES 
('team-001', 'league-001', 'Thunder Bolts', 8, 2, '{"primary": "#1e40af", "secondary": "#fbbf24"}'),
('team-002', 'league-001', 'Fire Dragons', 7, 3, '{"primary": "#dc2626", "secondary": "#fed7aa"}'),
('team-003', 'league-001', 'Ice Wolves', 6, 4, '{"primary": "#1f2937", "secondary": "#e5e7eb"}'),
('team-004', 'league-001', 'Storm Eagles', 4, 6, '{"primary": "#059669", "secondary": "#fef3c7"}'),
('team-005', 'league-001', 'Wild Cats', 3, 7, '{"primary": "#7c2d12", "secondary": "#fed7aa"}'),
('team-006', 'league-001', 'Lightning Strikes', 2, 8, '{"primary": "#7c3aed", "secondary": "#ddd6fe"}');

-- Thunder Bolts Roster (15 players)
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
('league-001', 'team-001', 'Marcus "Lightning" Rodriguez', 'C', 12, 7, true),
('league-001', 'team-001', 'Tyler "Big Stick" Johnson', '1B', 13, 21, true),
('league-001', 'team-001', 'Emma "Speed" Chen', '2B', 11, 4, true),
('league-001', 'team-001', 'Jake "Hot Corner" Wilson', '3B', 12, 15, true),
('league-001', 'team-001', 'Sofia "Glove" Martinez', 'SS', 13, 2, true),
('league-001', 'team-001', 'Alex "Rocket" Thompson', 'LF', 12, 9, true),
('league-001', 'team-001', 'Jordan "Flash" Davis', 'CF', 11, 1, true),
('league-001', 'team-001', 'Casey "Cannon" Brown', 'RF', 13, 18, true),
('league-001', 'team-001', 'Ryan "Ace" Miller', 'P', 12, 11, true),
('league-001', 'team-001', 'Maya "Fastball" Garcia', 'P', 13, 22, true),
('league-001', 'team-001', 'Noah "Slider" Anderson', 'P', 12, 33, true),
('league-001', 'team-001', 'Zoe "Knuckleball" White', 'P', 11, 44, true),
('league-001', 'team-001', 'Lucas "Backup" Taylor', 'C', 12, 99, true),
('league-001', 'team-001', 'Mia "Utility" Jackson', '2B', 11, 8, true),
('league-001', 'team-001', 'Dylan "Pinch Hit" Lee', 'RF', 13, 17, true);

-- Fire Dragons Roster (15 players)
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
('league-001', 'team-002', 'Ethan "Iron Mask" Clark', 'C', 12, 5, true),
('league-001', 'team-002', 'Isabella "Power" Lopez', '1B', 13, 23, true),
('league-001', 'team-002', 'Aaron "Double Play" King', '2B', 11, 6, true),
('league-001', 'team-002', 'Chloe "Triple Threat" Moore', '3B', 12, 14, true),
('league-001', 'team-002', 'Mason "Range" Hall', 'SS', 13, 3, true),
('league-001', 'team-002', 'Grace "Line Drive" Scott', 'LF', 12, 10, true),
('league-001', 'team-002', 'Caleb "Center Field" Green', 'CF', 11, 12, true),
('league-001', 'team-002', 'Olivia "Strong Arm" Adams', 'RF', 13, 19, true),
('league-001', 'team-002', 'Nathan "Flame" Baker', 'P', 12, 13, true),
('league-001', 'team-002', 'Ava "Heat" Carter', 'P', 13, 24, true),
('league-001', 'team-002', 'Logan "Curve" Phillips', 'P', 12, 35, true),
('league-001', 'team-002', 'Lily "Change-up" Evans', 'P', 11, 46, true),
('league-001', 'team-002', 'Owen "Backup Catcher" Turner', 'C', 12, 88, true),
('league-001', 'team-002', 'Hannah "Super Sub" Parker', '1B', 11, 16, true),
('league-001', 'team-002', 'Hunter "Clutch" Reed', 'LF', 13, 20, true);

-- Ice Wolves Roster (15 players)
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
('league-001', 'team-003', 'Gabriel "Ice Cold" Young', 'C', 12, 31, true),
('league-001', 'team-003', 'Sophia "First Base" Wright', '1B', 13, 25, true),
('league-001', 'team-003', 'Connor "Second to None" Hill', '2B', 11, 7, true),
('league-001', 'team-003', 'Madison "Hot Corner" Wood', '3B', 12, 16, true),
('league-001', 'team-003', 'Jackson "Shortstop" Bell', 'SS', 13, 4, true),
('league-001', 'team-003', 'Samantha "Left Field" Cooper', 'LF', 12, 11, true),
('league-001', 'team-003', 'Aiden "Center Ice" Ross', 'CF', 11, 13, true),
('league-001', 'team-003', 'Victoria "Right On" Morgan', 'RF', 13, 21, true),
('league-001', 'team-003', 'Blake "Frostbite" Kelly', 'P', 12, 15, true),
('league-001', 'team-003', 'Natalie "Blizzard" Rivera', 'P', 13, 26, true),
('league-001', 'team-003', 'Brayden "Ice Storm" Cox', 'P', 12, 37, true),
('league-001', 'team-003', 'Ella "Freeze" Ward', 'P', 11, 48, true),
('league-001', 'team-003', 'Colton "Backup Ice" Price', 'C', 12, 77, true),
('league-001', 'team-003', 'Leah "Flex Player" Foster', '3B', 11, 18, true),
('league-001', 'team-003', 'Wyatt "Wolf Pack" Gray', 'RF', 13, 22, true);

-- Storm Eagles Roster (15 players)
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
('league-001', 'team-004', 'Isaiah "Eagle Eye" James', 'C', 12, 9, true),
('league-001', 'team-004', 'Zoe "First Storm" Russell', '1B', 13, 27, true),
('league-001', 'team-004', 'Landon "Thunder" Hughes', '2B', 11, 8, true),
('league-001', 'team-004', 'Aubrey "Lightning" Perry', '3B', 12, 17, true),
('league-001', 'team-004', 'Gavin "Storm Front" Butler', 'SS', 13, 5, true),
('league-001', 'team-004', 'Maya "Left Wing" Sanders', 'LF', 12, 12, true),
('league-001', 'team-004', 'Carter "Soar High" Washington', 'CF', 11, 14, true),
('league-001', 'team-004', 'Brooke "Right Wing" Powell", 'RF', 13, 23, true),
('league-001', 'team-004', 'Eli "Storm Surge" Jenkins', 'P', 12, 17, true),
('league-001', 'team-004', 'Cora "Hurricane" Barnes', 'P', 13, 28, true),
('league-001', 'team-004', 'Jaxon "Tornado" Fisher', 'P', 12, 39, true),
('league-001', 'team-004', 'Piper "Cyclone" Henderson', 'P', 11, 50, true),
('league-001', 'team-004', 'Ryder "Backup Storm" Cole', 'C', 12, 66, true),
('league-001', 'team-004', 'Skylar "Multi-Tool" Stewart', '2B', 11, 19, true),
('league-001', 'team-004', 'Phoenix "Eagle Pride" Murphy', 'LF', 13, 24, true);

-- Wild Cats Roster (15 players)
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
('league-001', 'team-005', 'Chase "Wildcat" Peterson', 'C', 12, 32, true),
('league-001', 'team-005', 'Ruby "First Cat" Bailey', '1B', 13, 29, true),
('league-001', 'team-005', 'Ashton "Quick Paws" Reed', '2B', 11, 9, true),
('league-001', 'team-005', 'Hailey "Cat Claws" Cook", '3B', 12, 18, true),
('league-001', 'team-005', 'Tristan "Prowl" Rogers', 'SS', 13, 6, true),
('league-001', 'team-005', 'Kiara "Left Pounce" Morgan', 'LF', 12, 13, true),
('league-001', 'team-005', 'Braxton "Center Prowl" Bell', 'CF', 11, 15, true),
('league-001', 'team-005', 'Mackenzie "Right Strike" Collins", 'RF', 13, 25, true),
('league-001', 'team-005', 'Kaden "Wild Pitch" Howard', 'P', 12, 19, true),
('league-001', 'team-005', 'Aria "Cat Speed" Ward', 'P', 13, 30, true),
('league-001', 'team-005', 'Greyson "Jungle King" Torres', 'P', 12, 41, true),
('league-001', 'team-005', 'Nora "Fierce" Peterson', 'P', 11, 52, true),
('league-001', 'team-005', 'Tanner "Backup Wild', 'C', 12, 55, true),
('league-001', 'team-005', 'Adalyn "Cat Magic" Flores', 'SS', 11, 20, true),
('league-001', 'team-005', 'Jaden "Wild Card" Washington', 'CF', 13, 26, true);

-- Lightning Strikes Roster (15 players)
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
('league-001', 'team-006', 'Kai "Thunder Clap" Brooks', 'C', 12, 34, true),
('league-001', 'team-006', 'Paisley "First Strike" Griffin', '1B', 13, 31, true),
('league-001', 'team-006', 'Rhett "Second Strike" Diaz', '2B', 11, 10, true),
('league-001', 'team-006', 'Sierra "Triple Strike" Hayes', '3B', 12, 19, true),
('league-001', 'team-006', 'Declan "Short Circuit" Myers', 'SS', 13, 7, true),
('league-001', 'team-006', 'Emery "Left Bolt" Ford', 'LF', 12, 14, true),
('league-001', 'team-006', 'Rowan "Center Flash" Hamilton', 'CF', 11, 16, true),
('league-001', 'team-006', 'Presley "Right Shock" Bryant', 'RF', 13, 27, true),
('league-001', 'team-006', 'Sawyer "Lightning Rod" Gibson', 'P', 12, 21, true),
('league-001', 'team-006', 'Quinn "Electric" Ellis', 'P', 13, 32, true),
('league-001', 'team-006', 'Maverick "Spark Plug" Hunt', 'P', 12, 43, true),
('league-001', 'team-006', 'Sage "Power Surge" Graham', 'P', 11, 54, true),
('league-001', 'team-006', 'Knox "Backup Bolt" Knight', 'C', 12, 44, true),
('league-001', 'team-006', 'Remi "Strike Force" Stevens', '1B', 11, 21, true),
('league-001', 'team-006', 'Zander "Lightning Speed" Reynolds', 'RF', 13, 28, true);

-- Create a sample scheduled game for testing
INSERT INTO public.games (league_id, home_team_id, away_team_id, scheduled_at) VALUES 
('league-001', 'team-001', 'team-002', NOW() + INTERVAL '1 hour');

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (Allow all for demo - tighten in production)
CREATE POLICY "Allow all operations for demo" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON public.leagues FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON public.teams FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON public.players FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON public.games FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON public.game_events FOR ALL USING (true);

-- Success message
SELECT 
  'DiamondOS database setup complete!' as status,
  '6 teams created with 90 realistic players' as teams_info,
  'Ready to test scorekeeping at /scorekeeping' as next_step;
