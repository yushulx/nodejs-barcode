{
    "variables": {
        "arch": ["<!(node -e \"console.log(process.arch);\")"]
    },
    "targets": [
        {
            "target_name": "dbr",
            "sources": ["src/dbr.cc"],
            "defines": [
                "NAPI_DISABLE_CPP_EXCEPTIONS"
            ],
            "include_dirs": [
                "./",
                "<!(node -e \"try { require.resolve('node-addon-api'); console.log(require('node-addon-api').include); } catch (e) { console.log(require('child_process').execSync('npm root -g').toString().trim() + '/node-addon-api'); }\")",
                "<!(node -e \"require('child_process').execSync('node -p process.execPath').toString().trim() + '/../../include/node'\")"
            ],
            "conditions": [
                ["OS=='linux'", {
                    "defines": ["LINUX_DBR"],
                    "cflags": ["-std=c++17", "-DNAPI_CPP_EXCEPTIONS", "-fexceptions"],
                    "cflags_cc": ["-std=c++17", "-DNAPI_CPP_EXCEPTIONS", "-fexceptions"],
                    "ldflags": ["-Wl,-rpath,'$$ORIGIN'"],
                    "libraries": [
                        "-lDynamsoftCore", "-lDynamsoftLicense", "-lDynamsoftCaptureVisionRouter", "-lDynamsoftUtility", "-L../platforms/linux/<(arch)"
                    ],
                    "copies": [
                        {
                            "destination": "build/Release/",
                            "files": [
                                "./platforms/linux/<(arch)/libDynamicImage.so",
                                "./platforms/linux/<(arch)/libDynamicPdf.so",
                                "./platforms/linux/<(arch)/libDynamicPdfCore.so",
                                "./platforms/linux/<(arch)/libDynamsoftBarcodeReader.so",
                                "./platforms/linux/<(arch)/libDynamsoftCaptureVisionRouter.so",
                                "./platforms/linux/<(arch)/libDynamsoftCore.so",
                                "./platforms/linux/<(arch)/libDynamsoftImageProcessing.so",
                                "./platforms/linux/<(arch)/libDynamsoftLicense.so",
                                "./platforms/linux/<(arch)/libDynamsoftUtility.so",
                            ]
                        }
                    ]
                }],
                ["OS=='win'", {
                    "defines": ["WINDOWS_DBR", "NAPI_CPP_EXCEPTIONS"],
                    "libraries": [
                        "-l../platforms/windows/DynamsoftCorex64.lib", "-l../platforms/windows/DynamsoftLicensex64.lib", "-l../platforms/windows/DynamsoftCaptureVisionRouterx64.lib", "-l../platforms/windows/DynamsoftUtilityx64.lib"
                    ],
                    "copies": [
                        {
                            "destination": "build/Release/",
                            "files": [
                                "./platforms/windows/DynamicImagex64.dll",
                                "./platforms/windows/DynamicPdfCorex64.dll",
                                "./platforms/windows/DynamicPdfx64.dll",
                                "./platforms/windows/DynamsoftBarcodeReaderx64.dll",
                                "./platforms/windows/DynamsoftCaptureVisionRouterx64.dll",
                                "./platforms/windows/DynamsoftCorex64.dll",
                                "./platforms/windows/DynamsoftImageProcessingx64.dll",
                                "./platforms/windows/DynamsoftLicensex64.dll",
                                "./platforms/windows/DynamsoftUtilityx64.dll",
                                "./platforms/windows/vcomp140.dll"
                            ]
                        }
                    ]

                }],
                ["OS=='mac'", {
                    "defines": ["MAC_DBR"],
                    "cflags": ["-std=c++17", "-DNAPI_CPP_EXCEPTIONS"],
                    "cflags_cc": ["-std=c++17", "-DNAPI_CPP_EXCEPTIONS"],
                    "link_settings": {
                        "libraries": [
                            "-Wl,-rpath,@loader_path",
                             "-lDynamsoftCore", "-lDynamsoftLicense", "-lDynamsoftCaptureVisionRouter", "-lDynamsoftUtility", "-L../platforms/macos"
                        ],
                    },
                    "copies": [
                        {
                            "destination": "build/Release/",
                            "files": [
                                "./platforms/macos/libDynamicImagex64.dylib",
                                "./platforms/macos/libDynamicPdf.dylib",
                                "./platforms/macos/libDynamicPdfCore.dylib",
                                "./platforms/macos/libDynamsoftBarcodeReader.dylib",
                                "./platforms/macos/libDynamsoftCaptureVisionRouter.dylib",
                                "./platforms/macos/libDynamsoftCore.dylib",
                                "./platforms/macos/libDynamsoftImageProcessing.dylib",
                                "./platforms/macos/libDynamsoftLicense.dylib",
                                "./platforms/macos/libDynamsoftUtility.dylib",
                            ]
                        }
                    ]
                }]
            ]
        }
    ]
}
