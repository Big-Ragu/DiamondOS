'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface GameLogProps {
  gameLog: string[]
}

export default function GameLog({ gameLog }: GameLogProps) {
  const getLogEntryType = (entry: string) => {
    if (entry.includes('Game:')) return 'game'
    if (entry.includes('At-Bat:')) return 'atbat'
    if (entry.includes('Pitch:')) return 'pitch'
    if (entry.includes('Conflict:')) return 'conflict'
    if (entry.includes('Manual:')) return 'manual'
    if (entry.includes('Inning:')) return 'inning'
    return 'default'
  }

  const getLogEntryVariant = (type: string) => {
    switch (type) {
      case 'game': return 'default'
      case 'atbat': return 'secondary'
      case 'pitch': return 'outline'
      case 'conflict': return 'destructive'
      case 'manual': return 'secondary'
      case 'inning': return 'default'
      default: return 'outline'
    }
  }

  const getLogEntryIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮'
      case 'atbat': return '⚾'
      case 'pitch': return '🎯'
      case 'conflict': return '⚠️'
      case 'manual': return '✏️'
      case 'inning': return '🔄'
      default: return '📝'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Game Log</CardTitle>
        <p className="text-sm text-slate-600">
          Real-time tracking of all game events and plays
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          {gameLog.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No game events yet</p>
              <p className="text-sm">Events will appear here as the game progresses</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gameLog.map((entry, index) => {
                const type = getLogEntryType(entry)
                const variant = getLogEntryVariant(type) as any
                const icon = getLogEntryIcon(type)
                
                // Extract the main text and timestamp
                const parts = entry.split(' (')
                const mainText = parts[0]
                const timestamp = parts[1]?.replace(')', '') || ''

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border"
                  >
                    <div className="text-lg">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        {mainText}
                      </div>
                      {timestamp && (
                        <div className="text-xs text-slate-500 mt-1">
                          {timestamp}
                        </div>
                      )}
                    </div>
                    <Badge variant={variant} className="text-xs">
                      {type.toUpperCase()}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Log Entry Types:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
            <div>🎮 Game events</div>
            <div>⚾ At-bat results</div>
            <div>🎯 Pitch counts</div>
            <div>⚠️ Conflicts</div>
            <div>✏️ Manual edits</div>
            <div>🔄 Inning changes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}