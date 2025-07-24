-- DiamondOS Database Reset Script
-- Run this FIRST to clean up any existing data/schema
-- Then run schema.sql and sample_data.sql fresh

-- Drop all tables in reverse dependency order
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

-- Drop any custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Clean up any remaining sequences
DROP SEQUENCE IF EXISTS leagues_id_seq CASCADE;
DROP SEQUENCE IF EXISTS teams_id_seq CASCADE;
DROP SEQUENCE IF EXISTS players_id_seq CASCADE;
DROP SEQUENCE IF EXISTS games_id_seq CASCADE;
DROP SEQUENCE IF EXISTS game_events_id_seq CASCADE;
DROP SEQUENCE IF EXISTS player_stats_id_seq CASCADE;
DROP SEQUENCE IF EXISTS pitching_stats_id_seq CASCADE;
DROP SEQUENCE IF EXISTS draft_picks_id_seq CASCADE;
DROP SEQUENCE IF EXISTS league_memberships_id_seq CASCADE;

-- Success message
SELECT 'Database cleaned! Now run schema.sql and sample_data.sql' as status;