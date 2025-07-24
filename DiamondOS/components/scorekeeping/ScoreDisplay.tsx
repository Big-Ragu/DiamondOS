'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Target, Clock } from 'lucide-react'

import type { GameState } from '@/types'

interface ScoreDisplayProps {
  gameState: GameState
}

export default function ScoreDisplay({ gameState }: ScoreDisplayProps) {
  const getInningDisplay = () => {
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
    const inningText = ordinals[gameState.currentInning] || `${gameState.currentInning}th`
    return `${gameState.isTopInning ? 'Top' : 'Bottom'} ${inningText}`
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Main Scoreboard */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {getInningDisplay()}
          </div>
          <div className="flex justify-center items-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-600">{gameState.awayTeamName}</div>
              <div className="text-4xl font-bold text-slate-900">{gameState.awayScore}</div>
            </div>
            <div className="text-2xl text-slate-400">@</div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-600">{gameState.homeTeamName}</div>
              <div className="text-4xl font-bold text-slate-900">{gameState.homeScore}</div>
            </div>
          </div>
        </div>

        {/* Game Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Current Batter:</span>
            <Badge variant="outline">
              #{gameState.isTopInning ? gameState.awayBatter : gameState.homeBatter}
            </Badge>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Outs:</span>
            <Badge variant={gameState.currentOuts === 2 ? "destructive" : "outline"}>
              {gameState.currentOuts}
            </Badge>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Team Batting:</span>
            <Badge variant="secondary">
              {gameState.isTopInning ? gameState.awayTeamName : gameState.homeTeamName}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}