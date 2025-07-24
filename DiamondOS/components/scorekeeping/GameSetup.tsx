'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play } from 'lucide-react'

import type { Team } from '@/types'

interface GameSetupProps {
  teams: Team[]
  onStartGame: (homeTeam: string, awayTeam: string, homeLineup: number, awayLineup: number) => void
}

export default function GameSetup({ teams, onStartGame }: GameSetupProps) {
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [homeLineupSize, setHomeLineupSize] = useState(9)
  const [awayLineupSize, setAwayLineupSize] = useState(9)

  // Fallback demo teams if none provided
  const demoTeams = [
    { id: '1', name: 'Thunder Bolts', league_id: 'demo' },
    { id: '2', name: 'Fire Dragons', league_id: 'demo' },
    { id: '3', name: 'Ice Wolves', league_id: 'demo' },
    { id: '4', name: 'Storm Eagles', league_id: 'demo' },
    { id: '5', name: 'Wild Cats', league_id: 'demo' },
    { id: '6', name: 'Lightning Strikes', league_id: 'demo' }
  ]

  const teamsToUse = teams && teams.length > 0 ? teams : demoTeams

  const handleStartGame = () => {
    if (!homeTeam || !awayTeam) {
      alert('Please select both teams')
      return
    }
    
    if (homeTeam === awayTeam) {
      alert('Home and away teams must be different')
      return
    }

    // Find team names from the teams array
    const homeTeamName = teamsToUse.find(t => t.id === homeTeam)?.name || `Team ${homeTeam}`
    const awayTeamName = teamsToUse.find(t => t.id === awayTeam)?.name || `Team ${awayTeam}`

    onStartGame(homeTeamName, awayTeamName, homeLineupSize, awayLineupSize)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">⚾ Game Setup</CardTitle>
        <p className="text-slate-600">Configure teams and lineups for the game</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Home Team */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">🏠 Home Team</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="homeTeam">Team Name</Label>
              <Select value={homeTeam} onValueChange={setHomeTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select home team..." />
                </SelectTrigger>
                <SelectContent>
                  {teamsToUse.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeLineup">Batting Order Size</Label>
              <Select value={homeLineupSize.toString()} onValueChange={(value) => setHomeLineupSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9 Players (Standard)</SelectItem>
                  <SelectItem value="10">10 Players (DH League)</SelectItem>
                  <SelectItem value="11">11 Players</SelectItem>
                  <SelectItem value="12">12 Players</SelectItem>
                  <SelectItem value="13">13 Players</SelectItem>
                  <SelectItem value="14">14 Players</SelectItem>
                  <SelectItem value="15">15 Players (Max)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Away Team */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">✈️ Away Team</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="awayTeam">Team Name</Label>
              <Select value={awayTeam} onValueChange={setAwayTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select away team..." />
                </SelectTrigger>
                <SelectContent>
                  {teamsToUse.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="awayLineup">Batting Order Size</Label>
              <Select value={awayLineupSize.toString()} onValueChange={(value) => setAwayLineupSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9 Players (Standard)</SelectItem>
                  <SelectItem value="10">10 Players (DH League)</SelectItem>
                  <SelectItem value="11">11 Players</SelectItem>
                  <SelectItem value="12">12 Players</SelectItem>
                  <SelectItem value="13">13 Players</SelectItem>
                  <SelectItem value="14">14 Players</SelectItem>
                  <SelectItem value="15">15 Players (Max)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleStartGame} size="lg" className="px-8">
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-2">Game Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
            <div><strong>Game Type:</strong> Regular Season</div>
            <div><strong>Innings:</strong> 9 (or extra if tied)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}