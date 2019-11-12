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

class TelegramApiWrapper {
    getDialogs = async (limit) => {
        const { result } = await telegramApi.getDialogs(0, limit);
        console.log('CHATS', result);

        const { chats, dialogs, messages, users } = result;

        const dialog_items = [];

        await messages.forEach((message, idx) => {
            const { first_name, last_name, status } = users[idx];
            // console.log(from_user);
            dialog_items.push({
                dialogTitle: first_name + " " + last_name,
                isOnline: status._ === "userStatusOnline" ? true : false,
                text: message.message,
                time: message.date,
                dialog_id: dialogs[idx].peer.user_id
            });
        });

        console.log(dialog_items);

        dialog_items.sort((a, b) => a.time - b.time);

        console.log(dialog_items);

        return dialog_items;
    }
}

const tWrapper = new TelegramApiWrapper();
tWrapper.getDialogs(20);
