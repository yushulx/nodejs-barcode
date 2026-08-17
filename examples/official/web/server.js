const path = require('node:path');
const express = require('express');
const multer = require('multer');
const { LicenseManager, CaptureVisionRouter, EnumPresetTemplate } = require('dynamsoft-capture-vision-for-node');

// Get a 30-day free trial license:
// https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
const LICENSE_KEY = process.env.DCV_LICENSE || 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
const PORT = process.env.PORT || 2020;

try {
  LicenseManager.initLicense(LICENSE_KEY);
  console.log('License initialized.');
} catch (err) {
  console.error(`License initialization failed: ${err.message || err}`);
  console.error('Request a trial license: https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform');
  process.exit(1);
}

const app = express();
// Keep uploads in memory; 10 MB is plenty for barcode images.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/decode', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded. Send a multipart form field named "image".' });
  }

  const templateName = EnumPresetTemplate[req.body.template] || EnumPresetTemplate.PT_READ_BARCODES;
  const startTime = Date.now();

  try {
    // File bytes are decoded directly in a worker thread - no temp files needed.
    const result = await CaptureVisionRouter.captureAsync(req.file.buffer, {
      templateName,
      // The response is sent before the buffer is reused, so copying is safer here.
      dataTransferType: 'copy'
    });

    const barcodes = (result.barcodeResultItems || []).map(item => ({
      format: item.formatString,
      text: item.text,
      confidence: item.confidence,
      location: item.location.points.map(p => ({ x: p.x, y: p.y }))
    }));

    res.json({
      count: barcodes.length,
      elapsedTime: Date.now() - startTime,
      queueLength: CaptureVisionRouter.waitQueueLength,
      barcodes
    });
  } catch (err) {
    res.status(500).json({ error: `Decoding failed: ${err.message || err}` });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Barcode reader web app running at http://localhost:${PORT}`);
});

async function shutdown() {
  console.log('\nShutting down...');
  server.close();
  // Terminate workers so the process can exit cleanly.
  await CaptureVisionRouter.terminateIdleWorkers();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
