import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/draft - Get draft picks for a league
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('league_id')
    
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: picks, error } = await supabase
      .from('draft_picks')
      .select(`
        *,
        team:teams(name, colors, manager:users(name)),
        player:players(name, position, age)
      `)
      .eq('league_id', leagueId)
      .order('round_number', { ascending: true })
      .order('pick_number', { ascending: true })

    if (error) {
      console.error('Error fetching draft picks:', error)
      return NextResponse.json({ error: 'Failed to fetch draft picks' }, { status: 500 })
    }

    return NextResponse.json(picks)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/draft - Make a draft pick
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { league_id, round_number, pick_number, team_id, player_id, is_auto_pick = false } = body

    // Validate required fields
    if (!league_id || !round_number || !pick_number || !team_id || !player_id) {
      return NextResponse.json(
        { error: 'All draft pick details are required' }, 
        { status: 400 }
      )
    }

    // Verify user has permission (commissioner or manager of the team)
    const { data: membership } = await supabase
      .from('league_memberships')
      .select('role, team_id')
      .eq('league_id', league_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if user can make this pick
    const canPick = membership.role === 'commissioner' || 
                   (membership.role === 'manager' && membership.team_id === team_id)

    if (!canPick) {
      return NextResponse.json({ error: 'Cannot make pick for this team' }, { status: 403 })
    }

    // Verify pick order is correct
    const { data: latestPick } = await supabase
      .from('draft_picks')
      .select('round_number, pick_number')
      .eq('league_id', league_id)
      .order('round_number', { ascending: false })
      .order('pick_number', { ascending: false })
      .limit(1)
      .single()

    if (latestPick) {
      const expectedNext = calculateNextPick(latestPick.round_number, latestPick.pick_number, league_id)
      if (expectedNext.round !== round_number || expectedNext.pick !== pick_number) {
        return NextResponse.json({ error: 'Pick is out of order' }, { status: 400 })
      }
    }

    // Verify player is available
    const { data: existingPick } = await supabase
      .from('draft_picks')
      .select('id')
      .eq('player_id', player_id)
      .single()

    if (existingPick) {
      return NextResponse.json({ error: 'Player already drafted' }, { status: 400 })
    }

    // Start transaction - create pick and update player
    const { data: draftPick, error: draftError } = await supabase
      .from('draft_picks')
      .insert({
        league_id,
        round_number,
        pick_number,
        team_id,
        player_id,
        is_auto_pick
      })
      .select(`
        *,
        team:teams(name, colors, manager:users(name)),
        player:players(name, position, age)
      `)
      .single()

    if (draftError) {
      console.error('Error creating draft pick:', draftError)
      return NextResponse.json({ error: 'Failed to create draft pick' }, { status: 500 })
    }

    // Update player as drafted
    const { error: playerError } = await supabase
      .from('players')
      .update({
        team_id,
        is_drafted: true,
        draft_round: round_number,
        draft_pick: pick_number
      })
      .eq('id', player_id)

    if (playerError) {
      console.error('Error updating player:', playerError)
      // Note: In production, you'd want to rollback the draft pick
    }

    return NextResponse.json(draftPick, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/draft/[id] - Undo a draft pick (commissioner only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const pickId = searchParams.get('id')
    
    if (!pickId) {
      return NextResponse.json({ error: 'Pick ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pick details
    const { data: pick } = await supabase
      .from('draft_picks')
      .select('*')
      .eq('id', pickId)
      .single()

    if (!pick) {
      return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
    }

    // Verify user is commissioner
    const { data: membership } = await supabase
      .from('league_memberships')
      .select('role')
      .eq('league_id', pick.league_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'commissioner') {
      return NextResponse.json({ error: 'Only commissioners can undo picks' }, { status: 403 })
    }

    // Delete pick
    const { error: deleteError } = await supabase
      .from('draft_picks')
      .delete()
      .eq('id', pickId)

    if (deleteError) {
      console.error('Error deleting pick:', deleteError)
      return NextResponse.json({ error: 'Failed to undo pick' }, { status: 500 })
    }

    // Update player as undrafted
    const { error: playerError } = await supabase
      .from('players')
      .update({
        team_id: null,
        is_drafted: false,
        draft_round: null,
        draft_pick: null
      })
      .eq('id', pick.player_id)

    if (playerError) {
      console.error('Error updating player:', playerError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate next pick
function calculateNextPick(currentRound: number, currentPick: number, leagueId: string) {
  // This would need league settings to determine number of teams
  const NUM_TEAMS = 6 // This should come from league settings
  
  if (currentPick < NUM_TEAMS) {
    return { round: currentRound, pick: currentPick + 1 }
  } else {
    return { round: currentRound + 1, pick: 1 }
  }
}