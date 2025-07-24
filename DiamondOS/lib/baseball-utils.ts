/**
 * Baseball-specific utility functions for formatting stats and calculations
 */

// Format batting average to 3 decimal places
export function formatBattingAverage(average: number): string {
  if (isNaN(average) || average < 0) return '.000'
  return average.toFixed(3)
}

// Format ERA to 2 decimal places
export function formatERA(era: number): string {
  if (isNaN(era) || era < 0) return '0.00'
  return era.toFixed(2)
}

// Format numbers with commas for readability
export function formatNumber(num: number): string {
  if (isNaN(num)) return '0'
  return num.toLocaleString()
}

// Calculate batting average
export function calculateBattingAverage(hits: number, atBats: number): number {
  if (atBats === 0) return 0
  return hits / atBats
}

// Calculate ERA (Earned Run Average)
export function calculateERA(earnedRuns: number, inningsPitched: number): number {
  if (inningsPitched === 0) return 0
  return (earnedRuns * 9) / inningsPitched
}

// Calculate OBP (On-Base Percentage)
export function calculateOBP(hits: number, walks: number, hbp: number, atBats: number, sacrificeFlies: number = 0): number {
  const plateAppearances = atBats + walks + hbp + sacrificeFlies
  if (plateAppearances === 0) return 0
  return (hits + walks + hbp) / plateAppearances
}

// Calculate SLG (Slugging Percentage)
export function calculateSLG(singles: number, doubles: number, triples: number, homeRuns: number, atBats: number): number {
  if (atBats === 0) return 0
  const totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4)
  return totalBases / atBats
}

// Calculate OPS (On-Base Plus Slugging)
export function calculateOPS(obp: number, slg: number): number {
  return obp + slg
}

// Format win percentage
export function formatWinPercentage(wins: number, losses: number): string {
  const total = wins + losses
  if (total === 0) return '.000'
  return (wins / total).toFixed(3)
}

// Calculate games behind
export function calculateGamesBehind(teamWins: number, teamLosses: number, leaderWins: number, leaderLosses: number): string {
  const teamPct = teamWins / (teamWins + teamLosses)
  const leaderPct = leaderWins / (leaderWins + leaderLosses)
  const gamesBehind = ((leaderWins - teamWins) + (teamLosses - leaderLosses)) / 2
  
  if (gamesBehind <= 0) return '-'
  return gamesBehind.toFixed(1)
}

// Format inning display (e.g., "Top 7th", "Bot 9th")
export function formatInning(inning: number, isTop: boolean): string {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
  const suffix = inning > 9 ? `${inning}th` : ordinals[inning]
  return `${isTop ? 'Top' : 'Bot'} ${suffix}`
}

// Validate and format pitch count
export function formatPitchCount(balls: number, strikes: number): string {
  const b = Math.max(0, Math.min(4, balls))
  const s = Math.max(0, Math.min(3, strikes))
  return `${b}-${s}`
}

// Position abbreviations and full names
export const POSITIONS = {
  'P': 'Pitcher',
  'C': 'Catcher',
  '1B': 'First Base',
  '2B': 'Second Base',
  '3B': 'Third Base',
  'SS': 'Shortstop',
  'LF': 'Left Field',
  'CF': 'Center Field',
  'RF': 'Right Field',
  'DH': 'Designated Hitter'
} as const

export type Position = keyof typeof POSITIONS

// Get full position name
export function getPositionName(abbreviation: Position): string {
  return POSITIONS[abbreviation] || abbreviation
}

// Team name utilities
export function getTeamAbbreviation(teamName: string): string {
  return teamName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3)
}

// Game status helpers
export type GameStatus = 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled'

export function getGameStatusColor(status: GameStatus): string {
  switch (status) {
    case 'live': return 'text-red-500'
    case 'final': return 'text-gray-500'
    case 'scheduled': return 'text-blue-500'
    case 'postponed': return 'text-yellow-500'
    case 'cancelled': return 'text-red-700'
    default: return 'text-gray-500'
  }
}

// Date formatting for baseball schedules
export function formatGameDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function formatGameTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}