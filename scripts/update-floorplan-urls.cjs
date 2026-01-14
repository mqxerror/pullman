/**
 * Update floor plan URLs in database based on unit numbers
 * Run with: node scripts/update-floorplan-urls.cjs
 */

const { Client } = require('pg')

const client = new Client({
  host: '38.97.60.181',
  port: 5433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres123',
})

// Map unit numbers to floor plan images
// Based on the PDF files: Suite 1 Y 3, Suite 2 Y 9, etc.
const UNIT_TO_FLOORPLAN = {
  1: '/assets/floorplans/suite-1-3.png',
  2: '/assets/floorplans/suite-2-9.png',
  3: '/assets/floorplans/suite-1-3.png',
  4: '/assets/floorplans/suite-4-14.png',
  5: '/assets/floorplans/suite-5-13.png',
  6: '/assets/floorplans/suite-6-12.png',
  7: '/assets/floorplans/suite-7-11.png',
  8: '/assets/floorplans/suite-8-10.png',
  9: '/assets/floorplans/suite-2-9.png',
  10: '/assets/floorplans/suite-8-10.png',
  11: '/assets/floorplans/suite-7-11.png',
  12: '/assets/floorplans/suite-6-12.png',
  13: '/assets/floorplans/suite-5-13.png',
  14: '/assets/floorplans/suite-4-14.png',
}

async function updateFloorPlans() {
  console.log('🏨 Updating floor plan URLs...\n')

  try {
    await client.connect()
    console.log('✅ Connected to database!')

    // Update each unit number with its floor plan
    for (const [unitNumber, floorPlanUrl] of Object.entries(UNIT_TO_FLOORPLAN)) {
      const result = await client.query(`
        UPDATE pullman_suites
        SET floor_plan_url = $1
        WHERE unit_number = $2
      `, [floorPlanUrl, parseInt(unitNumber)])

      console.log(`📋 Unit ${unitNumber}: ${result.rowCount} suites updated → ${floorPlanUrl}`)
    }

    // Verify the update
    console.log('\n📊 Floor plan distribution:')
    const verification = await client.query(`
      SELECT unit_number, floor_plan_url, COUNT(*) as count
      FROM pullman_suites
      GROUP BY unit_number, floor_plan_url
      ORDER BY unit_number
    `)

    verification.rows.forEach(row => {
      console.log(`   Unit ${row.unit_number}: ${row.count} suites → ${row.floor_plan_url}`)
    })

    console.log('\n🎉 Done!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

updateFloorPlans()
