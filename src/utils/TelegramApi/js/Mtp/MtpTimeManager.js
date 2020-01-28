import StorageModule from "../Etc/Storage";
import { nextRandomInt, longFromInts } from "../lib/bin_utils";
import { tsNow, dT } from "../lib/utils";

export default function MtpTimeManagerModule() {
    window.lastMessageID = [0, 0];
    window.timeOffset = 0;

    const Storage = new StorageModule();

    Storage.methods.get('server_time_offset').then((to) => {
        if (to) {
            timeOffset = to;
        }
    });

    const generateMessageID = () => {
        const timeTicks = tsNow(),
            timeSec = Math.floor(timeTicks / 1000) + timeOffset,
            timeMSec = timeTicks % 1000,
            random = nextRandomInt(0xFFFF);

        let messageID = [timeSec, (timeMSec << 21) | (random << 3) | 4];
        if (lastMessageID[0] > messageID[0] ||
            lastMessageID[0] == messageID[0] && lastMessageID[1] >= messageID[1]) {

            messageID = [lastMessageID[0], lastMessageID[1] + 4];
        }

        lastMessageID = messageID;

        return longFromInts(messageID[0], messageID[1]);
    }

    const applyServerTime = (serverTime, localTime) => {
        const newTimeOffset = serverTime - Math.floor((localTime || tsNow()) / 1000),
            changed = Math.abs(timeOffset - newTimeOffset) > 10;
        Storage.set({ server_time_offset: newTimeOffset });

        lastMessageID = [0, 0];
        timeOffset = newTimeOffset;
        console.log(dT(), 'Apply server time', serverTime, localTime, newTimeOffset, changed);

        return changed;
    }

    return {
        generateID: generateMessageID,
        applyServerTime
    }

}
