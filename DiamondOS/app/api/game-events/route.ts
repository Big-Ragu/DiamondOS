import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/game-events - Get game events (optionally filtered by game)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('game_id')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('game_events')
      .select(`
        *,
        game:games(
          id,
          home_team:teams!home_team_id(name),
          away_team:teams!away_team_id(name)
        ),
        player:players(name, position, jersey_number)
      `)
      .order('created_at', { ascending: true })

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching game events:', error)
      return NextResponse.json({ error: 'Failed to fetch game events' }, { status: 500 })
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/game-events - Submit play from manager (dual-entry system)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      game_id, 
      inning, 
      is_top_inning, 
      player_id, 
      result, 
      runs_scored = 0, 
      rbi_count = 0,
      manager_input 
    } = body

    // Validate required fields
    if (!game_id || !result || inning === undefined || is_top_inning === undefined) {
      return NextResponse.json(
        { error: 'Game ID, result, inning, and inning half are required' }, 
        { status: 400 }
      )
    }

    // Get game details and verify access
    const { data: game } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(manager_id),
        away_team:teams!away_team_id(manager_id)
      `)
      .eq('id', game_id)
      .single()

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Verify user is manager of one of the teams
    const isHomeManager = game.home_team.manager_id === user.id
    const isAwayManager = game.away_team.manager_id === user.id
    
    if (!isHomeManager && !isAwayManager) {
      return NextResponse.json({ error: 'Only team managers can submit plays' }, { status: 403 })
    }

    // Check if there's already an existing event for this play
    const { data: existingEvent } = await supabase
      .from('game_events')
      .select('*')
      .eq('game_id', game_id)
      .eq('inning', inning)
      .eq('is_top_inning', is_top_inning)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingEvent) {
      // Update existing event with manager input
      const updateField = isHomeManager ? 'manager1_input' : 'manager2_input'
      const otherManagerField = isHomeManager ? 'manager2_input' : 'manager1_input'
      
      const updates: any = {
        [updateField]: result
      }

      // Check if both managers have now submitted
      const otherManagerInput = existingEvent[otherManagerField]
      if (otherManagerInput) {
        // Both managers submitted - check for conflicts
        if (otherManagerInput === result) {
          // No conflict - finalize the play
          updates.result = result
          updates.runs_scored = runs_scored
          updates.rbi_count = rbi_count
          updates.is_disputed = false
          updates.resolved_at = new Date().toISOString()
        } else {
          // Conflict detected
          updates.is_disputed = true
        }
      }

      const { data: updatedEvent, error } = await supabase
        .from('game_events')
        .update(updates)
        .eq('id', existingEvent.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating game event:', error)
        return NextResponse.json({ error: 'Failed to update play' }, { status: 500 })
      }

      return NextResponse.json(updatedEvent)
    } else {
      // Create new event
      const managerInputField = isHomeManager ? 'manager1_input' : 'manager2_input'
      
      const { data: event, error } = await supabase
        .from('game_events')
        .insert({
          game_id,
          inning,
          is_top_inning,
          player_id,
          event_type: 'at_bat',
          result: '', // Will be set when both managers agree
          runs_scored,
          rbi_count,
          [managerInputField]: result,
          is_disputed: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating game event:', error)
        return NextResponse.json({ error: 'Failed to submit play' }, { status: 500 })
      }

      return NextResponse.json(event, { status: 201 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/game-events/[id]/resolve - Commissioner resolves disputed play
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { commissioner_ruling, runs_scored, rbi_count } = body

    // Get event and verify access
    const { data: event } = await supabase
      .from('game_events')
      .select(`
        *,
        game:games(league_id)
      `)
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify user is commissioner
    const { data: membership } = await supabase
      .from('league_memberships')
      .select('role')
      .eq('league_id', event.game.league_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'commissioner') {
      return NextResponse.json({ error: 'Only commissioners can resolve disputes' }, { status: 403 })
    }

    // Resolve the dispute
    const { data: resolvedEvent, error } = await supabase
      .from('game_events')
      .update({
        result: commissioner_ruling,
        commissioner_ruling,
        runs_scored,
        rbi_count,
        is_disputed: false,
        resolved_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error resolving dispute:', error)
      return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 })
    }

    return NextResponse.json(resolvedEvent)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}