export default class MtpAuthorizerModule {
    chromeMatches = navigator.userAgent.match(/Chrome\/(\d+(\.\d+)?)/);
    chromeVersion = this.chromeMatches && parseFloat(this.chromeMatches[1]) || false;
    xhrSendBuffer = !('ArrayBufferView' in window) && (!this.chromeVersion || this.chromeVersion < 30);

    mtpSendPlainRequest = (dcID, requestBuffer) => {
        const requestLength = requestBuffer.byteLength,
            requestArray = new Int32Array(requestBuffer);

        const header = new TLSerialization();
        header.storeLongP(0, 0, 'auth_key_id'); // Auth key
        header.storeLong(MtpTimeManager.generateID(), 'msg_id'); // Msg_id
        header.storeInt(requestLength, 'request_length');
    }
}
