'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { GameState } from '@/types'

interface BoxScoreProps {
  gameState: GameState
}

export default function BoxScore({ gameState }: BoxScoreProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Box Score</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="batting" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batting">Batting</TabsTrigger>
            <TabsTrigger value="pitching">Pitching</TabsTrigger>
          </TabsList>
          
          <TabsContent value="batting" className="mt-6">
            <div className="space-y-6">
              {/* Away Team Batting */}
              <div>
                <h4 className="text-lg font-semibold mb-3">{gameState.awayTeamName} Batting</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>AB</TableHead>
                      <TableHead>R</TableHead>
                      <TableHead>H</TableHead>
                      <TableHead>RBI</TableHead>
                      <TableHead>BB</TableHead>
                      <TableHead>K</TableHead>
                      <TableHead>AVG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: gameState.awayLineupSize }, (_, i) => {
                      const playerNum = i + 1
                      const stats = gameState.playerStats.away[playerNum] || {
                        ab: 0, r: 0, h: 0, rbi: 0, bb: 0, k: 0, avg: 0.000
                      }
                      return (
                        <TableRow key={playerNum}>
                          <TableCell>{playerNum}</TableCell>
                          <TableCell>Player {playerNum}</TableCell>
                          <TableCell>{stats.ab}</TableCell>
                          <TableCell>{stats.r}</TableCell>
                          <TableCell>{stats.h}</TableCell>
                          <TableCell>{stats.rbi}</TableCell>
                          <TableCell>{stats.bb}</TableCell>
                          <TableCell>{stats.k}</TableCell>
                          <TableCell>{stats.avg.toFixed(3)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Home Team Batting */}
              <div>
                <h4 className="text-lg font-semibold mb-3">{gameState.homeTeamName} Batting</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>AB</TableHead>
                      <TableHead>R</TableHead>
                      <TableHead>H</TableHead>
                      <TableHead>RBI</TableHead>
                      <TableHead>BB</TableHead>
                      <TableHead>K</TableHead>
                      <TableHead>AVG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: gameState.homeLineupSize }, (_, i) => {
                      const playerNum = i + 1
                      const stats = gameState.playerStats.home[playerNum] || {
                        ab: 0, r: 0, h: 0, rbi: 0, bb: 0, k: 0, avg: 0.000
                      }
                      return (
                        <TableRow key={playerNum}>
                          <TableCell>{playerNum}</TableCell>
                          <TableCell>Player {playerNum}</TableCell>
                          <TableCell>{stats.ab}</TableCell>
                          <TableCell>{stats.r}</TableCell>
                          <TableCell>{stats.h}</TableCell>
                          <TableCell>{stats.rbi}</TableCell>
                          <TableCell>{stats.bb}</TableCell>
                          <TableCell>{stats.k}</TableCell>
                          <TableCell>{stats.avg.toFixed(3)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pitching" className="mt-6">
            <div className="space-y-6">
              {/* Away Team Pitching */}
              <div>
                <h4 className="text-lg font-semibold mb-3">{gameState.awayTeamName} Pitching</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pitcher</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>H</TableHead>
                      <TableHead>R</TableHead>
                      <TableHead>ER</TableHead>
                      <TableHead>BB</TableHead>
                      <TableHead>K</TableHead>
                      <TableHead>ERA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Starter</TableCell>
                      <TableCell>
                        {Math.floor(gameState.pitcherStats.away.ip / 3)}.{gameState.pitcherStats.away.ip % 3}
                      </TableCell>
                      <TableCell>{gameState.pitcherStats.away.h}</TableCell>
                      <TableCell>{gameState.pitcherStats.away.r}</TableCell>
                      <TableCell>{gameState.pitcherStats.away.er}</TableCell>
                      <TableCell>{gameState.pitcherStats.away.bb}</TableCell>
                      <TableCell>{gameState.pitcherStats.away.k}</TableCell>
                      <TableCell>
                        {gameState.pitcherStats.away.ip > 0 
                          ? ((gameState.pitcherStats.away.er * 27) / gameState.pitcherStats.away.ip).toFixed(2)
                          : '0.00'
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Home Team Pitching */}
              <div>
                <h4 className="text-lg font-semibold mb-3">{gameState.homeTeamName} Pitching</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pitcher</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>H</TableHead>
                      <TableHead>R</TableHead>
                      <TableHead>ER</TableHead>
                      <TableHead>BB</TableHead>
                      <TableHead>K</TableHead>
                      <TableHead>ERA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Starter</TableCell>
                      <TableCell>
                        {Math.floor(gameState.pitcherStats.home.ip / 3)}.{gameState.pitcherStats.home.ip % 3}
                      </TableCell>
                      <TableCell>{gameState.pitcherStats.home.h}</TableCell>
                      <TableCell>{gameState.pitcherStats.home.r}</TableCell>
                      <TableCell>{gameState.pitcherStats.home.er}</TableCell>
                      <TableCell>{gameState.pitcherStats.home.bb}</TableCell>
                      <TableCell>{gameState.pitcherStats.home.k}</TableCell>
                      <TableCell>
                        {gameState.pitcherStats.home.ip > 0 
                          ? ((gameState.pitcherStats.home.er * 27) / gameState.pitcherStats.home.ip).toFixed(2)
                          : '0.00'
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}