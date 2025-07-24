'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Plus } from 'lucide-react'

import type { GameState } from '@/types'

interface PitchCounterProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onAddToLog: (text: string, category?: string) => void
}

export default function PitchCounter({ gameState, setGameState, onAddToLog }: PitchCounterProps) {
  const addBall = () => {
    setGameState(prev => {
      const newBalls = prev.balls + 1
      
      if (newBalls >= 4) {
        // Automatic walk
        onAddToLog('Ball 4 - Automatic Walk (BB)', 'Pitch')
        return {
          ...prev,
          balls: 0,
          strikes: 0
        }
      } else {
        onAddToLog(`Ball ${newBalls}`, 'Pitch')
        return {
          ...prev,
          balls: newBalls
        }
      }
    })
  }

  const addStrike = () => {
    setGameState(prev => {
      const newStrikes = prev.strikes + 1
      
      if (newStrikes >= 3) {
        // Automatic strikeout
        onAddToLog('Strike 3 - Automatic Strikeout (K)', 'Pitch')
        return {
          ...prev,
          balls: 0,
          strikes: 0
        }
      } else {
        onAddToLog(`Strike ${newStrikes}`, 'Pitch')
        return {
          ...prev,
          strikes: newStrikes
        }
      }
    })
  }

  const resetCount = () => {
    setGameState(prev => ({
      ...prev,
      balls: 0,
      strikes: 0
    }))
    onAddToLog('Count reset to 0-0', 'Pitch')
  }

  const getCountStatus = () => {
    if (gameState.balls === 3 && gameState.strikes === 2) {
      return 'full'
    } else if (gameState.strikes === 2) {
      return 'danger'
    } else if (gameState.balls === 3) {
      return 'warning'
    }
    return 'normal'
  }

  const countStatus = getCountStatus()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          ⚾ Pitch Count
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-600 mb-2">Balls</div>
              <Badge 
                variant={countStatus === 'warning' || countStatus === 'full' ? 'destructive' : 'outline'}
                className="text-2xl px-4 py-2"
              >
                {gameState.balls}
              </Badge>
            </div>
            
            <div className="text-4xl text-slate-300">-</div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-600 mb-2">Strikes</div>
              <Badge 
                variant={countStatus === 'danger' || countStatus === 'full' ? 'destructive' : 'outline'}
                className="text-2xl px-4 py-2"
              >
                {gameState.strikes}
              </Badge>
            </div>
          </div>

          {countStatus === 'full' && (
            <div className="text-lg font-semibold text-red-600 animate-pulse">
              Full Count!
            </div>
          )}
          {countStatus === 'danger' && gameState.balls < 3 && (
            <div className="text-lg font-semibold text-orange-600">
              Two Strikes
            </div>
          )}
          {countStatus === 'warning' && gameState.strikes < 2 && (
            <div className="text-lg font-semibold text-yellow-600">
              Three Balls
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={addBall} variant="outline" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Ball
          </Button>
          
          <Button onClick={addStrike} variant="outline" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Strike
          </Button>
          
          <Button onClick={resetCount} variant="outline" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Count
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-600">
          <p>Automatic actions occur at 4 balls (walk) or 3 strikes (strikeout)</p>
        </div>
      </CardContent>
    </Card>
  )
}