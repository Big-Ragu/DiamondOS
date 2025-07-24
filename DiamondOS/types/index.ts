// Core DiamondOS Types

export interface League {
  id: string
  name: string
  season: string
  commissioner_id: string
  settings: LeagueSettings
  created_at: string
  updated_at: string
}

export interface LeagueSettings {
  max_teams: number
  players_per_team: number
  innings_per_game: number
  draft_timer_minutes: number
  allow_trades: boolean
  season_start: string
  season_end: string
}

export interface Team {
  id: string
  league_id: string
  name: string
  manager_id: string
  wins: number
  losses: number
  colors: {
    primary: string
    secondary: string
  }
  logo_url?: string
  created_at: string
}

export interface Player {
  id: string
  team_id: string | null
  name: string
  position: Position
  age?: number
  jersey_number?: number
  is_drafted: boolean
  draft_round?: number
  draft_pick?: number
  created_at: string
}

export type Position = 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'P'

export interface Game {
  id: string
  league_id: string
  home_team_id: string
  away_team_id: string
  home_score: number
  away_score: number
  current_inning: number
  is_top_inning: boolean
  game_status: GameStatus
  scheduled_at: string
  started_at?: string
  completed_at?: string
}

export type GameStatus = 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled'

export interface GameEvent {
  id: string
  game_id: string
  inning: number
  is_top_inning: boolean
  player_id: string
  event_type: EventType
  result: string
  runs_scored: number
  rbi_count: number
  manager1_input?: string
  manager2_input?: string
  is_disputed: boolean
  created_at: string
}

export type EventType = 'at_bat' | 'pitching_change' | 'substitution' | 'dispute' | 'timeout'

export interface PlayerStats {
  player_id: string
  season: string
  games_played: number
  at_bats: number
  hits: number
  runs: number
  rbis: number
  home_runs: number
  doubles: number
  triples: number
  walks: number
  strikeouts: number
  stolen_bases: number
  caught_stealing: number
  batting_average: number
  on_base_percentage: number
  slugging_percentage: number
  ops: number
}

export interface PitchingStats {
  player_id: string
  season: string
  games_pitched: number
  innings_pitched: number // stored as thirds (e.g., 21 = 7.0 innings)
  hits_allowed: number
  runs_allowed: number
  earned_runs: number
  walks_allowed: number
  strikeouts: number
  wins: number
  losses: number
  saves: number
  era: number
  whip: number
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  leagues: string[] // league IDs user has access to
  created_at: string
}

export type UserRole = 'commissioner' | 'manager' | 'parent' | 'admin'

export interface DraftPick {
  id: string
  league_id: string
  round_number: number
  pick_number: number
  team_id: string
  player_id: string
  pick_time: string
  is_auto_pick: boolean
}

// Form Types
export interface GameSubmission {
  manager_id: string
  result: string
  timestamp: string
}

export interface ConflictResolution {
  game_event_id: string
  manager1_input: string
  manager2_input: string
  commissioner_ruling?: string
  resolved_at?: string
}

// Scorekeeping Types
export interface GameState {
  gameStarted: boolean
  currentInning: number
  isTopInning: boolean
  homeScore: number
  awayScore: number
  currentOuts: number
  balls: number
  strikes: number
  homeBatter: number
  awayBatter: number
  homeLineupSize: number
  awayLineupSize: number
  homeTeamName: string
  awayTeamName: string
  runners: {
    first: number | null
    second: number | null
    third: number | null
  }
  manager1Submission: ManagerSubmission | null
  manager2Submission: ManagerSubmission | null
  totalPlays: number
  inningErrorOccurred: boolean
  errorWith2Outs: boolean
  playerStats: {
    home: Record<number, PlayerGameStats>
    away: Record<number, PlayerGameStats>
  }
  pitcherStats: {
    home: PitcherGameStats
    away: PitcherGameStats
  }
}

export interface ManagerSubmission {
  result: string
  timestamp: string
  managerNumber: number
}

export interface PlayerGameStats {
  ab: number      // at bats
  r: number       // runs
  h: number       // hits
  rbi: number     // RBIs
  bb: number      // walks
  k: number       // strikeouts
  avg: number     // batting average
}

export interface PitcherGameStats {
  ip: number      // innings pitched (in thirds)
  h: number       // hits allowed
  r: number       // runs allowed
  er: number      // earned runs allowed
  bb: number      // walks allowed
  k: number       // strikeouts
}