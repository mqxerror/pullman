/**
 * Pullman Hotel - Database Seed Script
 * Creates the pullman_suites table and seeds it with 126 executive suites
 *
 * Run with: node scripts/seed-database.js
 */

const SUPABASE_URL = 'http://38.97.60.181:8000'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJhc2UiLCAiaWF0IjogMTcwMDAwMDAwMCwgImV4cCI6IDIwMDAwMDAwMDB9._du8bmlWymA_nhcORn58Br91kDGpCh5h0tn8fsciv0M'

async function seedDatabase() {
  console.log('🏨 Pullman Hotel - Database Seeder')
  console.log('=' .repeat(50))

  // First, check if the table already exists by trying to query it
  console.log('\n📋 Checking if pullman_suites table exists...')

  const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/pullman_suites?select=count&limit=1`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    }
  })

  if (checkResponse.ok) {
    const existingData = await checkResponse.json()
    console.log('✅ Table exists! Checking current data...')

    // Get count
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/pullman_suites?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    })

    const countHeader = countResponse.headers.get('content-range')
    const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0

    if (count > 0) {
      console.log(`📊 Table already has ${count} suites. Skipping seed.`)
      console.log('   To reseed, delete all rows first.')
      return
    }

    console.log('📭 Table is empty. Proceeding with seed...')
  } else {
    console.log('❌ Table does not exist or cannot be accessed.')
    console.log('   Please run the SQL migration first:')
    console.log('   supabase/migrations/001_create_pullman_suites.sql')
    console.log('\n   You can do this via:')
    console.log('   1. Supabase Studio SQL Editor: http://38.97.60.181:3002')
    console.log('   2. Direct PostgreSQL: psql postgresql://postgres:postgres123@38.97.60.181:5433/postgres')
    return
  }

  // Suite data matching floor plan (14 suites per floor)
  // Data source: Official Excel spreadsheet (Jan 21, 2026)
  const SUITE_DATA = {
    1: { size: 53.35, type: 'Executive Suite' },    // Type A LOCKOFF
    2: { size: 85.15, type: 'Premium Suite' },      // Type B
    3: { size: 54.30, type: 'Executive Suite' },    // Type A LOCKOFF
    4: { size: 53.53, type: 'Executive Suite' },    // Type A LOCKOFF
    5: { size: 56.88, type: 'Executive Suite' },    // Type C
    6: { size: 63.80, type: 'Deluxe Suite' },       // Type D
    7: { size: 74.46, type: 'Deluxe Suite' },       // Type E LOCKOFF
    8: { size: 65.55, type: 'Deluxe Suite' },       // Type E LOCKOFF
    9: { size: 85.25, type: 'Premium Suite' },      // Type B
    10: { size: 64.53, type: 'Deluxe Suite' },      // Type E LOCKOFF
    11: { size: 74.46, type: 'Deluxe Suite' },      // Type E LOCKOFF
    12: { size: 63.80, type: 'Deluxe Suite' },      // Type D
    13: { size: 56.88, type: 'Executive Suite' },   // Type C
    14: { size: 53.10, type: 'Executive Suite' },   // Type A LOCKOFF
  }

  // Generate suite data
  console.log('\n🏗️  Generating 126 executive suites (14 per floor × 9 floors)...')
  const suites = []

  for (let floor = 17; floor <= 25; floor++) {
    for (let unit = 1; unit <= 14; unit++) {
      const suiteInfo = SUITE_DATA[unit]
      const size_sqm = suiteInfo.size
      const suite_type = suiteInfo.type

      // Status distribution: 70% available, 20% reserved, 10% sold
      let status
      const rand = Math.random()
      if (rand < 0.1) {
        status = 'sold'
      } else if (rand < 0.3) {
        status = 'reserved'
      } else {
        status = 'available'
      }

      // Price based on floor and suite type (higher floors = premium)
      let price_usd
      if (suite_type === 'Premium Suite') {
        price_usd = 280000 + ((floor - 17) * 10000) + Math.floor(Math.random() * 20000)
      } else if (suite_type === 'Deluxe Suite') {
        price_usd = 220000 + ((floor - 17) * 8000) + Math.floor(Math.random() * 15000)
      } else {
        price_usd = 180000 + ((floor - 17) * 6000) + Math.floor(Math.random() * 10000)
      }

      suites.push({
        floor,
        unit_number: unit,
        size_sqm,
        suite_type,
        status,
        price_usd,
        price_display: 'Contact for Pricing',
        notes: null
      })
    }
  }

  console.log(`✅ Generated ${suites.length} suites`)

  // Summary stats
  const available = suites.filter(s => s.status === 'available').length
  const reserved = suites.filter(s => s.status === 'reserved').length
  const sold = suites.filter(s => s.status === 'sold').length

  console.log(`   📊 Available: ${available}`)
  console.log(`   📊 Reserved: ${reserved}`)
  console.log(`   📊 Sold: ${sold}`)

  // Insert in batches
  console.log('\n💾 Inserting suites into database...')

  const batchSize = 50
  for (let i = 0; i < suites.length; i += batchSize) {
    const batch = suites.slice(i, i + batchSize)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/pullman_suites`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(batch)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error)
      return
    }

    console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(suites.length / batchSize)}`)
  }

  console.log('\n🎉 Database seeded successfully!')
  console.log(`   Total suites: ${suites.length}`)
  console.log(`   Floors: 17-25 (9 floors)`)
  console.log(`   Units per floor: 18`)
}

seedDatabase().catch(console.error)
