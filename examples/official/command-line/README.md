# Node.js Command-Line Barcode Reader

A command-line barcode and QR code reader built with [dynamsoft-capture-vision-for-node](https://www.npmjs.com/package/dynamsoft-capture-vision-for-node). It decodes barcodes from image files (jpg, png, bmp, gif, tiff) and multi-page documents (pdf, tiff), then prints the format, text, confidence, and location of every barcode found.

## Prerequisites

- Node.js >= 16.x
- A Dynamsoft trial license: [get a 30-day free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Installation

```bash
npm install
```

This installs the SDK (`dynamsoft-capture-vision-for-node`) and the AI model package (`dynamsoft-capture-vision-for-node-model`) used by the read-rate-first template.

## Configuration

Set your license key either as an environment variable:

```bash
# Windows (cmd / PowerShell)
set DCV_LICENSE=YOUR-LICENSE-KEY
# Linux / macOS
export DCV_LICENSE=YOUR-LICENSE-KEY
```

or by replacing the `LICENSE-KEY` placeholder in `index.js`.

## Usage

```bash
node index.js <image-file> [--template <template-name>]
```

Decode all barcodes in an image:

```bash
node index.js ./AllSupportedBarcodeTypes.png
```

Decode a multi-page PDF page by page:

```bash
node index.js ./multi-page.pdf
```

Prioritize speed over read rate:

```bash
node index.js ./photo.jpg --template PT_READ_BARCODES_SPEED_FIRST
```

Available preset templates:

| Template | Purpose |
|---|---|
| `PT_READ_BARCODES` (default) | Balanced barcode reading |
| `PT_READ_BARCODES_SPEED_FIRST` | Speed-optimized reading |
| `PT_READ_BARCODES_READ_RATE_FIRST` | Read-rate-optimized reading (uses the AI model package) |
| `PT_READ_SINGLE_BARCODE` | Single-barcode detection |

## Sample Output

Real output for the bundled `AllSupportedBarcodeTypes.png` test image (19 barcodes), trimmed for brevity:

```text
Decoded 19 barcode(s):
------------------------------------------------
Format     : CODE_128
Text       : CODE128
Confidence : 100
Location   : (545, 72) (843, 73) (843, 173) (545, 172)
------------------------------------------------
Format     : CODE_93
Text       : CODE93
Confidence : 100
Location   : (940, 66) (1308, 66) (1308, 182) (940, 182)
------------------------------------------------
... 17 more barcode(s) ...

Elapsed time: 299 ms
```

## Supported Platforms

| OS | Arch |
|---|---|
| Windows | x86, x64 |
| Linux | x64 (glibc >= 2.18), arm64 |
| macOS | x64, arm64 |

## How It Works

- `CaptureVisionRouter.captureAsync()` processes the image in a worker thread; the SDK manages a thread pool sized to your CPU (`CaptureVisionRouter.maxWorkerCount` defaults to logical processors minus one).
- The input can be a file path, file bytes (`Uint8Array`), or raw camera frames (`DCVImageData`).
- `captureMultiPagesAsync()` iterates over every page of a PDF or TIFF and returns one result per page.
- `CaptureVisionRouter.terminateIdleWorkers()` shuts down the worker pool so the Node.js process can exit.
