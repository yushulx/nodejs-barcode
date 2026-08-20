# Node.js Multi-Page PDF Barcode Reader

A command-line barcode reader for **multi-page PDF files** built with [dynamsoft-capture-vision-for-node](https://www.npmjs.com/package/dynamsoft-capture-vision-for-node). It decodes 1D and 2D barcodes (QR Code, Code 128, EAN-13, DataMatrix, PDF417, etc.) from every page of a PDF, prints the format, text, confidence, and location of each barcode — grouped by page — and can optionally export all results to a JSON file.

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
node index.js <pdf-file> [--template <template-name>] [--json <output.json>]
```

Read all barcodes from a multi-page PDF:

```bash
node index.js ./barcodes.pdf
```

Export every decoded barcode to a JSON file:

```bash
node index.js ./barcodes.pdf --json result.json
```

Use the read-rate-first template (requires the AI model package):

```bash
node index.js ./barcodes.pdf --template PT_READ_BARCODES_READ_RATE_FIRST
```

Available preset templates:

| Template | Purpose |
|---|---|
| `PT_READ_BARCODES` (default) | Balanced barcode reading |
| `PT_READ_BARCODES_SPEED_FIRST` | Speed-optimized reading |
| `PT_READ_BARCODES_READ_RATE_FIRST` | Read-rate-optimized reading (uses the AI model package) |
| `PT_READ_SINGLE_BARCODE` | Single-barcode detection |

## Sample Output

Real output for the bundled `barcodes.pdf` test file (5 pages, 17 barcodes), trimmed for brevity:

```text
# Page 1
  Decoded 1 barcode(s):
  --------------------------------------------
  Format     : QR_CODE
  Text       : www.dynamsoft.com
  Confidence : 85
  Location   : (2166, 36) (2340, 36) (2342, 212) (2166, 210)

# Page 5
  Decoded 13 barcode(s):
  --------------------------------------------
  Format     : CODE_128
  Text       : CODE128
  Confidence : 100
  Location   : (1498, 550) (2094, 552) (2094, 752) (1498, 750)
  --------------------------------------------
  Format     : PDF417
  Text       : www.dynamsoft.com
  Confidence : 84
  Location   : (452, 2698) (1360, 2698) (1360, 2978) (452, 2978)
  ...

Total barcodes decoded: 17
Elapsed time: 614 ms
Results written to: D:\...\sample-output.json
```

## Test Files

- `barcodes.pdf` — a 5-page PDF containing 17 barcodes across 12 different formats.
- Multi-page PDFs are also provided elsewhere in this repo (`examples/command-line/MultiPage.pdf`, `test.pdf`).

## Supported Platforms

| OS | Arch |
|---|---|
| Windows | x86, x64 |
| Linux | x64 (glibc >= 2.18), arm64 |
| macOS | x64, arm64 |

## How It Works

- `CaptureVisionRouter.captureMultiPagesAsync()` decodes every page of a PDF and returns one `CapturedResult` per page — no `FileFetcher` or result listener is required.
- Each result's `originalImageTag` carries the page number; `barcodeResultItems` holds the decoded barcodes for that page.
- The input can be a file path or file bytes (`Uint8Array`).
- `CaptureVisionRouter.terminateIdleWorkers()` shuts down the worker pool so the Node.js process can exit.