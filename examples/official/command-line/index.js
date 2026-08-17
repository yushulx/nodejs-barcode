const path = require('node:path');
const fs = require('node:fs');
const { LicenseManager, CaptureVisionRouter, EnumPresetTemplate } = require('dynamsoft-capture-vision-for-node');

// Get a 30-day free trial license:
// https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
const LICENSE_KEY = process.env.DCV_LICENSE || 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';

function printUsage() {
  console.log('Usage: node index.js <image-file> [--template <template-name>]');
  console.log('');
  console.log('Arguments:');
  console.log('  <image-file>        Path to a jpg, png, bmp, gif, pdf, or tiff file.');
  console.log('');
  console.log('Options:');
  console.log('  --template <name>   Preset template to use. Defaults to PT_READ_BARCODES.');
  console.log('                      Examples: PT_READ_BARCODES_SPEED_FIRST,');
  console.log('                                PT_READ_BARCODES_READ_RATE_FIRST,');
  console.log('                                PT_READ_SINGLE_BARCODE');
}

function printResult(result) {
  const items = result.barcodeResultItems || [];
  if (items.length === 0) {
    console.log('No barcode found.');
    return;
  }
  console.log(`Decoded ${items.length} barcode(s):`);
  for (const item of items) {
    console.log('-'.repeat(48));
    console.log(`Format     : ${item.formatString}`);
    console.log(`Text       : ${item.text}`);
    console.log(`Confidence : ${item.confidence}`);
    const points = item.location.points.map(p => `(${p.x}, ${p.y})`).join(' ');
    console.log(`Location   : ${points}`);
  }
  console.log('-'.repeat(48));
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const imagePath = path.resolve(args[0]);
  const templateFlagIndex = args.indexOf('--template');
  const templateName = templateFlagIndex !== -1 && args[templateFlagIndex + 1]
    ? EnumPresetTemplate[args[templateFlagIndex + 1]] || args[templateFlagIndex + 1]
    : EnumPresetTemplate.PT_READ_BARCODES;

  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    process.exit(1);
  }

  try {
    LicenseManager.initLicense(LICENSE_KEY);
  } catch (err) {
    console.error(`License initialization failed: ${err.message || err}`);
    console.error('Request a trial license: https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform');
    process.exit(1);
  }

  const startTime = Date.now();
  const lowerExt = path.extname(imagePath).toLowerCase();

  try {
    if (lowerExt === '.pdf' || lowerExt === '.tif' || lowerExt === '.tiff') {
      // Multi-page documents: decode page by page.
      const results = await CaptureVisionRouter.captureMultiPagesAsync(imagePath, templateName);
      for (const result of results) {
        const tag = result.originalImageTag;
        if (tag && typeof tag.pageNumber === 'number') {
          console.log(`\n# Page ${tag.pageNumber + 1}/${tag.totalPages}`);
        }
        printResult(result);
      }
    } else {
      const result = await CaptureVisionRouter.captureAsync(imagePath, templateName);
      printResult(result);
    }
    console.log(`\nElapsed time: ${Date.now() - startTime} ms`);
  } catch (err) {
    console.error(`Decoding failed: ${err.message || err}`);
    process.exitCode = 1;
  } finally {
    // Terminate workers so the process can exit.
    await CaptureVisionRouter.terminateIdleWorkers();
  }
})();
