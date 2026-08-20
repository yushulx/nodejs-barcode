# Node-RED Barcode Detection Module

This Node-RED module integrates the **Dynamsoft Capture Vision** SDK (`dynamsoft-capture-vision-for-node`), enabling barcode and QR code reading within your Node-RED flows. It decodes from image files (PNG, JPG, BMP, GIF), multi-page documents (PDF, TIFF), and base64 strings, and outputs structured results (page, format, text, confidence, location) on the `msg.payload`.

## Prerequisites

- Install [Node.js](https://nodejs.org/en/download/) (16+ recommended)
- Install [Node-RED](https://nodered.org/docs/getting-started/installation):

    ```bash
    npm install -g --unsafe-perm node-red
    node-red
    ```

    When you run `node-red` for the first time, a folder named `.node-red` will be created in your home directory:

    - **Windows**: `%userprofile%\.node-red`
    - **Linux**: `~/.node-red`

    If the default port `1880` is occupied, modify it in `.node-red/settings.js` to use a different port, such as `18800`.

- Obtain a [Dynamsoft Capture Vision Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Getting Started

1. Download the project and install the Node-RED Barcode module into your `.node-red` folder:

    ```bash
    cd %userprofile%\.node-red # Windows
    cd ~/.node-red # Linux
    npm install <path-to-node-red-barcode-module>
    ```

2. Launch Node-RED:

    ```bash
    node-red
    ```

3. In the Node-RED web editor, add the following nodes:
    - Inject Node
    - File Node
    - Barcode Node
    - Debug Node

    Configure the `File Node` to specify the path of the file you wish to read. The file can be an image (PNG, JPG, BMP, GIF, TIFF), a PDF document, or a file containing a base64 string. To display results in the console, enable the system console option in the `Debug Node`.

    ![Node RED barcode](https://www.dynamsoft.com/codepool/img/2018/11/node-red-debug.PNG)

4. Click on the Barcode Node to set your license key and choose a preset template:

    ![Barcode license](https://www.dynamsoft.com/codepool/img/2018/11/node-red-barcode-license.PNG)

    Available templates (leave the default `PT_READ_BARCODES` unless you need a specific behavior):

    | Template | Purpose |
    |---|---|
    | `PT_READ_BARCODES` (default) | Balanced barcode reading |
    | `PT_READ_BARCODES_SPEED_FIRST` | Speed-optimized reading |
    | `PT_READ_BARCODES_READ_RATE_FIRST` | Read-rate-optimized reading (uses the AI model package `dynamsoft-capture-vision-for-node-model`) |
    | `PT_READ_SINGLE_BARCODE` | Single-barcode detection |

5. Execute the Node-RED flow to see the barcode results displayed in the console:

    ![Node RED barcode results](https://www.dynamsoft.com/codepool/img/2018/11/node-red-barcode-results.PNG)

## Output payload

The barcode node sets `msg.payload` to an array of decoded objects:

```json
[
  {
    "page": 1,
    "format": "QR_CODE",
    "text": "www.dynamsoft.com",
    "confidence": 100,
    "location": [{ "x": 545, "y": 72 }, { "x": 843, "y": 73 }, { "x": 843, "y": 173 }, { "x": 545, "y": 172 }]
  }
]
```

- `page`: 1-based page number (for PDF/TIFF documents; always 1 for single images)
- `format`: detected barcode format (e.g., `QR_CODE`, `CODE_128`)
- `text`: decoded text
- `confidence`: 0-100 confidence
- `location`: four corner points of the barcode

## Blog

[Building a Barcode and QR Code Detection Module for Node-RED with JavaScript](https://www.dynamsoft.com/codepool/node-red-barcode-qr-detection-module.html)
