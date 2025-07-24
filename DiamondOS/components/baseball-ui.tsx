"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { formatBattingAverage, formatERA, formatNumber } from "@/lib/baseball-utils"

// Player Position Badge
interface PositionBadgeProps {
  position: string
  className?: string
}

export function PositionBadge({ position, className }: PositionBadgeProps) {
  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'P': return 'bg-red-500 text-white'
      case 'C': return 'bg-orange-500 text-white'
      case '1B': case '2B': case '3B': case 'SS': return 'bg-blue-500 text-white'
      case 'LF': case 'CF': case 'RF': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <Badge 
      className={cn(getPositionColor(position), className)}
    >
      {position}
    </Badge>
  )
}

// Team Logo/Avatar Component
interface TeamAvatarProps {
  teamName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TeamAvatar({ teamName, size = 'md', className }: TeamAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-xl'
  }

  const getTeamEmoji = (name: string) => {
    if (name.includes('Thunder')) return '⚡'
    if (name.includes('Fire')) return '🔥'
    if (name.includes('Ice')) return '🧊'
    if (name.includes('Storm')) return '🌪️'
    if (name.includes('Wild')) return '🐾'
    if (name.includes('Lightning')) return '⚡'
    return '⚾'
  }

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-baseball-primary text-white font-bold",
      sizeClasses[size],
      className
    )}>
      {getTeamEmoji(teamName)}
    </div>
  )
}

// Baseball Statistics Display
interface StatCardProps {
  label: string
  value: string | number
  change?: number
  format?: 'number' | 'average' | 'era' | 'percentage'
  className?: string
}

export function StatCard({ label, value, change, format = 'number', className }: StatCardProps) {
  const formatValue = (val: string | number) => {
    switch (format) {
      case 'average':
        return formatBattingAverage(Number(val))
      case 'era':
        return formatERA(Number(val))
      case 'percentage':
        return `${(Number(val) * 100).toFixed(1)}%`
      default:
        return formatNumber(Number(val))
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={cn(
            "text-xs",
            change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
          )}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}% from last week
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Game Score Display
interface ScoreDisplayProps {
  awayTeam: string
  homeTeam: string
  awayScore: number
  homeScore: number
  inning?: string
  status?: 'live' | 'final' | 'scheduled'
  className?: string
}

export function ScoreDisplay({ 
  awayTeam, 
  homeTeam, 
  awayScore, 
  homeScore, 
  inning, 
  status = 'final',
  className 
}: ScoreDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 animate-pulse'
      case 'final': return 'bg-gray-500'
      case 'scheduled': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TeamAvatar teamName={awayTeam} size="sm" />
            <span className="font-medium">{awayTeam}</span>
          </div>
          <span className="text-xl font-bold">{awayScore}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TeamAvatar teamName={homeTeam} size="sm" />
            <span className="font-medium">{homeTeam}</span>
          </div>
          <span className="text-xl font-bold">{homeScore}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Badge className={getStatusColor(status)}>
            {status.toUpperCase()}
          </Badge>
          {inning && (
            <span className="text-muted-foreground">{inning}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Player Stats Row
interface PlayerStatsRowProps {
  player: {
    name: string
    team: string
    position: string
    stats: {
      games: number
      atBats: number
      hits: number
      homeRuns: number
      rbis: number
      average: number
    }
  }
  onClick?: () => void
  className?: string
}

export function PlayerStatsRow({ player, onClick, className }: PlayerStatsRowProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 border-b hover:bg-muted/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <TeamAvatar teamName={player.team} size="sm" />
        <div>
          <div className="font-medium">{player.name}</div>
          <div className="text-sm text-muted-foreground">{player.team}</div>
        </div>
        <PositionBadge position={player.position} />
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="font-medium">{player.stats.games}</div>
          <div className="text-muted-foreground">G</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{player.stats.atBats}</div>
          <div className="text-muted-foreground">AB</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{player.stats.hits}</div>
          <div className="text-muted-foreground">H</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{player.stats.homeRuns}</div>
          <div className="text-muted-foreground">HR</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{player.stats.rbis}</div>
          <div className="text-muted-foreground">RBI</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{formatBattingAverage(player.stats.average)}</div>
          <div className="text-muted-foreground">AVG</div>
        </div>
      </div>
    </div>
  )
}

// Loading Baseball Animation
export function BaseballLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="animate-spin text-4xl">⚾</div>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  icon = <span className="text-6xl">⚾</span>, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  )
}