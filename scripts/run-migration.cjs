/**
 * Pullman Hotel - Run SQL Migration
 * Connects directly to PostgreSQL and creates the pullman_suites table
 *
 * Run with: node scripts/run-migration.cjs
 */

const { Client } = require('pg')

const client = new Client({
  host: '38.97.60.181',
  port: 5433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres123',
})

async function runMigration() {
  console.log('🏨 Pullman Hotel - Database Migration')
  console.log('=' .repeat(50))

  try {
    console.log('\n📡 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!')

    // Check if table exists
    console.log('\n📋 Checking if pullman_suites table exists...')
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'pullman_suites'
      );
    `)

    if (checkResult.rows[0].exists) {
      console.log('✅ Table already exists!')

      // Check row count
      const countResult = await client.query('SELECT COUNT(*) FROM pullman_suites')
      const count = parseInt(countResult.rows[0].count)

      if (count > 0) {
        console.log(`📊 Table has ${count} suites.`)
        console.log('   Migration complete - skipping seed.')
        return
      }

      console.log('📭 Table is empty. Will seed data...')
    } else {
      console.log('❌ Table does not exist. Creating...')

      // Create table
      await client.query(`
        CREATE TABLE pullman_suites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          floor INTEGER NOT NULL CHECK (floor >= 17 AND floor <= 25),
          unit_number INTEGER NOT NULL CHECK (unit_number >= 1 AND unit_number <= 14),
          size_sqm NUMERIC(6,2) NOT NULL CHECK (size_sqm > 0),
          suite_type VARCHAR(50) NOT NULL DEFAULT 'Executive Suite',
          status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
          price_usd NUMERIC(12,2),
          price_display VARCHAR(50) NOT NULL DEFAULT 'Contact for Pricing',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_by VARCHAR(100),
          UNIQUE(floor, unit_number)
        );
      `)
      console.log('✅ Table created!')

      // Create indexes
      console.log('📇 Creating indexes...')
      await client.query('CREATE INDEX idx_pullman_suites_floor ON pullman_suites(floor)')
      await client.query('CREATE INDEX idx_pullman_suites_status ON pullman_suites(status)')
      await client.query('CREATE INDEX idx_pullman_suites_floor_status ON pullman_suites(floor, status)')
      console.log('✅ Indexes created!')

      // Create updated_at trigger
      console.log('⚡ Creating triggers...')
      await client.query(`
        CREATE OR REPLACE FUNCTION update_pullman_suites_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `)
      await client.query(`
        CREATE TRIGGER trigger_pullman_suites_updated_at
          BEFORE UPDATE ON pullman_suites
          FOR EACH ROW
          EXECUTE FUNCTION update_pullman_suites_updated_at();
      `)
      console.log('✅ Triggers created!')

      // Enable RLS
      console.log('🔒 Enabling Row Level Security...')
      await client.query('ALTER TABLE pullman_suites ENABLE ROW LEVEL SECURITY')

      // Create policies
      await client.query(`
        CREATE POLICY "Allow public read access" ON pullman_suites
          FOR SELECT USING (true);
      `)
      await client.query(`
        CREATE POLICY "Allow authenticated update" ON pullman_suites
          FOR UPDATE USING (true) WITH CHECK (true);
      `)
      console.log('✅ RLS policies created!')
    }

    // Seed data
    console.log('\n🌱 Seeding data...')

    // Generate and insert suites
    let inserted = 0
    for (let floor = 17; floor <= 25; floor++) {
      for (let unit = 1; unit <= 14; unit++) {
        // Size varies by position
        let size_sqm, suite_type
        if ([1, 7, 8, 14].includes(unit)) {
          size_sqm = 75 + Math.random() * 15
        } else if ([2, 6, 9, 13].includes(unit)) {
          size_sqm = 65 + Math.random() * 10
        } else {
          size_sqm = 55 + Math.random() * 10
        }

        // Determine suite type based on size
        if (size_sqm >= 80) {
          suite_type = 'Premium Suite'
        } else if (size_sqm >= 65) {
          suite_type = 'Deluxe Suite'
        } else {
          suite_type = 'Executive Suite'
        }

        // Status distribution
        let status
        const rand = Math.random()
        if (rand < 0.1) status = 'sold'
        else if (rand < 0.3) status = 'reserved'
        else status = 'available'

        // Price based on floor and position
        let price_usd
        if ([1, 7, 8, 14].includes(unit)) {
          price_usd = 280000 + ((floor - 17) * 10000) + Math.floor(Math.random() * 20000)
        } else if ([2, 6, 9, 13].includes(unit)) {
          price_usd = 220000 + ((floor - 17) * 8000) + Math.floor(Math.random() * 15000)
        } else {
          price_usd = 180000 + ((floor - 17) * 6000) + Math.floor(Math.random() * 10000)
        }

        await client.query(`
          INSERT INTO pullman_suites (floor, unit_number, size_sqm, suite_type, status, price_usd, price_display)
          VALUES ($1, $2, $3, $4, $5, $6, 'Contact for Pricing')
        `, [floor, unit, size_sqm.toFixed(2), suite_type, status, price_usd])

        inserted++
      }
      console.log(`   Floor ${floor}: 14 suites inserted`)
    }

    console.log(`\n✅ Seeded ${inserted} suites!`)

    // Get summary
    const summary = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'reserved') as reserved,
        COUNT(*) FILTER (WHERE status = 'sold') as sold
      FROM pullman_suites
    `)

    const stats = summary.rows[0]
    console.log('\n📊 Summary:')
    console.log(`   Total: ${stats.total}`)
    console.log(`   Available: ${stats.available}`)
    console.log(`   Reserved: ${stats.reserved}`)
    console.log(`   Sold: ${stats.sold}`)

    console.log('\n🎉 Migration complete!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await client.end()
    console.log('\n📡 Disconnected from PostgreSQL')
  }
}

runMigration().catch(console.error)
