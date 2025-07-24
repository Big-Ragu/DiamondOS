"use client"

import { 
  Layout, 
  PageHeader, 
  Content, 
  GridLayout,
  StatCard,
  ScoreDisplay,
  PlayerStatsRow,
  TeamAvatar,
  PositionBadge,
  Button 
} from "@/components"
import { Plus, Download, RefreshCw, Users, Target, BarChart3, Settings, Trophy, Calendar } from "lucide-react"
import Link from "next/link"

// Demo data
const demoStats = [
  { label: "Active Games", value: 3, change: 2.1 },
  { label: "Total Teams", value: 6, change: 0 },
  { label: "League Average", value: 0.267, change: 1.2, format: "average" as const },
  { label: "Total Runs", value: 342, change: 8.5 }
]

const demoGames = [
  {
    awayTeam: "Thunder Bolts",
    homeTeam: "Fire Dragons", 
    awayScore: 8,
    homeScore: 5,
    inning: "Final",
    status: "final" as const
  },
  {
    awayTeam: "Ice Wolves",
    homeTeam: "Storm Eagles",
    awayScore: 5,
    homeScore: 3,
    inning: "Bot 7th",
    status: "live" as const
  },
  {
    awayTeam: "Wild Cats",
    homeTeam: "Lightning Strikes",
    awayScore: 0,
    homeScore: 0,
    inning: "7:00 PM",
    status: "scheduled" as const
  }
]

const demoPlayers = [
  {
    name: "Player 01",
    team: "Thunder Bolts",
    position: "SS",
    stats: {
      games: 8,
      atBats: 32,
      hits: 11,
      homeRuns: 3,
      rbis: 9,
      average: 0.344
    }
  },
  {
    name: "Player 23",
    team: "Fire Dragons", 
    position: "P",
    stats: {
      games: 6,
      atBats: 18,
      hits: 6,
      homeRuns: 1,
      rbis: 4,
      average: 0.333
    }
  },
  {
    name: "Player 45",
    team: "Ice Wolves",
    position: "CF", 
    stats: {
      games: 7,
      atBats: 28,
      hits: 9,
      homeRuns: 2,
      rbis: 7,
      average: 0.321
    }
  }
]

const mainFeatures = [
  {
    title: "⚾ Scorekeeping",
    description: "Dual-manager scorekeeping system with real-time conflict resolution",
    href: "/scorekeeping",
    icon: Target,
    color: "text-blue-500",
    available: true
  },
  {
    title: "👥 Team Management",
    description: "Manage teams, players, and rosters",
    href: "/teams",
    icon: Users,
    color: "text-green-500",
    available: false
  },
  {
    title: "📊 Analytics",
    description: "Advanced stats and performance analytics",
    href: "/analytics",
    icon: BarChart3,
    color: "text-purple-500",
    available: false
  },
  {
    title: "🏆 Draft",
    description: "Live draft system with auto-pick",
    href: "/draft",
    icon: Trophy,
    color: "text-yellow-500",
    available: false
  },
  {
    title: "📅 Schedule",
    description: "Game scheduling and league calendar",
    href: "/schedule",
    icon: Calendar,
    color: "text-red-500",
    available: false
  },
  {
    title: "⚙️ Commissioner",
    description: "League administration and settings",
    href: "/commissioner",
    icon: Settings,
    color: "text-gray-500",
    available: false
  }
]

export default function HomePage() {
  return (
    <Layout>
      <PageHeader
        title="DiamondOS Dashboard"
        description="Your complete baseball league management platform"
        breadcrumb={[
          { title: "Dashboard" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/scorekeeping">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </Link>
          </div>
        }
      />

      <Content>
        {/* Main Features Navigation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🏟️ League Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              feature.available ? (
                <Link key={index} href={feature.href}>
                  <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      <h3 className="font-semibold group-hover:text-blue-600">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        ✅ Available
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div key={index} className="p-6 border rounded-lg bg-gray-50 opacity-75">
                  <div className="flex items-center gap-3 mb-3">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    <h3 className="font-semibold text-gray-600">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">
                      🚧 Coming Soon
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">League Overview</h2>
          <GridLayout cols={4}>
            {demoStats.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                format={stat.format}
              />
            ))}
          </GridLayout>
        </section>

        {/* Live Games */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Recent Games</h2>
          <GridLayout cols={3}>
            {demoGames.map((game, index) => (
              <ScoreDisplay
                key={index}
                awayTeam={game.awayTeam}
                homeTeam={game.homeTeam}
                awayScore={game.awayScore}
                homeScore={game.homeScore}
                inning={game.inning}
                status={game.status}
              />
            ))}
          </GridLayout>
        </section>

        {/* Top Players */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Performers</h2>
            <Button variant="outline" size="sm">
              View All Players
            </Button>
          </div>
          
          <div className="border rounded-lg bg-card">
            {demoPlayers.map((player, index) => (
              <PlayerStatsRow
                key={index}
                player={player}
                onClick={() => console.log(`Clicked ${player.name}`)}
              />
            ))}
          </div>
        </section>

        {/* Development Status */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Development Progress</h2>
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 Session 4 Complete: Scorekeeping System</h3>
            <p className="text-blue-800 mb-4">
              The dual-manager scorekeeping system is now live! Features include:
            </p>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li>✅ Real-time game setup with team selection</li>
              <li>✅ Dual-manager input system with conflict detection</li>
              <li>✅ Interactive baseball diamond with runner management</li>
              <li>✅ Pitch count tracking with automatic walks/strikeouts</li>
              <li>✅ Live box score with batting and pitching stats</li>
              <li>✅ Comprehensive game log with event tracking</li>
              <li>✅ API integration for persistent game data</li>
            </ul>
            <div className="mt-4">
              <Link href="/scorekeeping">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Try Scorekeeping System
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Component Showcase */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Component Showcase</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Avatars */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Team Avatars</h3>
              <div className="flex flex-wrap gap-2">
                <TeamAvatar teamName="Thunder Bolts" size="sm" />
                <TeamAvatar teamName="Fire Dragons" size="md" />
                <TeamAvatar teamName="Ice Wolves" size="lg" />
                <TeamAvatar teamName="Storm Eagles" size="sm" />
                <TeamAvatar teamName="Wild Cats" size="sm" />
                <TeamAvatar teamName="Lightning Strikes" size="sm" />
              </div>
            </div>

            {/* Position Badges */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Position Badges</h3>
              <div className="flex flex-wrap gap-2">
                <PositionBadge position="P" />
                <PositionBadge position="C" />
                <PositionBadge position="1B" />
                <PositionBadge position="2B" />
                <PositionBadge position="3B" />
                <PositionBadge position="SS" />
                <PositionBadge position="LF" />
                <PositionBadge position="CF" />
                <PositionBadge position="RF" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Action Buttons</h3>
              <div className="flex flex-col gap-2">
                <Button>Primary Action</Button>
                <Button variant="outline">Secondary Action</Button>
                <Button variant="ghost">Ghost Action</Button>
              </div>
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  )
}