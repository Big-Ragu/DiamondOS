import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/stats - Get player/team statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('player_id')
    const teamId = searchParams.get('team_id')
    const leagueId = searchParams.get('league_id')
    const season = searchParams.get('season')
    const type = searchParams.get('type') || 'batting' // 'batting' or 'pitching'
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (type === 'batting') {
      let query = supabase
        .from('player_stats')
        .select(`
          *,
          player:players(
            name,
            position,
            jersey_number,
            team:teams(name, colors)
          )
        `)

      if (playerId) query = query.eq('player_id', playerId)
      if (season) query = query.eq('season', season)
      
      // Filter by team/league via joins
      if (teamId || leagueId) {
        query = query.select(`
          *,
          player:players!inner(
            name,
            position,
            jersey_number,
            team:teams!inner(name, colors)
          )
        `)
        
        if (teamId) {
          query = query.eq('player.team.id', teamId)
        }
        if (leagueId) {
          query = query.eq('player.league_id', leagueId)
        }
      }

      const { data: stats, error } = await query.order('batting_average', { ascending: false })

      if (error) {
        console.error('Error fetching batting stats:', error)
        return NextResponse.json({ error: 'Failed to fetch batting stats' }, { status: 500 })
      }

      return NextResponse.json(stats)
    } else if (type === 'pitching') {
      let query = supabase
        .from('pitching_stats')
        .select(`
          *,
          player:players(
            name,
            position,
            jersey_number,
            team:teams(name, colors)
          )
        `)

      if (playerId) query = query.eq('player_id', playerId)
      if (season) query = query.eq('season', season)

      const { data: stats, error } = await query.order('era', { ascending: true })

      if (error) {
        console.error('Error fetching pitching stats:', error)
        return NextResponse.json({ error: 'Failed to fetch pitching stats' }, { status: 500 })
      }

      return NextResponse.json(stats)
    }

    return NextResponse.json({ error: 'Invalid stats type' }, { status: 400 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/stats/calculate - Recalculate stats for player/team
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { player_id, season } = body

    if (!player_id || !season) {
      return NextResponse.json(
        { error: 'Player ID and season are required' }, 
        { status: 400 }
      )
    }

    // Get all game events for this player in the season
    const { data: events, error: eventsError } = await supabase
      .from('game_events')
      .select(`
        *,
        game:games!inner(
          league_id,
          leagues!inner(season)
        )
      `)
      .eq('player_id', player_id)
      .eq('game.leagues.season', season)
      .eq('is_disputed', false)
      .not('resolved_at', 'is', null)

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json({ error: 'Failed to fetch game events' }, { status: 500 })
    }

    // Calculate batting stats
    let stats = {
      games_played: 0,
      at_bats: 0,
      hits: 0,
      runs: 0,
      rbis: 0,
      home_runs: 0,
      doubles: 0,
      triples: 0,
      walks: 0,
      strikeouts: 0,
      stolen_bases: 0,
      caught_stealing: 0
    }

    const gameIds = new Set()
    
    events?.forEach(event => {
      gameIds.add(event.game_id)
      
      // Count RBIs and runs from this event
      stats.runs += event.runs_scored || 0
      stats.rbis += event.rbi_count || 0
      
      // Parse result to determine stat type
      const result = event.result.toUpperCase()
      
      // At-bats (excludes walks, HBP, sacrifices)
      if (!['BB', 'IBB', 'HBP', 'CI', 'SAC', 'SF'].includes(result) && 
          !result.startsWith('SB') && !result.startsWith('CS') && 
          !result.startsWith('PO') && result !== 'WP' && result !== 'PB') {
        stats.at_bats++
      }
      
      // Hits
      if (['1B', '2B', '3B', 'HR'].includes(result) || result.includes('1B+E') || result.includes('2B+E')) {
        stats.hits++
        
        if (result === '2B' || result.includes('2B')) stats.doubles++
        else if (result === '3B') stats.triples++
        else if (result === 'HR') stats.home_runs++
      }
      
      // Walks
      if (['BB', 'IBB', 'HBP', 'CI'].includes(result)) {
        stats.walks++
      }
      
      // Strikeouts
      if (['K', 'KC', 'KPB', 'KWP'].includes(result)) {
        stats.strikeouts++
      }
      
      // Stolen bases
      if (result.startsWith('SB')) {
        stats.stolen_bases++
      }
      
      // Caught stealing
      if (result.startsWith('CS')) {
        stats.caught_stealing++
      }
    })

    stats.games_played = gameIds.size

    // Calculate advanced stats
    const batting_average = stats.at_bats > 0 ? (stats.hits / stats.at_bats) : 0
    const on_base_percentage = (stats.at_bats + stats.walks) > 0 ? 
      ((stats.hits + stats.walks) / (stats.at_bats + stats.walks)) : 0
    
    const total_bases = stats.hits + stats.doubles + (stats.triples * 2) + (stats.home_runs * 3)
    const slugging_percentage = stats.at_bats > 0 ? (total_bases / stats.at_bats) : 0
    const ops = on_base_percentage + slugging_percentage

    // Upsert stats
    const { data: updatedStats, error: updateError } = await supabase
      .from('player_stats')
      .upsert({
        player_id,
        season,
        ...stats,
        batting_average: parseFloat(batting_average.toFixed(3)),
        on_base_percentage: parseFloat(on_base_percentage.toFixed(3)),
        slugging_percentage: parseFloat(slugging_percentage.toFixed(3)),
        ops: parseFloat(ops.toFixed(3))
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error updating stats:', updateError)
      return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
    }

    return NextResponse.json(updatedStats)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}