/**
 * Convert floor plan PDFs to PNG images
 * Run with: node scripts/convert-floorplans.cjs
 */

const pdf = require('pdf-poppler')
const path = require('path')
const fs = require('fs')

const SOURCE_DIR = path.join(__dirname, '../docs/content/source-materials/PAQUETE DE VENTAS (1)/PAQUETE DE VENTAS/TECHNICAL SHEETS/EXECUTIVE SUITES/ENG')
const OUTPUT_DIR = path.join(__dirname, '../public/assets/floorplans')

// Floor plan PDFs and their output names
const FLOOR_PLANS = [
  { pdf: '01_EXECUTIVE SUITES N1700@2500.pdf', output: 'floor-overview' },
  { pdf: '02_FICHA_EXECUTIVE SUITE 1 Y 3.pdf', output: 'suite-1-3' },
  { pdf: '03_FICHA_EXECUTIVE SUITE 2 Y 9.pdf', output: 'suite-2-9' },
  { pdf: '04_FICHA_EXECUTIVE SUITE 4 Y 14.pdf', output: 'suite-4-14' },
  { pdf: '05_FICHA_EXECUTIVE SUITE 5 Y 13.pdf', output: 'suite-5-13' },
  { pdf: '06_FICHA_EXECUTIVE SUITE 6 Y 12.pdf', output: 'suite-6-12' },
  { pdf: '07_FICHA_EXECUTIVE SUITE 7 Y 11.pdf', output: 'suite-7-11' },
  { pdf: '08_FICHA_EXECUTIVE SUITE 8 Y 10.pdf', output: 'suite-8-10' },
]

async function convertPDF(pdfFile, outputName) {
  const inputPath = path.join(SOURCE_DIR, pdfFile)

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  File not found: ${pdfFile}`)
    return false
  }

  const options = {
    format: 'png',
    out_dir: OUTPUT_DIR,
    out_prefix: outputName,
    page: 1,
    scale: 2048, // High resolution
  }

  try {
    console.log(`📄 Converting: ${pdfFile}`)
    await pdf.convert(inputPath, options)

    // Rename the output file (pdf-poppler adds -1 suffix)
    const generatedFile = path.join(OUTPUT_DIR, `${outputName}-1.png`)
    const finalFile = path.join(OUTPUT_DIR, `${outputName}.png`)

    if (fs.existsSync(generatedFile)) {
      if (fs.existsSync(finalFile)) {
        fs.unlinkSync(finalFile)
      }
      fs.renameSync(generatedFile, finalFile)
      console.log(`✅ Created: ${outputName}.png`)
      return true
    }
  } catch (error) {
    console.error(`❌ Error converting ${pdfFile}:`, error.message)
  }
  return false
}

async function main() {
  console.log('🏨 Converting floor plan PDFs to images...\n')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  let success = 0
  let failed = 0

  for (const plan of FLOOR_PLANS) {
    const result = await convertPDF(plan.pdf, plan.output)
    if (result) success++
    else failed++
  }

  console.log(`\n📊 Results: ${success} converted, ${failed} failed`)
  console.log('🎉 Done!')
}

main()
