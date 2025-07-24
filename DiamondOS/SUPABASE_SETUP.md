# 🚀 SUPABASE SETUP GUIDE (Updated for Existing Projects)

## 🔧 Step 0: Clean Existing Data (if needed)
**If you get "relation already exists" errors:**
1. In Supabase SQL Editor
2. Copy ALL content from `E:\DiamondOS\database\reset_database.sql`
3. Paste and click "Run"
4. ✅ Should see "Database cleaned!"

## Step 1: Create/Access Supabase Project (2 minutes)
1. Go to https://supabase.com
2. Click "Start your project" 
3. Create new project
4. **SAVE THESE VALUES:**
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbG...` (long string)

## Step 2: Setup Database Schema (1 minute)
1. In Supabase dashboard, click "SQL Editor"
2. Copy ALL content from `E:\DiamondOS\database\schema.sql`
3. Paste and click "Run"
4. ✅ Should see "Success. No rows returned"

## Step 3: Add Sample Data (2 minutes)
1. In Supabase, go to Authentication > Users
2. Click "Add user" and create test user (or use existing)
3. **COPY THE USER ID** (looks like: a1b2c3d4-...)
4. In Supabase SQL Editor, go to "Table Editor" > "leagues"
5. **COPY THE LEAGUE ID** from the league you just created
6. Edit `E:\DiamondOS\database\sample_data.sql`:
   - Replace `'commissioner-uuid-here'` with your user ID
   - Replace `'550e8400-e29b-41d4-a716-446655440000'` with your league ID
7. Run the entire sample_data.sql in SQL Editor
8. ✅ Should see 90+ rows inserted

## Step 4: Connect Your App (30 seconds)
Create file: `E:\DiamondOS\.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Test With Real Data! 🎯
```bash
npm run dev
```

Visit: http://localhost:3000/scorekeeping

**You should now see:**
- Real team names (NY Pinstripes, Boston Green Monsters, etc.)
- No more "demo" data
- Teams pulled from Supabase database
- Ability to create and track real games

## 🔍 Verify Setup:
1. **Team dropdown shows:** NY Pinstripes, NY Blue Apples, LA Golden Angels, etc.
2. **Console shows:** No API errors
3. **Game creation:** Works and stores in database

## 🎭 Fun Test Data Highlights:
- **NY Pinstripes:** Aaron Jury, Jose Catcher, Anthony Pizza
- **Boston Green Monsters:** Rafael Devers-ity, Alex Verdugood  
- **NY Blue Apples:** Pete Alonslow, Francisco Lindorado

Ready to test with 6 teams and 90 hilariously-named players! 🎉
