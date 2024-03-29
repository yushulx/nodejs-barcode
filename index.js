if (process.platform === 'win32') {
    console.log('Windows');
}
else if (process.platform === 'linux') {
    console.log('Linux');
}
else if (process.platform === 'darwin') {
    console.log('macOS');
}
else {
    console.log('Unknown Operating System');
}

var dbr = require('./build/Release/dbr');
var barcodeReader = null;
var formats = {
    'OneD': 0x000007FF,
    'PDF417': 0x02000000,
    'QRCode': 0x04000000,
    'DataMatrix': 0x08000000,
    'Aztec': 0x10000000
}
var instanceType = "";
var barcodeTypes = formats.OneD | formats.PDF417 | formats.QRCode | formats.DataMatrix | formats.Aztec;

function checkBarcodeReader() {
    if (barcodeReader == null) {
        barcodeReader = new dbr.BarcodeReader(instanceType);
    }
}
module.exports = {
    decodeFileAsync: function () {
        var callback = arguments[2];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[3];
        }
        else {
            template = arguments[2];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeFileAsync(arguments[0], arguments[1], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeFileStreamAsync: function () {
        var callback = arguments[3];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[4];
        }
        else {
            template = arguments[3];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeFileStreamAsync(arguments[0], arguments[1], arguments[2], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);

            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeBase64Async: function () {
        var callback = arguments[2];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[3];
        }
        else {
            template = arguments[2];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeBase64Async(arguments[0], arguments[1], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeYUYVAsync: function () {
        var callback = arguments[4];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[5];
        }
        else {
            template = arguments[4];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeYUYVAsync(arguments[0], arguments[1], arguments[2], arguments[3], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeBufferAsync: function () {
        var callback = arguments[5];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[6];
        }
        else {
            template = arguments[5];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeBufferAsync(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    setInstanceType: function (type) {
        instanceType = type;
    },
    formats: formats,
    barcodeTypes: barcodeTypes,
    BarcodeReader: dbr.BarcodeReader,
    getVersion: dbr.getVersionNumber,
    initLicense: dbr.initLicense,
    setLicenseCachePath: dbr.setLicenseCachePath,
    destroyInstance: function () {
        barcodeReader.destroyInstance();
        barcodeReader = null;
    }
};