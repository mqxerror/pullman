/**
 * Add floor plan URLs to pullman_suites
 * Run with: node scripts/add-floor-plans.cjs
 */

const { Client } = require('pg')

const client = new Client({
  host: '38.97.60.181',
  port: 5433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres123',
})

async function addFloorPlans() {
  console.log('🏨 Adding floor plan support...')

  try {
    await client.connect()
    console.log('✅ Connected!')

    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'pullman_suites' AND column_name = 'floor_plan_url'
    `)

    if (checkColumn.rows.length === 0) {
      // Add floor_plan_url column
      console.log('📋 Adding floor_plan_url column...')
      await client.query(`
        ALTER TABLE pullman_suites
        ADD COLUMN floor_plan_url VARCHAR(500)
      `)
      console.log('✅ Column added!')
    } else {
      console.log('✅ Column already exists')
    }

    // Update floor plans based on suite type
    // Using placeholder URLs - replace with actual floor plan images
    console.log('🖼️  Setting floor plan URLs...')

    await client.query(`
      UPDATE pullman_suites
      SET floor_plan_url = CASE
        WHEN suite_type = 'Premium Suite' THEN '/assets/floorplans/premium-suite.svg'
        WHEN suite_type = 'Deluxe Suite' THEN '/assets/floorplans/deluxe-suite.svg'
        ELSE '/assets/floorplans/executive-suite.svg'
      END
    `)

    console.log('✅ Floor plans assigned!')

    // Verify
    const result = await client.query(`
      SELECT suite_type, COUNT(*), floor_plan_url
      FROM pullman_suites
      GROUP BY suite_type, floor_plan_url
    `)

    console.log('\n📊 Floor plan distribution:')
    result.rows.forEach(row => {
      console.log(`   ${row.suite_type}: ${row.count} suites -> ${row.floor_plan_url}`)
    })

    console.log('\n🎉 Done!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

addFloorPlans()
