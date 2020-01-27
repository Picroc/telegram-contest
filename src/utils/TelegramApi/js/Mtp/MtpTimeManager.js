import StorageModule from "../Etc/Storage";
import { nextRandomInt, longFromInts } from "../lib/bin_utils";
import { tsNow, dT } from "../lib/utils";

export default class MtpTimeManagerModule {
    lastMessageID = [0, 0];
    timeOffset = 0;

    Storage = new StorageModule();

    constructor() {
        this.Storage.get('server_time_offset').then((to) => {
            if (to) {
                this.timeOffset = to;
            }
        });
    }

    generateMessageID = () => {
        const timeTicks = tsNow(),
            timeSec = Math.floor(timeTicks / 1000) + this.timeOffset,
            timeMSec = timeTicks % 1000,
            random = nextRandomInt(0xFFFF);

        let messageID = [timeSec, (timeMSec << 21) | (random << 3) | 4];
        if (lastMessageID[0] > messageID[0] ||
            lastMessageID[0] == messageID[0] && lastMessageID[1] >= messageID[1]) {

            messageID = [lastMessageID[0], lastMessageID[1] + 4];
        }

        this.lastMessageID = messageID;

        return longFromInts(messageID[0], messageID[1]);
    }

    applyServerTime = (serverTime, localTime) => {
        const newTimeOffset = serverTime - Math.floor((localTime || tsNow()) / 1000),
            changed = Math.abs(this.timeOffset - newTimeOffset) > 10;
        this.Storage.set({ server_time_offset: newTimeOffset });

        this.lastMessageID = [0, 0];
        this.timeOffset = newTimeOffset;
        console.log(dT(), 'Apply server time', serverTime, localTime, newTimeOffset, changed);

        return changed;
    }
}
