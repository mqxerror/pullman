/**
 * Lossless image optimization script using Sharp
 * Optimizes JPG and PNG files while maintaining maximum quality
 */

import sharp from 'sharp';
import { readdir, stat, rename, unlink, writeFile } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../public/assets');

let totalOriginal = 0;
let totalOptimized = 0;
let filesProcessed = 0;

async function getFilesRecursively(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFilesRecursively(fullPath));
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const originalStats = await stat(filePath);
  const originalSize = originalStats.size;
  const tempPath = filePath + '.optimized';

  try {
    let pipeline = sharp(filePath, { limitInputPixels: false });

    if (ext === '.png') {
      // PNG: Use maximum compression, keep lossless
      pipeline = pipeline.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: false,
      });
    } else {
      // JPEG: Use quality 90 (visually lossless) with mozjpeg
      pipeline = pipeline.jpeg({
        quality: 90,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      });
    }

    // Write to temp file first
    await pipeline.toFile(tempPath);

    // Check new size
    const newStats = await stat(tempPath);
    const newSize = newStats.size;

    // Only replace if smaller
    if (newSize < originalSize) {
      await unlink(filePath);
      await rename(tempPath, filePath);
      const savings = originalSize - newSize;
      const percent = ((savings / originalSize) * 100).toFixed(1);
      console.log(`✓ ${filePath.replace(ASSETS_DIR, '')} - ${formatBytes(originalSize)} → ${formatBytes(newSize)} (${percent}% saved)`);
      totalOriginal += originalSize;
      totalOptimized += newSize;
    } else {
      await unlink(tempPath);
      console.log(`• ${filePath.replace(ASSETS_DIR, '')} - Already optimal (${formatBytes(originalSize)})`);
      totalOriginal += originalSize;
      totalOptimized += originalSize;
    }
    filesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath.replace(ASSETS_DIR, '')}: ${error.message}`);
    // Cleanup temp file if exists
    try { await unlink(tempPath); } catch {}
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function main() {
  console.log('🖼️  Starting lossless image optimization...\n');
  console.log(`Source: ${ASSETS_DIR}\n`);

  const files = await getFilesRecursively(ASSETS_DIR);
  console.log(`Found ${files.length} images to optimize\n`);

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 SUMMARY`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Original total:  ${formatBytes(totalOriginal)}`);
  console.log(`   Optimized total: ${formatBytes(totalOptimized)}`);
  console.log(`   Total savings:   ${formatBytes(totalOriginal - totalOptimized)} (${((1 - totalOptimized/totalOriginal) * 100).toFixed(1)}%)`);
  console.log('='.repeat(50));
}

main().catch(console.error);
