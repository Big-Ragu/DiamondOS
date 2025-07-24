import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!games_home_team_id_fkey (
          id,
          name
        ),
        away_team:teams!games_away_team_id_fkey (
          id,
          name
        )
      `)
      .order('scheduled_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(games)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { league_id, home_team_id, away_team_id, scheduled_at } = body

    const { data: game, error } = await supabase
      .from('games')
      .insert({
        league_id,
        home_team_id,
        away_team_id,
        scheduled_at,
        game_status: 'in_progress'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
