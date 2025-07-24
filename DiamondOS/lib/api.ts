import { League, Team, Player, Game, GameEvent, PlayerStats, DraftPick, User } from '@/types'

// Base API client for making requests
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url)
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Create API client instance
const api = new ApiClient()

// League API
export const leagueApi = {
  // Get all leagues for current user
  getAll: (): Promise<League[]> => api.get('/leagues'),
  
  // Create new league
  create: (data: Partial<League>): Promise<League> => api.post('/leagues', data),
  
  // Update league
  update: (id: string, data: Partial<League>): Promise<League> => 
    api.put(`/leagues?id=${id}`, data),
}

// Team API
export const teamApi = {
  // Get teams (optionally filtered by league)
  getAll: (leagueId?: string): Promise<Team[]> => 
    api.get('/teams', leagueId ? { league_id: leagueId } : undefined),
  
  // Create new team
  create: (data: Partial<Team>): Promise<Team> => api.post('/teams', data),
  
  // Update team
  update: (id: string, data: Partial<Team>): Promise<Team> => 
    api.put(`/teams?id=${id}`, data),
}

// Player API
export const playerApi = {
  // Get players (with various filters)
  getAll: (filters?: {
    team_id?: string
    league_id?: string
    is_drafted?: boolean
  }): Promise<Player[]> => api.get('/players', filters),
  
  // Create new player
  create: (data: Partial<Player>): Promise<Player> => api.post('/players', data),
  
  // Update player
  update: (id: string, data: Partial<Player>): Promise<Player> => 
    api.put(`/players?id=${id}`, data),
}

// Game API
export const gameApi = {
  // Get games (with various filters)
  getAll: (filters?: {
    league_id?: string
    team_id?: string
    status?: string
  }): Promise<Game[]> => api.get('/games', filters),
  
  // Create new game
  create: (data: Partial<Game>): Promise<Game> => api.post('/games', data),
  
  // Update game (score, status, etc.)
  update: (id: string, data: Partial<Game>): Promise<Game> => 
    api.put(`/games?id=${id}`, data),
  
  // Get live games
  getLive: (): Promise<Game[]> => api.get('/games', { status: 'in_progress' }),
}

// Game Events API (Scorekeeping)
export const gameEventApi = {
  // Get events for a game
  getForGame: (gameId: string): Promise<GameEvent[]> => 
    api.get('/game-events', { game_id: gameId }),
  
  // Submit play (dual-manager entry)
  submitPlay: (data: {
    game_id: string
    inning: number
    is_top_inning: boolean
    player_id?: string
    result: string
    runs_scored?: number
    rbi_count?: number
  }): Promise<GameEvent> => api.post('/game-events', data),
  
  // Resolve dispute (commissioner only)
  resolveDispute: (eventId: string, data: {
    commissioner_ruling: string
    runs_scored: number
    rbi_count: number
  }): Promise<GameEvent> => api.put(`/game-events?id=${eventId}`, data),
}

// Statistics API
export const statsApi = {
  // Get batting stats
  getBatting: (filters?: {
    player_id?: string
    team_id?: string
    league_id?: string
    season?: string
  }): Promise<PlayerStats[]> => api.get('/stats', { type: 'batting', ...filters }),
  
  // Get pitching stats
  getPitching: (filters?: {
    player_id?: string
    team_id?: string
    league_id?: string
    season?: string
  }): Promise<PlayerStats[]> => api.get('/stats', { type: 'pitching', ...filters }),
  
  // Recalculate stats for a player
  recalculate: (playerId: string, season: string): Promise<PlayerStats> => 
    api.post('/stats/calculate', { player_id: playerId, season }),
}

// Draft API
export const draftApi = {
  // Get draft picks for league
  getPicks: (leagueId: string): Promise<DraftPick[]> => 
    api.get('/draft', { league_id: leagueId }),
  
  // Make draft pick
  makePick: (data: {
    league_id: string
    round_number: number
    pick_number: number
    team_id: string
    player_id: string
    is_auto_pick?: boolean
  }): Promise<DraftPick> => api.post('/draft', data),
  
  // Undo draft pick (commissioner only)
  undoPick: (pickId: string): Promise<{ success: boolean }> => 
    api.delete(`/draft?id=${pickId}`),
}

// Utility functions for common operations
export const apiUtils = {
  // Get standings for a league
  getStandings: async (leagueId: string): Promise<Team[]> => {
    const teams = await teamApi.getAll(leagueId)
    return teams.sort((a, b) => {
      const aWinPct = a.wins / (a.wins + a.losses) || 0
      const bWinPct = b.wins / (b.wins + b.losses) || 0
      return bWinPct - aWinPct
    })
  },

  // Get league leaders for a stat
  getLeaders: async (leagueId: string, season: string, stat: keyof PlayerStats, limit = 5) => {
    const stats = await statsApi.getBatting({ league_id: leagueId, season })
    return stats
      .sort((a, b) => (b[stat] as number) - (a[stat] as number))
      .slice(0, limit)
  },

  // Get available players for draft
  getAvailablePlayers: async (leagueId: string): Promise<Player[]> => {
    return playerApi.getAll({ league_id: leagueId, is_drafted: false })
  },

  // Get games needing manager input
  getGamesNeedingInput: async (leagueId: string): Promise<Game[]> => {
    const games = await gameApi.getAll({ league_id: leagueId, status: 'in_progress' })
    // Additional logic to check which games need manager input
    return games
  },

  // Get disputed plays
  getDisputedPlays: async (leagueId: string): Promise<GameEvent[]> => {
    // This would need additional API endpoint or filtering
    const games = await gameApi.getAll({ league_id: leagueId })
    const allEvents: GameEvent[] = []
    
    for (const game of games) {
      const events = await gameEventApi.getForGame(game.id)
      allEvents.push(...events.filter(e => e.is_disputed))
    }
    
    return allEvents
  },
}

// Export everything
export { api }
export default {
  league: leagueApi,
  team: teamApi,
  player: playerApi,
  game: gameApi,
  gameEvent: gameEventApi,
  stats: statsApi,
  draft: draftApi,
  utils: apiUtils,
}