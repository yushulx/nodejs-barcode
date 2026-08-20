const path = require('node:path');
const fs = require('node:fs');
const {
  LicenseManager,
  CaptureVisionRouter,
  EnumPresetTemplate,
  EnumErrorCode,
} = require('dynamsoft-capture-vision-for-node');

module.exports = function (RED) {
  function BarcodeNode(config) {
    RED.nodes.createNode(this, config);
    this.license = config.license;
    this.template = config.template || EnumPresetTemplate.PT_READ_BARCODES;
    const node = this;

    /**
     * Decode a single image/path or a multi-page document.
     * @param {string | Uint8Array} inputData file path or file bytes
     * @param {string} templateName preset template name
     * @returns {Promise<Array>} array of CapturedResult, one entry per page
     */
    async function decode(inputData, templateName) {
      const isPath = typeof inputData === 'string';
      const ext = isPath ? path.extname(inputData).toLowerCase() : '';
      const isMultiPage = isPath && (ext === '.pdf' || ext === '.tif' || ext === '.tiff');

      if (isMultiPage) {
        return CaptureVisionRouter.captureMultiPagesAsync(inputData, templateName);
      }

      try {
        const result = await CaptureVisionRouter.captureAsync(inputData, templateName);
        return [result];
      } catch (err) {
        // PDF/TIFF bytes passed as Uint8Array: retry with the multi-page API.
        if (err && err.dcvErrorCode === EnumErrorCode.EC_MULTI_PAGES_NOT_SUPPORTED) {
          return CaptureVisionRouter.captureMultiPagesAsync(inputData, templateName);
        }
        throw err;
      }
    }

    /** Convert SDK results into a plain JSON payload. */
    function toPayload(results) {
      const payload = [];
      results.forEach((result, pageIndex) => {
        const items = result.barcodeResultItems || [];
        const page =
          result.originalImageTag && typeof result.originalImageTag.pageNumber === 'number'
            ? result.originalImageTag.pageNumber + 1
            : pageIndex + 1;
        for (const item of items) {
          payload.push({
            page,
            format: item.formatString,
            text: item.text,
            confidence: item.confidence,
            location: item.location.points.map((p) => ({ x: p.x, y: p.y })),
          });
        }
      });
      return payload;
    }

    node.on('input', async function (msg) {
      try {
        const templateName =
          EnumPresetTemplate[node.template] ||
          node.template ||
          EnumPresetTemplate.PT_READ_BARCODES;

        if (msg.filename && msg.filename.toLowerCase().indexOf('base64') > -1) {
          // The file contains a base64 string.
          LicenseManager.initLicense(node.license);
          const data = fs.readFileSync(msg.filename, 'utf8').trim();
          const bytes = new Uint8Array(Buffer.from(data, 'base64'));
          const results = await decode(bytes, templateName);
          msg.payload = toPayload(results);
          node.send(msg);
        } else if (msg.filename) {
          // Image file or PDF file.
          LicenseManager.initLicense(node.license);
          const results = await decode(msg.filename, templateName);
          msg.payload = toPayload(results);
          node.send(msg);
        } else if (msg.payload) {
          // Base64 string passed directly in the payload.
          LicenseManager.initLicense(node.license);
          const data = String(msg.payload).trim();
          const bytes = new Uint8Array(Buffer.from(data, 'base64'));
          const results = await decode(bytes, templateName);
          msg.payload = toPayload(results);
          node.send(msg);
        } else {
          node.warn('No filename or payload to decode.');
        }
      } catch (err) {
        node.error(`Barcode decoding failed: ${err.message || err}`, msg);
      }
    });
  }

  RED.nodes.registerType('barcode', BarcodeNode);
};