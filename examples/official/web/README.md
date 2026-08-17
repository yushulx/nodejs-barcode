# Node.js Web Barcode Reader

A web barcode and QR code reader built with [dynamsoft-capture-vision-for-node](https://www.npmjs.com/package/dynamsoft-capture-vision-for-node) and [Express](https://expressjs.com/). Upload an image in the browser; the Node.js server decodes every barcode in a worker thread and returns the format, text, confidence, and location as JSON. The page draws green bounding boxes over detected barcodes on a canvas.

## Prerequisites

- Node.js >= 16.x
- A Dynamsoft trial license: [get a 30-day free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Installation

```bash
npm install
```

This installs the SDK (`dynamsoft-capture-vision-for-node`), the AI model package (`dynamsoft-capture-vision-for-node-model`), Express, and Multer.

## Configuration

Set your license key either as an environment variable:

```bash
# Windows (cmd / PowerShell)
set DCV_LICENSE=YOUR-LICENSE-KEY
# Linux / macOS
export DCV_LICENSE=YOUR-LICENSE-KEY
```

or by replacing the `LICENSE-KEY` placeholder in `server.js`.

## Usage

```bash
npm start
```

Then open [http://localhost:2020](http://localhost:2020) in your browser, drop an image onto the page, and click **Decode**. No barcode image at hand? Click **Load sample image** to decode the bundled `public/sample.png`, which contains 19 barcodes of different symbologies.

You can change the port with the `PORT` environment variable.

## REST API

### `POST /api/decode`

Multipart form fields:

| Field | Type | Description |
|---|---|---|
| `image` | file (required) | Image to decode (jpg, png, bmp, gif, tiff; max 10 MB) |
| `template` | string (optional) | Preset template name, e.g. `PT_READ_BARCODES_SPEED_FIRST` |

Example with curl:

```bash
curl -F "image=@barcode.png" -F "template=PT_READ_BARCODES" http://localhost:2020/api/decode
```

Response:

```json
{
  "count": 1,
  "elapsedTime": 96,
  "queueLength": 0,
  "barcodes": [
    {
      "format": "QR_CODE",
      "text": "https://www.dynamsoft.com",
      "confidence": 100,
      "location": [
        { "x": 120, "y": 48 },
        { "x": 420, "y": 48 },
        { "x": 420, "y": 348 },
        { "x": 120, "y": 348 }
      ]
    }
  ]
}
```

## How It Works

- Uploaded file bytes stay in memory (Multer `memoryStorage`) and are passed straight to `CaptureVisionRouter.captureAsync()` - no temporary files.
- Decoding runs in the SDK's worker-thread pool, so concurrent uploads do not block the Express event loop. `CaptureVisionRouter.maxWorkerCount` defaults to logical processors minus one; extra requests are queued automatically.
- You do not need PM2 cluster mode for parallelism, but `pm2 start server.js` is still useful for automatic restarts.
- `dataTransferType: 'copy'` keeps the uploaded buffer accessible after decoding, which is safer for request/response lifecycles.

## Supported Platforms

| OS | Arch |
|---|---|
| Windows | x86, x64 |
| Linux | x64 (glibc >= 2.18), arm64 |
| macOS | x64, arm64 |
