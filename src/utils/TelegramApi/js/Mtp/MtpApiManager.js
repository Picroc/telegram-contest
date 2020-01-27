import MtpSingleInstanceServiceModule from "./MtpSingleInstanceService";
import StorageModule from "../Etc/Storage";
import TelegramMeWebServiceModule from "../Etc/TelegramMeWebService";
import { extend, isObject } from "../Etc/Helper";
import qSyncModule from "../Etc/qSync";
import { bytesFromHex, bytesToHex } from "../lib/bin_utils";
import MtpNetworkerFactoryModule from "./MtpNetworkerFactory";
import MtpAuthorizerModule from "./MtpAuthorizer";
import { dT, tsNow } from "../lib/utils";

export default class MtpApiManagerModule {
    cachedNetworkers = {};
    cachedUploadNetworkers = {};
    cachedExportPromise = {};
    baseDcID = false;

    telegramMeNotified;

    MtpSingleInstanceService = new MtpSingleInstanceServiceModule();
    MtpNetworkerFactory = new MtpNetworkerFactoryModule();
    MtpAuthorizer = new MtpAuthorizerModule();
    Storage = new StorageModule();
    TelegramMeWebService = new TelegramMeWebServiceModule();
    qSync = new qSyncModule();

    constructor() {
        this.MtpSingleInstanceService.start();

        this.Storage.get('dc').then((dcID) => {
            if (dcID) {
                this.baseDcID = dcID;
            }
        });
    }

    telegramMeNotify = (newValue) => {
        if (this.telegramMeNotified !== newValue) {
            this.telegramMeNotified = newValue;
            this.TelegramMeWebService.setAuthorized(this.telegramMeNotified);
        }
    }

    mtpSetUserAuth = (dcID, userAuth) => {
        const fullUserAuth = extend({ dcID: dcID }, userAuth);
        this.Storage.set({
            dc: dcID,
            user_auth: fullUserAuth
        });
        this.telegramMeNotify(true);

        this.baseDcID = dcID;
    }

    mtpLogOut = () => {
        const storageKeys = [];
        for (let dcID = 1; dcID <= 5; dcID++) {
            storageKeys.push('dc' + dcID + '_auth_key');
        }

        return this.Storage.get.apply(Storage, storageKeys).then((storageResult) => {
            const logoutPromises = [];
            for (let i = 0; i < storageResult.length; i++) {
                if (storageResult[i]) {
                    logoutPromises.push(this.mtpInvokeApi('auth.logOut', {}, { dcID: i + 1 }));
                }
            }
            return Promise.all(logoutPromises).then(() => {
                this.Storage.remove('dc', 'user_auth');
                this.baseDcID = false;
                this.telegramMeNotify(false);
            }, (error) => {
                this.Storage.remove.apply(storageKeys);
                this.Storage.remove('dc', 'user_auth');
                this.baseDcID = false;
                error.handled = true;
                this.telegramMeNotify(false);
            });
        });
    }

    mtpGetNetworker = (dcID, options) => {
        options = options || {};

        const cache = (options.fileUpload || options.fileDownload)
            ? cachedUploadNetworkers
            : cachedNetworkers;
        if (!dcID) {
            throw new Exception('get Networker without dcID');
        }

        if (cache[dcID] !== undefined) {
            return this.qSync.when(cache[dcID]);
        }

        const akk = 'dc' + dcID + '_auth_key',
            ssk = 'dc' + dcID + '_server_salt';

        return this.Storage.get(akk, ssk).then((result) => {

            if (cache[dcID] !== undefined) {
                return cache[dcID];
            }

            var authKeyHex = result[0],
                serverSaltHex = result[1];
            // console.log('ass', dcID, authKeyHex, serverSaltHex);
            if (authKeyHex && authKeyHex.length == 512) {
                const authKey = bytesFromHex(authKeyHex);
                const serverSalt = bytesFromHex(serverSaltHex);

                return cache[dcID] = this.MtpNetworkerFactory.getNetworker(dcID, authKey, serverSalt, options);
            }

            if (!options.createNetworker) {
                return Promise.reject({ type: 'AUTH_KEY_EMPTY', code: 401 });
            }

            return this.MtpAuthorizer.auth(dcID).then((auth) => {
                const storeObj = {};
                storeObj[akk] = bytesToHex(auth.authKey);
                storeObj[ssk] = bytesToHex(auth.serverSalt);
                this.Storage.set(storeObj);

                console.log("AUTH", auth);

                return cache[dcID] = this.MtpNetworkerFactory.getNetworker(dcID, auth.authKey, auth.serverSalt, options);
            }, (error) => {
                console.log('Get networker error', error, error.stack);
                return Promise.reject(error);
            });
        });
    }

    mtpInvokeApi = (method, params, options) => {
        options = options || {};

        return new Promise((resolve, reject) => {
            const rejectPromise = (error) => {
                if (!error) {
                    error = { type: 'ERROR_EMPTY' };
                } else if (!isObject(error)) {
                    error = { message: error };
                }
                reject(error);

                if (!options.noErrorBox) {
                    error.input = method;
                    error.stack = error.originalError && error.originalError.stack || error.stack || (new Error()).stack;
                    setTimeout(function () {
                        if (!error.handled) {
                            if (error.code == 401) {
                                mtpLogOut();
                            }
                            error.handled = true;
                        }
                    }, 100);
                }
            }

            let dcID,
                networkerPromise;

            let cachedNetworker;
            let stack = (new Error()).stack;
            if (!stack) {
                try {
                    window.unexistingFunction();
                } catch (e) {
                    stack = e.stack || '';
                }
            }

            const performRequest = (networker) => {
                return (cachedNetworker = networker).wrapApiCall(method, params, options).then(
                    (result) => {
                        resolve(result);
                    },
                    (error) => {
                        console.error(dT(), 'Error', error.code, error.type, this.baseDcID, dcID);
                        if (error.code == 401 && this.baseDcID == dcID) {
                            this.Storage.remove('dc', 'user_auth');
                            this.telegramMeNotify(false);
                            rejectPromise(error);
                        }
                        else if (error.code == 401 && this.baseDcID && dcID != this.baseDcID) {
                            if (this.cachedExportPromise[dcID] === undefined) {
                                const exportPromise = new Promise((exportResolve, exportReject) => {
                                    this.mtpInvokeApi('auth.exportAuthorization', { dc_id: dcID }, { noErrorBox: true }).then((exportedAuth) => {
                                        this.mtpInvokeApi('auth.importAuthorization', {
                                            id: exportedAuth.id,
                                            bytes: exportedAuth.bytes
                                        }, { dcID: dcID, noErrorBox: true }).then(() => {
                                            exportResolve();
                                        }, (e) => {
                                            exportReject(e);
                                        })
                                    }, (e) => {
                                        exportReject(e)
                                    });
                                });

                                this.cachedExportPromise[dcID] = exportPromise;
                            }

                            this.cachedExportPromise[dcID].then(() => {
                                (cachedNetworker = networker).wrapApiCall(method, params, options).then((result) => {
                                    resolve(result);
                                }, rejectPromise);
                            }, rejectPromise);
                        }
                        else if (error.code == 303) {
                            const newDcID = error.type.match(/^(PHONE_MIGRATE_|NETWORK_MIGRATE_|USER_MIGRATE_)(\d+)/)[2];
                            if (newDcID != dcID) {
                                if (options.dcID) {
                                    options.dcID = newDcID;
                                } else {
                                    this.Storage.set({ dc: this.baseDcID = newDcID });
                                }

                                this.mtpGetNetworker(newDcID, options).then((networker) => {
                                    networker.wrapApiCall(method, params, options).then((result) => {
                                        resolve(result);
                                    }, rejectPromise);
                                }, rejectPromise);
                            }
                        }
                        else if (!options.rawError && error.code == 420) {
                            const waitTime = error.type.match(/^FLOOD_WAIT_(\d+)/)[1] || 10;
                            if (waitTime > (options.timeout || 60)) {
                                return rejectPromise(error);
                            }
                            setTimeout(() => {
                                performRequest(cachedNetworker);
                            }, waitTime * 1000);
                        }
                        else if (!options.rawError && (error.code == 500 || error.type == 'MSG_WAIT_FAILED')) {
                            const now = tsNow();
                            if (options.stopTime) {
                                if (now >= options.stopTime) {
                                    return rejectPromise(error);
                                }
                            } else {
                                options.stopTime = now + (options.timeout !== undefined ? options.timeout : 10) * 1000;
                            }
                            options.waitTime = options.waitTime ? Math.min(60, options.waitTime * 1.5) : 1;
                            setTimeout(() => {
                                performRequest(cachedNetworker);
                            }, options.waitTime * 1000);
                        }
                        else {
                            rejectPromise(error);
                        }
                    });
            };

            dcID = options.dcID || this.baseDcID;
            if (dcID) {
                mtpGetNetworker(dcID, options).then(performRequest, rejectPromise);
            } else {
                this.Storage.get('dc').then((baseDcID) => {
                    mtpGetNetworker(dcID = baseDcID || 2, options).then(performRequest, rejectPromise);
                });
            }
        });
    }

    mtpGetUserID = () => {
        return this.Storage.get('user_auth').then((auth) => {
            this.telegramMeNotify(auth && auth.id > 0 || false);
            return auth.id || 0;
        });
    }

    getBaseDcID = () => {
        return baseDcID || false;
    }

    //legacy

    invokeApi = this.mtpInvokeApi;
    getUserID = this.mtpGetUserID;

}
