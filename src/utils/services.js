export class ApiService {

    init() {
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
                        host: '149.154.167.50',
                        port: 443
                    }
                ]
            }
        });
    }

    getAuthToken = () => {
        return localStorage.getItem('userPhoneHash');
    }

    pendUser = async (phone) => {
        const data = await telegramApi.sendCode(phone);

        localStorage.setItem('userPhoneHash', data.phone_code_hash);

        return {
            isRegistered: data.phone_registered
        }
    }

    userLogin = async (phone, code) => {
        if (!code) {
            console.log('You should pass the code!');
            return;
        }
        const authToken = this.getAuthToken();
        if (!authToken) {
            console.log('User is not promted to sing in!');
            return;
        }

        const data = await telegramApi.signIn(phone, authToken, code)
            .catch(err => {
                if (err.type === 'SESSION_PASSWORD_NEEDED') {
                    console.log("BOY you need a password magic!");
                }
            });
    }

    _perform2FA = async () => {
        const firstData = await telegramApi.invokeApi('account.getPassword');
        console.log('[DEBUG_AUTH] ', firstData);
    }

    _parseISOString(s) {
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
    }

    _debugAuth = async (phone) => {
        console.log('[DEBUG_AUTH] THINK WHAT YOU DOING PAL');
        console.log('[DEBUG_AUTH] This is not optimized and may cause some freezes. CryptoAlgo is really slow');
        // localStorage.setItem('sendCodeTimeout', new Date().toISOString());

        let code = '';

        if (localStorage.getItem('someCoolItem')) {
            window.phone_code_hash = localStorage.getItem('userPhoneHash');
        } else {
            if (localStorage.getItem('sendCodeTimeout')) {
                const timePassed = new Date() - this._parseISOString(localStorage.getItem('sendCodeTimeout'));
                if (timePassed / 1000 < 300) {
                    console.log('[DEBUG_AUTH] You cannot send code now! Wait for', 300 - timePassed / 1000, 'seconds');
                    return;
                }
            }
            await telegramApi.sendCode(phone)
                .then(code => {
                    window.phone_code_hash = code.phone_code_hash;
                    localStorage.setItem('sendCodeTimeout', new Date().toISOString());
                })
                .catch(err => {
                    if (err.type.includes('FLOOD')) {
                        console.log('[DEBUG_AUTH] Ooops. You have flooded the Telegram API. Wait for',
                            err.type.split('_')[2],
                            'seconds (', err.type.split('_')[2] / 60 / 60, 'hours ) or use different phone');
                        window.phone_code_hash = null;
                        return;
                    }
                });

            if (window.phone_code_hash === null) return;
            code = prompt('CODE');
        }

        const code_hash = window.phone_code_hash;

        await telegramApi.signIn(phone, code_hash, code)
            .catch(err => {
                if (err.type === 'SESSION_PASSWORD_NEEDED') {
                    this._perform2FA();
                }
            });
    }

}

export class CountryApiService {

}