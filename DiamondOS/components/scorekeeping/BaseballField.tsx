'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { GameState } from '@/types'

interface BaseballFieldProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onAddToLog: (text: string, category?: string) => void
}

export default function BaseballField({ gameState, setGameState, onAddToLog }: BaseballFieldProps) {
  const manageRunner = (base: 'first' | 'second' | 'third') => {
    const runner = gameState.runners[base]
    const baseNames = { first: '1st Base', second: '2nd Base', third: '3rd Base' }
    
    if (!runner) {
      // Add runner (simplified - would show modal in full implementation)
      const batterNum = prompt(`Enter batter number for ${baseNames[base]}:`)
      if (batterNum && !isNaN(Number(batterNum))) {
        setGameState(prev => ({
          ...prev,
          runners: {
            ...prev.runners,
            [base]: Number(batterNum)
          }
        }))
        onAddToLog(`Runner #${batterNum} placed on ${base} base`, 'Manual')
      }
    } else {
      // Remove runner (simplified)
      const confirm = window.confirm(`Remove runner #${runner} from ${baseNames[base]}?`)
      if (confirm) {
        setGameState(prev => ({
          ...prev,
          runners: {
            ...prev.runners,
            [base]: null
          }
        }))
        onAddToLog(`Runner #${runner} removed from ${base} base`, 'Manual')
      }
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">⚾ Baseball Diamond</CardTitle>
        <p className="text-center text-sm text-slate-600">Click bases to manage runners</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="relative w-80 h-80">
            {/* Baseball Diamond */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Diamond outline */}
              <path
                d="M100 170 L30 100 L100 30 L170 100 Z"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                className="opacity-50"
              />
              
              {/* Pitcher's mound */}
              <circle cx="100" cy="115" r="8" fill="#8b5cf6" className="opacity-30" />
              
              {/* Base paths */}
              <line x1="100" y1="170" x2="30" y2="100" stroke="#22c55e" strokeWidth="1" className="opacity-30" />
              <line x1="30" y1="100" x2="100" y2="30" stroke="#22c55e" strokeWidth="1" className="opacity-30" />
              <line x1="100" y1="30" x2="170" y2="100" stroke="#22c55e" strokeWidth="1" className="opacity-30" />
              <line x1="170" y1="100" x2="100" y2="170" stroke="#22c55e" strokeWidth="1" className="opacity-30" />
            </svg>

            {/* Home Plate */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-slate-200 border-2 border-slate-400 transform rotate-45 flex items-center justify-center">
                <span className="text-xs font-bold transform -rotate-45">H</span>
              </div>
              <div className="text-center text-xs mt-1 font-semibold">Home</div>
            </div>

            {/* First Base */}
            <div className="absolute bottom-1/4 right-4">
              <button
                onClick={() => manageRunner('first')}
                className={cn(
                  "w-8 h-8 border-2 transform rotate-45 flex items-center justify-center cursor-pointer transition-all hover:scale-110",
                  gameState.runners.first
                    ? "bg-green-100 border-green-500 shadow-lg"
                    : "bg-white border-slate-400 hover:border-blue-500"
                )}
              >
                <span className="text-xs font-bold transform -rotate-45">1B</span>
              </button>
              <div className="text-center text-xs mt-1">
                {gameState.runners.first ? (
                  <Badge variant="secondary" className="text-xs"># {gameState.runners.first}</Badge>
                ) : (
                  <span className="text-slate-500">Empty</span>
                )}
              </div>
            </div>

            {/* Second Base */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => manageRunner('second')}
                className={cn(
                  "w-8 h-8 border-2 transform rotate-45 flex items-center justify-center cursor-pointer transition-all hover:scale-110",
                  gameState.runners.second
                    ? "bg-green-100 border-green-500 shadow-lg"
                    : "bg-white border-slate-400 hover:border-blue-500"
                )}
              >
                <span className="text-xs font-bold transform -rotate-45">2B</span>
              </button>
              <div className="text-center text-xs mt-1">
                {gameState.runners.second ? (
                  <Badge variant="secondary" className="text-xs"># {gameState.runners.second}</Badge>
                ) : (
                  <span className="text-slate-500">Empty</span>
                )}
              </div>
            </div>

            {/* Third Base */}
            <div className="absolute bottom-1/4 left-4">
              <button
                onClick={() => manageRunner('third')}
                className={cn(
                  "w-8 h-8 border-2 transform rotate-45 flex items-center justify-center cursor-pointer transition-all hover:scale-110",
                  gameState.runners.third
                    ? "bg-green-100 border-green-500 shadow-lg"
                    : "bg-white border-slate-400 hover:border-blue-500"
                )}
              >
                <span className="text-xs font-bold transform -rotate-45">3B</span>
              </button>
              <div className="text-center text-xs mt-1">
                {gameState.runners.third ? (
                  <Badge variant="secondary" className="text-xs"># {gameState.runners.third}</Badge>
                ) : (
                  <span className="text-slate-500">Empty</span>
                )}
              </div>
            </div>

            {/* Pitcher */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-3">
              <div className="w-6 h-6 bg-purple-100 border-2 border-purple-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">P</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-slate-600">
          <p><strong>Instructions:</strong> Click on any base to add, remove, or manage runners</p>
          <p>Green bases indicate active runners</p>
        </div>
      </CardContent>
    </Card>
  )
}