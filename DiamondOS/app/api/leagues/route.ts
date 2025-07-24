import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { League } from '@/types'

// GET /api/leagues - Get all leagues for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get leagues where user is a member
    const { data: leagues, error } = await supabase
      .from('leagues')
      .select(`
        *,
        league_memberships!inner(role),
        teams(id, name, wins, losses),
        _count:players(count)
      `)
      .eq('league_memberships.user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leagues:', error)
      return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 })
    }

    return NextResponse.json(leagues)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leagues - Create new league
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, season, settings } = body

    // Validate required fields
    if (!name || !season) {
      return NextResponse.json(
        { error: 'Name and season are required' }, 
        { status: 400 }
      )
    }

    // Create league
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .insert({
        name,
        season,
        commissioner_id: user.id,
        settings: settings || {}
      })
      .select()
      .single()

    if (leagueError) {
      console.error('Error creating league:', leagueError)
      return NextResponse.json({ error: 'Failed to create league' }, { status: 500 })
    }

    // Create league membership for commissioner
    const { error: membershipError } = await supabase
      .from('league_memberships')
      .insert({
        league_id: league.id,
        user_id: user.id,
        role: 'commissioner'
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      // Note: In production, you'd want to rollback the league creation
    }

    return NextResponse.json(league, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}