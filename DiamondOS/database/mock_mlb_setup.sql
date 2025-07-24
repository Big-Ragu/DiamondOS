-- DiamondOS MOCK MLB SETUP - Humorous Teams & Current Rosters
-- 6 Mock MLB teams with funny names + 13 games of sample data
-- Based on 2024-2025 MLB rosters with punny player names

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

-- Step 3: Insert Mock MLB Data

-- Create Demo Commissioner
INSERT INTO public.users (id, email, name, role) VALUES 
('demo-commissioner-mlb', 'commissioner@diamondos.com', 'Commissioner Rob Manfred Jr.', 'commissioner');

-- Create Mock MLB League
INSERT INTO public.leagues (id, name, season, commissioner_id, settings) VALUES 
('mlb-mock-league', 'Diamond Valley Mock MLB', '2025 Season', 'demo-commissioner-mlb', '{
  "max_teams": 6,
  "players_per_team": 13,
  "innings_per_game": 9,
  "draft_timer_minutes": 5,
  "allow_trades": true,
  "season_start": "2025-04-01",
  "season_end": "2025-10-31"
}');

-- Create 6 Mock MLB Teams 
INSERT INTO public.teams (id, league_id, name, wins, losses, colors) VALUES 
('yankees', 'mlb-mock-league', 'NY Pinstripes', 12, 8, '{"primary": "#132448", "secondary": "#C4CED4"}'),
('red-sox', 'mlb-mock-league', 'Boston Green Monsters', 11, 9, '{"primary": "#BD3039", "secondary": "#0C2340"}'),
('mets', 'mlb-mock-league', 'NY Blue Apples', 10, 10, '{"primary": "#002D72", "secondary": "#FF5910"}'),
('dodgers', 'mlb-mock-league', 'LA Hollywood Stars', 14, 6, '{"primary": "#005A9C", "secondary": "#EF3E42"}'),
('astros', 'mlb-mock-league', 'Houston Space Cowboys', 13, 7, '{"primary": "#002D62", "secondary": "#EB6E1F"}'),
('braves', 'mlb-mock-league', 'Atlanta Hammer Birds', 9, 11, '{"primary": "#CE1141", "secondary": "#13274F"}');

-- NY PINSTRIPES (Mock Yankees) - Current 2024-25 Roster
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players (8)
('mlb-mock-league', 'yankees', 'Jose Cappuccino', 'C', 31, 39, true),           -- Jose Trevino
('mlb-mock-league', 'yankees', 'Anthony Pizza', '1B', 35, 48, true),            -- Anthony Rizzo
('mlb-mock-league', 'yankees', 'Gleyber Towers', '2B', 28, 25, true),          -- Gleyber Torres
('mlb-mock-league', 'yankees', 'DJ LeMachine', '3B', 36, 26, true),             -- DJ LeMahieu
('mlb-mock-league', 'yankees', 'Anthony Volcano', 'SS', 23, 11, true),          -- Anthony Volpe
('mlb-mock-league', 'yankees', 'Alex Verdugone', 'LF', 28, 24, true),          -- Alex Verdugo
('mlb-mock-league', 'yankees', 'Aaron Jury', 'CF', 32, 99, true),              -- Aaron Judge
('mlb-mock-league', 'yankees', 'Juan Solo', 'RF', 26, 22, true),               -- Juan Soto
-- Pitchers (5)
('mlb-mock-league', 'yankees', 'Garrett Coal', 'P', 34, 45, true),             -- Gerrit Cole
('mlb-mock-league', 'yankees', 'Carlos Rodan', 'P', 32, 55, true),             -- Carlos Rodon
('mlb-mock-league', 'yankees', 'Nestor Cortez Jr.', 'P', 30, 65, true),       -- Nestor Cortes
('mlb-mock-league', 'yankees', 'Clay Sherlock', 'P', 32, 35, true),           -- Clay Holmes
('mlb-mock-league', 'yankees', 'Jonathan Louisiana', 'P', 30, 43, true);       -- Jonathan Loaisiga

-- BOSTON GREEN MONSTERS (Mock Red Sox) - Current 2024-25 Roster
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players (8)
('mlb-mock-league', 'red-sox', 'Connor Wrong', 'C', 28, 74, true),             -- Connor Wong
('mlb-mock-league', 'red-sox', 'Tristan Houses', '1B', 25, 36, true),          -- Triston Casas
('mlb-mock-league', 'red-sox', 'Christian Arrow', '2B', 29, 47, true),         -- Christian Arroyo
('mlb-mock-league', 'red-sox', 'Rafael Delivers', '3B', 28, 11, true),         -- Rafael Devers
('mlb-mock-league', 'red-sox', 'Trevor Tall-Tale', 'SS', 32, 10, true),        -- Trevor Story
('mlb-mock-league', 'red-sox', 'Masataka Yo-Sushi', 'LF', 31, 7, true),       -- Masataka Yoshida
('mlb-mock-league', 'red-sox', 'Jarren Duration', 'CF', 28, 16, true),         -- Jarren Duran
('mlb-mock-league', 'red-sox', 'Rob Referee', 'RF', 34, 30, true),             -- Rob Refsnyder
-- Pitchers (5)
('mlb-mock-league', 'red-sox', 'Brayan Hello', 'P', 26, 17, true),             -- Brayan Bello
('mlb-mock-league', 'red-sox', 'Butter Crawford', 'P', 29, 50, true),          -- Kutter Crawford
('mlb-mock-league', 'red-sox', 'Nick Pivot', 'P', 31, 61, true),               -- Nick Pivetta
('mlb-mock-league', 'red-sox', 'Kenley Handsome', 'P', 37, 74, true),         -- Kenley Jansen
('mlb-mock-league', 'red-sox', 'Chris Martin Luther', 'P', 38, 17, true);      -- Chris Martin

-- NY BLUE APPLES (Mock Mets) - Current 2024-25 Roster  
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players (8)
('mlb-mock-league', 'mets', 'Francisco Alvarez-Martinez', 'C', 23, 4, true),   -- Francisco Alvarez
('mlb-mock-league', 'mets', 'Pete Alonsozilla', '1B', 30, 20, true),           -- Pete Alonso
('mlb-mock-league', 'mets', 'Jeff McNeal-Deal', '2B', 32, 6, true),            -- Jeff McNeil
('mlb-mock-league', 'mets', 'Mark Vientos-Wind', '3B', 25, 27, true),          -- Mark Vientos
('mlb-mock-league', 'mets', 'Francisco Lint', 'SS', 32, 1, true),              -- Francisco Lindor
('mlb-mock-league', 'mets', 'Jesse Winker-Bell', 'LF', 31, 8, true),           -- Jesse Winker
('mlb-mock-league', 'mets', 'Brandon Nimmo-Agile', 'CF', 32, 9, true),         -- Brandon Nimmo
('mlb-mock-league', 'mets', 'Starling Mars-Bar', 'RF', 36, 6, true),           -- Starling Marte
-- Pitchers (5)
('mlb-mock-league', 'mets', 'Kodai Senga-Jenga', 'P', 32, 34, true),          -- Kodai Senga
('mlb-mock-league', 'mets', 'Luis Severe-Us', 'P', 31, 57, true),              -- Luis Severino
('mlb-mock-league', 'mets', 'Sean Manaea-Banana', 'P', 33, 59, true),          -- Sean Manaea
('mlb-mock-league', 'mets', 'Edwin Diaz-Mayonnaise', 'P', 31, 39, true),       -- Edwin Diaz
('mlb-mock-league', 'mets', 'Clay Holmes-Watson', 'P', 32, 35, true);          -- Reed Garrett

-- LA HOLLYWOOD STARS (Mock Dodgers) - Current 2024-25 Roster
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players (8)
('mlb-mock-league', 'dodgers', 'Will Smith-Matrix', 'C', 30, 16, true),        -- Will Smith
('mlb-mock-league', 'dodgers', 'Freddie Free-Man', '1B', 35, 5, true),         -- Freddie Freeman
('mlb-mock-league', 'dodgers', 'Gavin Lux-Deluxe', '2B', 27, 9, true),        -- Gavin Lux
('mlb-mock-league', 'dodgers', 'Max Munchy', '3B', 34, 13, true),              -- Max Muncy
('mlb-mock-league', 'dodgers', 'Tommy Edman-Newman', 'SS', 30, 25, true),      -- Tommy Edman
('mlb-mock-league', 'dodgers', 'Teoscar Hernandez-Lopez', 'LF', 32, 37, true), -- Teoscar Hernandez
('mlb-mock-league', 'dodgers', 'Chris Taylor-Swift', 'CF', 34, 3, true),       -- Chris Taylor
('mlb-mock-league', 'dodgers', 'Mookie Betts-Worse', 'RF', 32, 50, true),      -- Mookie Betts
-- Pitchers (5)
('mlb-mock-league', 'dodgers', 'Shohei Ohtani-Baloney', 'P', 30, 17, true),    -- Shohei Ohtani
('mlb-mock-league', 'dodgers', 'Yoshinobu Yamamoto-San', 'P', 26, 18, true),   -- Yoshinobu Yamamoto
('mlb-mock-league', 'dodgers', 'Tyler Glasnow-House', 'P', 31, 88, true),      -- Tyler Glasnow
('mlb-mock-league', 'dodgers', 'Walker Buehler-Day-Off', 'P', 30, 21, true),   -- Walker Buehler
('mlb-mock-league', 'dodgers', 'Evan Phillips-Screwdriver', 'P', 30, 46, true); -- Evan Phillips

-- HOUSTON SPACE COWBOYS (Mock Astros) - Current 2024-25 Roster
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players (8)
('mlb-mock-league', 'astros', 'Yainer Diaz-Mustard', 'C', 26, 21, true),       -- Yainer Diaz
('mlb-mock-league', 'astros', 'Jose Altuve-Live', '1B', 35, 27, true),         -- Jose Altuve
('mlb-mock-league', 'astros', 'Grae Kessinger-Messenger', '2B', 27, 11, true), -- Grae Kessinger
('mlb-mock-league', 'astros', 'Alex Bregman-Iceman', '3B', 31, 2, true),       -- Alex Bregman
('mlb-mock-league', 'astros', 'Jeremy Pena-Colada', 'SS', 27, 3, true),        -- Jeremy Pena
('mlb-mock-league', 'astros', 'Yordan Alvarez-Suarez', 'LF', 28, 44, true),    -- Yordan Alvarez
('mlb-mock-league', 'astros', 'Chas McCormick-Seasoning', 'CF', 30, 20, true), -- Chas McCormick
('mlb-mock-league', 'astros', 'Kyle Tucker-Carlson', 'RF', 28, 30, true),      -- Kyle Tucker
-- Pitchers (5)
('mlb-mock-league', 'astros', 'Framber Valdez-Chainz', 'P', 31, 59, true),     -- Framber Valdez
('mlb-mock-league', 'astros', 'Hunter Brown-Sugar', 'P', 26, 61, true),        -- Hunter Brown
('mlb-mock-league', 'astros', 'Ronel Blanco-White', 'P', 31, 56, true),        -- Ronel Blanco
('mlb-mock-league', 'astros', 'Ryan Pressly-Ironed', 'P', 36, 55, true),       -- Ryan Pressly
('mlb-mock-league', 'astros', 'Josh Hader-Gator', 'P', 31, 71, true);          -- Josh Hader

-- ATLANTA HAMMER BIRDS (Mock Braves) - Current 2024-25 Roster
INSERT INTO public.players (league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players (8)
('mlb-mock-league', 'braves', 'Sean Murphy-Brown', 'C', 30, 12, true),         -- Sean Murphy
('mlb-mock-league', 'braves', 'Matt Olson-Twin', '1B', 31, 28, true),          -- Matt Olson
('mlb-mock-league', 'braves', 'Ozzie Albies-Babies', '2B', 28, 1, true),       -- Ozzie Albies
('mlb-mock-league', 'braves', 'Austin Riley-Cyrus', '3B', 28, 27, true),       -- Austin Riley
('mlb-mock-league', 'braves', 'Orlando Arcia-Garcia', 'SS', 30, 11, true),     -- Orlando Arcia
('mlb-mock-league', 'braves', 'Marcell Ozuna-Tuna', 'LF', 34, 20, true),      -- Marcell Ozuna
('mlb-mock-league', 'braves', 'Michael Harris-Ford', 'CF', 24, 23, true),      -- Michael Harris II
('mlb-mock-league', 'braves', 'Ronald Acuna-Matata', 'RF', 27, 13, true),      -- Ronald Acuna Jr.
-- Pitchers (5)
('mlb-mock-league', 'braves', 'Chris Sale-Whale', 'P', 36, 51, true),          -- Chris Sale
('mlb-mock-league', 'braves', 'Spencer Strider-Glider', 'P', 26, 99, true),    -- Spencer Strider
('mlb-mock-league', 'braves', 'Reynaldo Lopez-Tacos', 'P', 31, 40, true),      -- Reynaldo Lopez
('mlb-mock-league', 'braves', 'Raisel Iglesias-Church', 'P', 35, 26, true),    -- Raisel Iglesias
('mlb-mock-league', 'braves', 'AJ Minter-Printer', 'P', 31, 33, true);        -- A.J. Minter

-- Create 13 Sample Games with Realistic Scores
INSERT INTO public.games (id, league_id, home_team_id, away_team_id, home_score, away_score, game_status, scheduled_at, started_at, completed_at) VALUES 
-- Completed Games (10)
('game-001', 'mlb-mock-league', 'yankees', 'red-sox', 8, 5, 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '3 hours'),
('game-002', 'mlb-mock-league', 'dodgers', 'mets', 7, 3, 'completed', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '3 hours'),
('game-003', 'mlb-mock-league', 'astros', 'braves', 6, 4, 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '3 hours'),
('game-004', 'mlb-mock-league', 'mets', 'yankees', 2, 9, 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '3 hours'),
('game-005', 'mlb-mock-league', 'braves', 'dodgers', 5, 8, 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '3 hours'),
('game-006', 'mlb-mock-league', 'red-sox', 'astros', 4, 7, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '3 hours'),
('game-007', 'mlb-mock-league', 'yankees', 'dodgers', 6, 6, 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '4 hours'),
('game-008', 'mlb-mock-league', 'mets', 'braves', 3, 5, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '3 hours'),
('game-009', 'mlb-mock-league', 'astros', 'red-sox', 9, 2, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
('game-010', 'mlb-mock-league', 'dodgers', 'yankees', 4, 1, 'completed', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days' + INTERVAL '3 hours'),

-- Live Games (2)  
('game-011', 'mlb-mock-league', 'braves', 'mets', 3, 2, 'in_progress', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NULL),
('game-012', 'mlb-mock-league', 'red-sox', 'yankees', 1, 4, 'in_progress', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NULL),

-- Scheduled Game (1)
('game-013', 'mlb-mock-league', 'astros', 'dodgers', 0, 0, 'scheduled', NOW() + INTERVAL '2 hours', NULL, NULL);

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
  'Mock MLB Database Setup Complete! 🏟️⚾' as status,
  '6 teams: Yankees → Pinstripes, Red Sox → Green Monsters, etc.' as teams_created,
  '78 players with humorous names (13 per team)' as players_created,
  '13 games: 10 completed, 2 live, 1 scheduled' as games_created,
  'Ready to test at /scorekeeping!' as next_step;
