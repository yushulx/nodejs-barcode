const path = require('node:path');
const fs = require('node:fs');
const { LicenseManager, CaptureVisionRouter, EnumPresetTemplate } = require('dynamsoft-capture-vision-for-node');

// Get a 30-day free trial license:
// https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
const LICENSE_KEY = process.env.DCV_LICENSE || 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';

function printUsage() {
  console.log('Usage: node index.js <pdf-file> [--template <template-name>] [--json <output.json>]');
  console.log('');
  console.log('Arguments:');
  console.log('  <pdf-file>          Path to a single- or multi-page PDF file.');
  console.log('');
  console.log('Options:');
  console.log('  --template <name>   Preset template to use. Defaults to PT_READ_BARCODES.');
  console.log('                      Examples: PT_READ_BARCODES_SPEED_FIRST,');
  console.log('                                PT_READ_BARCODES_READ_RATE_FIRST,');
  console.log('                                PT_READ_SINGLE_BARCODE');
  console.log('  --json <file>       Also write the decoded barcodes to a JSON file.');
}

function printPageResult(pageIndex, result) {
  console.log(`\n# Page ${pageIndex + 1}`);
  if (result.errorCode !== 0) {
    console.log(`  Error: ${result.errorCode} ${result.errorString}`);
    return;
  }
  const items = result.barcodeResultItems || [];
  if (items.length === 0) {
    console.log('  No barcode found.');
    return;
  }
  console.log(`  Decoded ${items.length} barcode(s):`);
  for (const item of items) {
    console.log('  ' + '-'.repeat(44));
    console.log(`  Format     : ${item.formatString}`);
    console.log(`  Text       : ${item.text}`);
    console.log(`  Confidence : ${item.confidence}`);
    const points = item.location.points.map(p => `(${p.x}, ${p.y})`).join(' ');
    console.log(`  Location   : ${points}`);
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const pdfPath = path.resolve(args[0]);
  const templateFlagIndex = args.indexOf('--template');
  const templateName = templateFlagIndex !== -1 && args[templateFlagIndex + 1]
    ? EnumPresetTemplate[args[templateFlagIndex + 1]] || args[templateFlagIndex + 1]
    : EnumPresetTemplate.PT_READ_BARCODES;

  const jsonFlagIndex = args.indexOf('--json');
  const jsonPath = jsonFlagIndex !== -1 && args[jsonFlagIndex + 1] ? path.resolve(args[jsonFlagIndex + 1]) : null;

  if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`);
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
  try {
    // Decode every page of the PDF: each page yields one CapturedResult.
    const results = await CaptureVisionRouter.captureMultiPagesAsync(pdfPath, templateName);

    const allBarcodes = [];
    results.forEach((result, pageIndex) => {
      printPageResult(pageIndex, result);
      const items = result.barcodeResultItems || [];
      for (const item of items) {
        allBarcodes.push({
          page: pageIndex + 1,
          format: item.formatString,
          text: item.text,
          confidence: item.confidence,
          angle: item.angle,
          location: item.location.points.map(p => ({ x: p.x, y: p.y })),
        });
      }
    });

    console.log(`\nTotal barcodes decoded: ${allBarcodes.length}`);
    console.log(`Elapsed time: ${Date.now() - startTime} ms`);

    if (jsonPath) {
      fs.writeFileSync(jsonPath, JSON.stringify(allBarcodes, null, 2));
      console.log(`Results written to: ${jsonPath}`);
    }
  } catch (err) {
    console.error(`Decoding failed: ${err.message || err}`);
    process.exitCode = 1;
  } finally {
    // Terminate workers so the process can exit.
    await CaptureVisionRouter.terminateIdleWorkers();
  }
})();