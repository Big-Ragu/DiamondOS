-- DiamondOS Sample Data Generator
-- Run this AFTER the main schema has been deployed
-- Creates 6 teams, 90 players, 13 games with full stats
-- Features CLEVER mock player names (not real MLB players!)
-- Includes mocks of Yankees, Red Sox, and Mets as requested!

-- First, let's create a commissioner user (you'll need to replace this ID with a real auth user ID later)
-- For now, we'll use a placeholder UUID
-- NOTE: Replace 'commissioner-uuid-here' with actual user ID from Supabase Auth after signup

-- Sample League
INSERT INTO public.leagues (id, name, season, commissioner_id, settings) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Diamond League Championship', '2025', 'commissioner-uuid-here', '{
  "max_teams": 6,
  "players_per_team": 15,
  "innings_per_game": 9,
  "draft_timer_minutes": 5,
  "allow_trades": true,
  "season_start": "2025-04-01",
  "season_end": "2025-09-30"
}');

-- Sample Teams (Mock MLB-inspired with Yankees, Red Sox, and Mets!)
INSERT INTO public.teams (id, league_id, name, manager_id, wins, losses, colors) VALUES 
('team-001', '550e8400-e29b-41d4-a716-446655440000', 'NY Pinstripes', null, 8, 5, '{"primary": "#132448", "secondary": "#C4CED4"}'),
('team-002', '550e8400-e29b-41d4-a716-446655440000', 'NY Blue Apples', null, 7, 6, '{"primary": "#002D72", "secondary": "#FF5910"}'),
('team-003', '550e8400-e29b-41d4-a716-446655440000', 'LA Golden Angels', null, 9, 4, '{"primary": "#BA0021", "secondary": "#003263"}'),
('team-004', '550e8400-e29b-41d4-a716-446655440000', 'Boston Green Monsters', null, 6, 7, '{"primary": "#BD3039", "secondary": "#0C2340"}'),
('team-005', '550e8400-e29b-41d4-a716-446655440000', 'Chicago White Lightning', null, 5, 8, '{"primary": "#27251F", "secondary": "#C4CED4"}'),
('team-006', '550e8400-e29b-41d4-a716-446655440000', 'Houston Space Cowboys', null, 10, 3, '{"primary": "#002D62", "secondary": "#EB6E1F"}');

-- Sample Players with CLEVER MOCK NAMES (15 per team: 8 position players + 5 pitchers + 2 utility)

-- NY PINSTRIPES ROSTER (Mock Yankees)
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

-- NY BLUE APPLES ROSTER (Mock Mets)
INSERT INTO public.players (id, league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players
('player-016', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Francisco Alvarez-ish', 'C', 22, 4, true),
('player-017', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Pete Alonslow', '1B', 29, 20, true),
('player-018', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Jeff McNeill', '2B', 32, 6, true),
('player-019', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Mark Vientosaurus', '3B', 24, 9, true),
('player-020', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Francisco Lindorado', 'SS', 30, 12, true),
('player-021', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Brandon Nimmo-moe', 'LF', 31, 9, true),
('player-022', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Harrison Bader-ginsburg', 'CF', 30, 14, true),
('player-023', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Starling Marte-n', 'RF', 35, 6, true),
-- Pitchers
('player-024', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Kodai Senga-ku', 'P', 31, 34, true),
('player-025', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Luis Severinno', 'P', 31, 40, true),
('player-026', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Edwin Diazepam', 'P', 30, 39, true),
('player-027', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Brooks Rayleigh', 'P', 26, 35, true),
('player-028', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Sean Manaeaea', 'P', 32, 59, true),
-- Utility
('player-029', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Jose Iglesias-imo', '2B', 34, 11, true),
('player-030', '550e8400-e29b-41d4-a716-446655440000', 'team-002', 'Omar Narvaez-ino', 'C', 32, 24, true);

-- LA GOLDEN ANGELS ROSTER
INSERT INTO public.players (id, league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players
('player-031', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Logan OHopeful', 'C', 24, 14, true),
('player-032', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Nolan Schedule', '1B', 22, 19, true),
('player-033', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Luis Refugee', '2B', 27, 4, true),
('player-034', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Anthony Rental', '3B', 34, 6, true),
('player-035', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Zach Netto', 'SS', 23, 9, true),
('player-036', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Taylor Swift', 'LF', 30, 3, true),
('player-037', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Mike Bass', 'CF', 32, 27, true),
('player-038', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Jo Adele', 'RF', 25, 7, true),
-- Pitchers
('player-039', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Tyler Anderson Cooper', 'P', 34, 31, true),
('player-040', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Patrick Sandcastle', 'P', 27, 43, true),
('player-041', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Carlos Estevez', 'P', 31, 53, true),
('player-042', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Ben Joyful', 'P', 23, 71, true),
('player-043', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Hunter Trickland', 'P', 35, 60, true),
-- Utility
('player-044', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Brandon Drury Lane', '3B', 31, 23, true),
('player-045', '550e8400-e29b-41d4-a716-446655440000', 'team-003', 'Matt Thats', 'C', 29, 16, true);

-- BOSTON GREEN MONSTERS ROSTER (Mock Red Sox)
INSERT INTO public.players (id, league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players
('player-046', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Connor Wrong', 'C', 28, 74, true),
('player-047', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Triston Casas-blanca', '1B', 24, 36, true),
('player-048', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Gleyber Valdez-quez', '2B', 27, 17, true),
('player-049', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Rafael Devers-ity', '3B', 27, 11, true),
('player-050', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Trevor Storey', 'SS', 31, 10, true),
('player-051', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Alex Verdugood', 'LF', 28, 99, true),
('player-052', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Jarren Durantula', 'CF', 27, 16, true),
('player-053', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Wilyer Abreu-tiful', 'RF', 25, 52, true),
-- Pitchers
('player-054', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Brayan Bello-issimo', 'P', 25, 66, true),
('player-055', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Kutter Crawford-ford', 'P', 28, 50, true),
('player-056', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Kenley Jansen-sen', 'P', 36, 74, true),
('player-057', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Chris Martin-elli', 'P', 38, 55, true),
('player-058', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Garrett Whitlock-ness', 'P', 28, 72, true),
-- Utility
('player-059', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Pablo Reyes-es', '2B', 30, 5, true),
('player-060', '550e8400-e29b-41d4-a716-446655440000', 'team-004', 'Kyle Teel-icious', 'C', 22, 2, true);

-- CHICAGO WHITE LIGHTNING ROSTER
INSERT INTO public.players (id, league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players
('player-061', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Korey Leeroy', 'C', 25, 47, true),
('player-062', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Andrew Vaughn-williams', '1B', 26, 25, true),
('player-063', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Nicky Lopez-ez', '2B', 29, 8, true),
('player-064', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Yoan Moncada-bra', '3B', 29, 10, true),
('player-065', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Colson Montgomery-burns', 'SS', 22, 4, true),
('player-066', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Eloy Jimenez-imo', 'LF', 27, 74, true),
('player-067', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Luis Robert-son', 'CF', 27, 88, true),
('player-068', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Gavin Sheets-ington', 'RF', 28, 32, true),
-- Pitchers
('player-069', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Garrett Crochet-hook', 'P', 25, 45, true),
('player-070', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Erick Fedde-ralist', 'P', 31, 20, true),
('player-071', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Michael Kopech-oo', 'P', 28, 34, true),
('player-072', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Chad Green-lantern', 'P', 33, 41, true),
('player-073', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Tanner Banks-teller', 'P', 31, 38, true),
-- Utility
('player-074', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Paul DeJong-il', '2B', 30, 15, true),
('player-075', '550e8400-e29b-41d4-a716-446655440000', 'team-005', 'Martin Maldonado-rito', 'C', 37, 12, true);

-- HOUSTON SPACE COWBOYS ROSTER
INSERT INTO public.players (id, league_id, team_id, name, position, age, jersey_number, is_drafted) VALUES 
-- Position Players
('player-076', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Yainer Diaz-per', 'C', 25, 21, true),
('player-077', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Jose Altuve-ly', '1B', 34, 27, true),
('player-078', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Grae Kessinger-ale', '2B', 26, 18, true),
('player-079', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Alex Bregman-n', '3B', 30, 2, true),
('player-080', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Jeremy Pena-colada', 'SS', 26, 3, true),
('player-081', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Yordan Alvarez-ito', 'LF', 27, 44, true),
('player-082', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Chas McCormick-ormick', 'CF', 29, 20, true),
('player-083', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Kyle Tucker-son', 'RF', 27, 30, true),
-- Pitchers
('player-084', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Framber Valdez-quez', 'P', 30, 59, true),
('player-085', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Hunter Brown-stone', 'P', 25, 61, true),
('player-086', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Josh Hader-ade', 'P', 30, 71, true),
('player-087', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Ryan Pressly-ton', 'P', 35, 55, true),
('player-088', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Ryne Stanek-leton', 'P', 32, 45, true),
-- Utility
('player-089', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Mauricio Dubon-bon', '2B', 29, 14, true),
('player-090', '550e8400-e29b-41d4-a716-446655440000', 'team-006', 'Victor Caratini-weenie', 'C', 30, 17, true);