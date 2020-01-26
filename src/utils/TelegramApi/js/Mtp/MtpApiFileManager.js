import MtpApiManagerModule from "./MtpApiManager";

export default class MtpApiFileManagerModule {
    cachedFs = false;
    cachedFsPromise = false;
    cachedSavePromises = {};
    cachedDownloadPromises = {};
    cachedDownloads = {};

    downloadPulls = {};
    downloadActives = {};

    MtpApiManager = new MtpApiManagerModule();

    downloadRequest(dcID, cb, activeDelta) {
        if (this.downloadPulls[dcID] === undefined) {
            this.downloadPulls[dcID] = [];
            this.downloadActives[dcID] = 0;
        }

        const downloadPull = this.downloadPulls[dcID];
        return new Promise((resolve, reject) => {
            downloadPull.push({ cb: cb, resolve: resolve, reject: reject, activeDelta: activeDelta });
            setZeroTimeout(() => {
                this.downloadCheck(dcID);
            });
        });
    }

    downloadCheck(dcID) {
        const downloadPull = this.downloadPulls[dcID];
        const downloadLimit = dcID == 'upload' ? 11 : 5;

        if (this.downloadActives[dcID] >= downloadLimit || !downloadPull || !downloadPull.length) {
            return false;
        }

        const data = downloadPull.shift(),
            activeDelta = data.activeDelta || 1;

        this.downloadActives[dcID] += activeDelta;

        const a = index++;
        data.cb()
            .then((result) => {
                this.downloadActives[dcID] -= activeDelta;
                this.downloadCheck(dcID);

                data.resolve(result);

            }, (error) => {
                this.downloadActives[dcID] -= activeDelta;
                this.downloadCheck(dcID);

                data.reject(error);
            });
    }

    uploadFile(file) {
        let fileSize = file.size,
            isBigFile = fileSize >= 10485760,
            canceled = false,
            resolved = false,
            doneParts = 0,
            partSize = 262144, // 256 Kb
            activeDelta = 2;

        if (!fileSize) {
            return Promise.reject({ type: 'EMPTY_FILE' });
        }

        if (fileSize > 67108864) {
            partSize = 524288;
            activeDelta = 4;
        } else if (fileSize < 102400) {
            partSize = 32768;
            activeDelta = 1;
        }

        const totalParts = Math.ceil(fileSize / partSize);

        if (totalParts > 3000) {
            return Promise.reject({ type: 'FILE_TOO_BIG' });
        }

        return new Promise((resolve, reject) => {
            let fileID = [nextRandomInt(0xFFFFFFFF), nextRandomInt(0xFFFFFFFF)],
                errorHandler = function (error) {
                    // console.error('Up Error', error);
                    reject(error);
                    canceled = true;
                    errorHandler = noop;
                },
                part = 0,
                offset,
                resultInputFile = {
                    _: isBigFile ? 'inputFileBig' : 'inputFile',
                    id: fileID,
                    parts: totalParts,
                    name: file.name,
                    md5_checksum: ''
                };

            for (offset = 0; offset < fileSize; offset += partSize) {
                ((offset, part) => {
                    this.downloadRequest('upload', () => {
                        return new Promise((uploadResolve, uploadReject) => {
                            // var uploadDeferred = new Promise();

                            const reader = new FileReader();
                            const blob = file.slice(offset, offset + partSize);

                            reader.onloadend = (e) => {
                                if (canceled) {
                                    uploadReject();
                                    return;
                                }
                                if (e.target.readyState != FileReader.DONE) {
                                    return;
                                }
                                this.MtpApiManager.invokeApi(isBigFile ? 'upload.saveBigFilePart' : 'upload.saveFilePart', {
                                    file_id: fileID,
                                    file_part: part,
                                    file_total_parts: totalParts,
                                    bytes: e.target.result
                                }, {
                                    startMaxLength: partSize + 256,
                                    fileUpload: true,
                                    singleInRequest: true
                                }).then((result) => {
                                    doneParts++;
                                    uploadResolve();
                                    if (doneParts >= totalParts) {
                                        resolve(resultInputFile);
                                        resolved = true;
                                    } else {
                                        console.log(dT(), 'Progress', doneParts * partSize / fileSize);
                                        resolve({ done: doneParts * partSize, total: fileSize });
                                    }
                                }, errorHandler);
                            };

                            reader.readAsArrayBuffer(blob);
                        });
                    }, activeDelta);
                })(offset, part++);
            }

            this.cancel = () => {
                console.log('cancel upload', canceled, resolved);
                if (!canceled && !resolved) {
                    canceled = true;
                    errorHandler({ type: 'UPLOAD_CANCELED' });
                }
            };
        });
    }
}
