'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Clock, Users, Target, RotateCcw, Play, Pause, Home } from 'lucide-react'
import Link from 'next/link'

import GameSetup from '@/components/scorekeeping/GameSetup'
import ScoreDisplay from '@/components/scorekeeping/ScoreDisplay'
import PitchCounter from '@/components/scorekeeping/PitchCounter'
import BaseballField from '@/components/scorekeeping/BaseballField'
import ManagerInput from '@/components/scorekeeping/ManagerInput'
import BoxScore from '@/components/scorekeeping/BoxScore'
import GameLog from '@/components/scorekeeping/GameLog'

import type { Game, Team, Player, GameEvent, GameState } from '@/types'

export default function ScorekeepingPage() {
  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    currentInning: 1,
    isTopInning: true,
    homeScore: 0,
    awayScore: 0,
    currentOuts: 0,
    balls: 0,
    strikes: 0,
    homeBatter: 1,
    awayBatter: 1,
    homeLineupSize: 9,
    awayLineupSize: 9,
    homeTeamName: '',
    awayTeamName: '',
    runners: {
      first: null,
      second: null,
      third: null
    },
    manager1Submission: null,
    manager2Submission: null,
    totalPlays: 0,
    inningErrorOccurred: false,
    errorWith2Outs: false,
    playerStats: {
      home: {},
      away: {}
    },
    pitcherStats: {
      home: {
        ip: 0,
        h: 0,
        r: 0,
        er: 0,
        bb: 0,
        k: 0
      },
      away: {
        ip: 0,
        h: 0,
        r: 0,
        er: 0,
        bb: 0,
        k: 0
      }
    }
  })

  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [gameLog, setGameLog] = useState<string[]>([])
  const [currentGame, setCurrentGame] = useState<Game | null>(null)

  // Load teams and players on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const teamsResponse = await fetch('/api/teams')
        const teamsData = await teamsResponse.json()
        setTeams(teamsData)

        const playersResponse = await fetch('/api/players')
        const playersData = await playersResponse.json()
        setPlayers(playersData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  const getCurrentBatter = () => {
    return gameState.isTopInning ? gameState.awayBatter : gameState.homeBatter
  }

  const getCurrentTeamName = () => {
    return gameState.isTopInning ? gameState.awayTeamName : gameState.homeTeamName
  }

  const addToGameLog = (text: string, category: string = 'Play') => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${category}: ${text} (${timestamp})`
    setGameLog(prev => [logEntry, ...prev])
  }

  const startGame = async (homeTeamName: string, awayTeamName: string, homeLineup: number, awayLineup: number) => {
    try {
      // Find team IDs from the teams array or use the names directly for demo
      const homeTeamId = teams.find(t => t.name === homeTeamName)?.id || homeTeamName
      const awayTeamId = teams.find(t => t.name === awayTeamName)?.id || awayTeamName

      // Only try to create in database if we have real teams loaded
      if (teams.length > 0) {
        const gameData = {
          league_id: 'default-league-id',
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          scheduled_at: new Date().toISOString()
        }

        const response = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gameData)
        })

        if (response.ok) {
          const game = await response.json()
          setCurrentGame(game)
        }
      } else {
        // Demo mode - create a mock game object
        setCurrentGame({
          id: 'demo-game-' + Date.now(),
          league_id: 'demo',
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          home_score: 0,
          away_score: 0,
          current_inning: 1,
          is_top_inning: true,
          game_status: 'in_progress',
          scheduled_at: new Date().toISOString()
        })
      }

      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        homeTeamName: homeTeamName,
        awayTeamName: awayTeamName,
        homeLineupSize: homeLineup,
        awayLineupSize: awayLineup
      }))

      addToGameLog(`Game started: ${awayTeamName} at ${homeTeamName}`, 'Game')
    } catch (error) {
      console.error('Error starting game:', error)
      // Fallback to demo mode if API fails
      setCurrentGame({
        id: 'demo-game-' + Date.now(),
        league_id: 'demo',
        home_team_id: homeTeamName,
        away_team_id: awayTeamName,
        home_score: 0,
        away_score: 0,
        current_inning: 1,
        is_top_inning: true,
        game_status: 'in_progress',
        scheduled_at: new Date().toISOString()
      })

      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        homeTeamName: homeTeamName,
        awayTeamName: awayTeamName,
        homeLineupSize: homeLineup,
        awayLineupSize: awayLineup
      }))

      addToGameLog(`Game started: ${awayTeamName} at ${homeTeamName}`, 'Game')
    }
  }

  const submitPlay = async (managerNum: number, result: string) => {
    try {
      if (!currentGame) return

      const submission = {
        result,
        timestamp: new Date().toISOString(),
        managerNumber: managerNum
      }

      // Store manager submission
      if (managerNum === 1) {
        setGameState(prev => ({ ...prev, manager1Submission: submission }))
      } else {
        setGameState(prev => ({ ...prev, manager2Submission: submission }))
      }

      // Check if both managers have submitted
      const bothSubmitted = (managerNum === 1 && gameState.manager2Submission) || 
                          (managerNum === 2 && gameState.manager1Submission)

      if (bothSubmitted) {
        await processPlay()
      }

    } catch (error) {
      console.error('Error submitting play:', error)
    }
  }

  const processPlay = async () => {
    if (!gameState.manager1Submission || !gameState.manager2Submission || !currentGame) return

    const isConflict = gameState.manager1Submission.result !== gameState.manager2Submission.result

    let finalResult = gameState.manager1Submission.result

    if (isConflict) {
      // Handle conflict - for now, use manager 1's input
      addToGameLog(`Conflict detected! Using Manager 1 input: ${finalResult}`, 'Conflict')
    }

    try {
      // Submit game event to API
      const eventData = {
        game_id: currentGame.id,
        inning: gameState.currentInning,
        is_top_inning: gameState.isTopInning,
        player_id: getCurrentBatter(), // This would need proper player ID
        event_type: 'at_bat',
        result: finalResult,
        manager1_input: gameState.manager1Submission.result,
        manager2_input: gameState.manager2Submission.result,
        is_disputed: isConflict
      }

      const response = await fetch('/api/game-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        // Update game state based on play result
        updateGameStateAfterPlay(finalResult)
        addToGameLog(`${getCurrentTeamName()} Batter #${getCurrentBatter()}: ${finalResult}`, 'At-Bat')
      }

    } catch (error) {
      console.error('Error processing play:', error)
    }

    // Reset submissions
    setGameState(prev => ({
      ...prev,
      manager1Submission: null,
      manager2Submission: null
    }))
  }

  const updateGameStateAfterPlay = (result: string) => {
    // This would contain the complex game logic from the original HTML
    // For now, just advance the batter and inning logic
    setGameState(prev => {
      const newState = { ...prev }
      
      // Simple logic - would be expanded with full baseball rules
      if (result.includes('K') || result.includes('F') || result.includes('L') || result.includes('P')) {
        newState.currentOuts++
      }

      if (newState.currentOuts >= 3) {
        newState.currentOuts = 0
        newState.isTopInning = !newState.isTopInning
        if (newState.isTopInning) {
          newState.currentInning++
        }
      }

      // Advance batter
      if (newState.isTopInning) {
        newState.awayBatter = newState.awayBatter < newState.awayLineupSize ? newState.awayBatter + 1 : 1
      } else {
        newState.homeBatter = newState.homeBatter < newState.homeLineupSize ? newState.homeBatter + 1 : 1
      }

      return newState
    })
  }

  if (!gameState.gameStarted) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">⚾ Baseball Scorekeeping</h1>
              <p className="text-slate-600">Dual Manager System for Accurate Game Tracking</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        <GameSetup 
          teams={teams} 
          onStartGame={startGame}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">⚾ Live Game Scorekeeping</h1>
            <p className="text-slate-600">{gameState.awayTeamName} at {gameState.homeTeamName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause Game
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <ScoreDisplay gameState={gameState} />

      {/* Pitch Counter */}
      <PitchCounter 
        gameState={gameState}
        setGameState={setGameState}
        onAddToLog={addToGameLog}
      />

      {/* Baseball Field */}
      <BaseballField 
        gameState={gameState}
        setGameState={setGameState}
        onAddToLog={addToGameLog}
      />

      {/* Manager Input Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ManagerInput
          managerNumber={1}
          gameState={gameState}
          onSubmitPlay={submitPlay}
        />
        <ManagerInput
          managerNumber={2}
          gameState={gameState}
          onSubmitPlay={submitPlay}
        />
      </div>

      {/* Tabs for Box Score and Game Log */}
      <Tabs defaultValue="boxscore" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="boxscore">Box Score</TabsTrigger>
          <TabsTrigger value="gamelog">Game Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="boxscore" className="mt-6">
          <BoxScore gameState={gameState} />
        </TabsContent>
        
        <TabsContent value="gamelog" className="mt-6">
          <GameLog gameLog={gameLog} />
        </TabsContent>
      </Tabs>
    </div>
  )
}