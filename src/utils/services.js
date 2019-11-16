telegramApi.setConfig({
    app: {
        id: 1166576, /* App ID */
        hash: '99db6db0082e27973ee4357e4637aadc', /* App hash */
        version: '0.0.1' /* App version */
    },
    server: {
        test: [
            {
                id: 2, /* DC ID */
                host: '149.154.167.40',
                port: 443
            }
        ],
        production: [
            {
                id: 2, /* DC ID */
                host: '149.154.167.40',
                port: 443
            }
        ]
    }
});

export class CountryApiService {
    _apiBase = 'https://restcountries.eu/rest/v2';

    _transformCountry = (countryData) => {
        return {
            flagUrl: countryData.flag,
            name: countryData.name,
            code: countryData.callingCodes[0],
            alpha: countryData.alpha2Code
        }
    }

    getResource = async (url) => {
        const res = await fetch(`${this._apiBase}${url}`, {
            method: 'GET'
        });

        if (!res.ok) {
            throw new Error(`Couldn't fetch ${url}, received ${res.status}`);
        }

        return res.json();
    }

    getAllCountries = async () => {
        const res = await this.getResource('/all');

        return res.map(this._transformCountry);
    }
}

export class TelegramApiWrapper {

    _convertDate = (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let time = new Date(date * 1000);
        const currentTime = new Date();

        const startOfTheWeek = (date) => {
            const now = date ? new Date(date) : new Date();
            now.setHours(0, 0, 0, 0);
            const monday = new Date(now);
            monday.setDate(1);
            return monday
        }

        if (time.getDay() - currentTime.getDay() === 0) {
            time = `${time.getHours()}:${time.getMinutes()}`
        } else if (time.getDay() > startOfTheWeek(time)) {
            time = days[time.getDay()]
        } else {
            time = time.toLocaleDateString().replace(/[/]/g, '.');
            time = time.slice(0, 6) + time.slice(8)
        }

        return time;
    }

    spamMyself = async (message) => {
        telegramApi.invokeApi('messages.sendMessage', {
            peer: {
                _: 'inputPeerSelf'
            },
            message,
            random_id: Math.round(Math.random() * 100000)
        })
    }

    getDialogs = async (limit) => {
        const { result } = await telegramApi.getDialogs(0, limit);
        console.log('CHATS', result);

        const { chats, dialogs, messages, users } = result;

        const dialog_items = [];

        await messages.forEach((message, idx) => {
            const { first_name, last_name, status } = users[idx];
            const { date } = message;

            dialog_items.push({
                title: first_name + " " + last_name,
                isOnline: status._ === "userStatusOnline" ? true : false,
                text: message.message,
                time: this._convertDate(date),
                unreadCount: dialogs[idx].unread_count,
                dialog_peer: dialogs[idx].peer
            });
        });

        dialog_items.sort((a, b) => a.time - b.time);

        console.log(dialog_items);

        return dialog_items;
    }

    mapPeerToTruePeer = (peer) => {
        const type = peer._;
        if (type === 'peerUser') {
            return {
                ...peer,
                _: 'inputPeerUser',
                user_id: peer.user_id.toString()
            }
        } else if (type === 'peerChat') {
            return {
                ...peer,
                _: 'inputPeerChat',
                chat_id: peer.chat_id.toString()
            }
        } else if (type === 'peerChannel') {
            return {
                ...peer,
                _: 'inputPeerChannel',
                channel_id: peer.channel_id.toString()
            }
        }
        return peer;
    }

    getMessagesFromPeer = async (peer, limit = 10) => {
        return await telegramApi.invokeApi('messages.getHistory', {
            peer: this.mapPeerToTruePeer(peer),
            limit
        });
    }
}