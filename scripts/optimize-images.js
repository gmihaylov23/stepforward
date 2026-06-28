const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'images', 'raw');
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'products');

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function processImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!SUPPORTED.has(ext)) return;

  const name = path.basename(filename, ext);
  const inputPath = path.join(INPUT_DIR, filename);
  const fullOut = path.join(OUTPUT_DIR, `${name}.webp`);
  const thumbOut = path.join(OUTPUT_DIR, `${name}-thumb.webp`);

  const needsFull = !fs.existsSync(fullOut);
  const needsThumb = !fs.existsSync(thumbOut);

  if (!needsFull && !needsThumb) {
    console.log(`  skip  ${filename} (already processed)`);
    return;
  }

  if (needsFull) {
    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(fullOut);
    console.log(`  full  ${name}.webp`);
  }

  if (needsThumb) {
    await sharp(inputPath)
      .resize(600, 600, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(thumbOut);
    console.log(`  thumb ${name}-thumb.webp`);
  }
}

async function run() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input folder not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(INPUT_DIR).filter(
    f => SUPPORTED.has(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log('No images found in images/raw/');
    return;
  }

  console.log(`Processing ${files.length} image(s)...\n`);

  for (const file of files) {
    try {
      await processImage(file);
    } catch (err) {
      console.error(`  error ${file}: ${err.message}`);
    }
  }

  console.log('\nDone.');
}

run();
