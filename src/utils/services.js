import { sjcl } from './LocalExports';
import 'sjcl/core/bn';
import 'sjcl/core/ecc';
import 'sjcl/core/srp';
import 'sjcl/core/sha1';

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

    errorHandle = (err) => {
        console.log('Something went wrong!', err);
        return false;
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

    _H = (data) => {
        return sjcl.hash.sha256.hash(data);
    }

    _SH = (data, salt) => {
        return this._H(sjcl.bitArray.concat(sjcl.bitArray.concat(salt, data), salt));
    }

    _PH1 = (password, salt1, salt2) => {
        return this._SH(this._SH(password, salt1), salt2);
    }

    _PH2 = (password, salt1, salt2) => {
        return this._SH(sjcl.misc.pbkdf2(this._PH1(password, salt1, salt2), salt1, 100000, 64), salt2);
    }

    _calcPasswordHash = (password, clientSalt, serverSalt) => {
        return this._PH2(password, clientSalt, serverSalt);
    }

    _calcPasswordSRPHash = (password, clientSalt, serverSalt, gInit, pInit, g_bInit) => {
        let x = this._PH2(password, clientSalt, serverSalt);
        x = sjcl.bn.fromBits(x);
        console.log('[DEBUG CALC] Passed 1', x);
        let g = new sjcl.bn(gInit);
        let p = new sjcl.bn(pInit);
        let v = g.powermod(x, p);
        console.log('[DEBUG CALC] Passed 1.1', x);

        let group = sjcl.keyexchange.srp.knownGroup(2048);

        // let g = group.g;
        // let p = group.N;
        let g_b = new sjcl.bn(g_bInit);

        console.log('[DEBUG CALC] Passed 2', g, p, g_b);
        alert('CONTINUE?');

        console.log('[DEBUG CALC] Passed 3');

        let k = sjcl.bn.fromBits(this._H(g | v));

        console.log('[DEBUG CALC] Passed 4');

        let k_v = k.powermod(v, p);
        let a = sjcl.bn.fromBits(sjcl.random.randomWords(64));

        console.log('[DEBUG CALC] Passed 5');

        let g_a = g.powermod(a, p);
        let u = sjcl.bn.fromBits(this._H(g_a | g_b));

        console.log('[DEBUG CALC] Passed 6');

        let t = g_b.sub(k_v).mod(p);
        console.log('[DEBUG CALC] Passed 6.1');
        let s_a = t.powermod(a.add(u.mul(x)), p);
        console.log('[DEBUG CALC] Passed 6.2');
        let k_a = sjcl.bn.fromBits(this._H(s_a.toString()));
        console.log('[DEBUG CALC] Passed 6.3');

        console.log('[DEBUG CALC] Passed 7 OMG HERE IT COMES');

        // M1 := H(H(p) xor H(g) | H2(salt1) | H2(salt2) | g_a | g_b | k_a)
        let M1 = this._H(this._H(p.toString()) ^ this._H(g.toString()) | this._H(clientSalt) | this._H(serverSalt) | g_a | g_b).toString();
        return { M1, A: g_a };
    }

    _checkPassword = async (data) => {
        return await telegramApi.invokeApi('auth.checkPassword', data)
            .catch(this.errorHandle);
    }

    _perform2FA = async () => {
        const firstData = await telegramApi.invokeApi('account.getPassword')
            .catch(this.errorHandle);
        if (!firstData) return;

        console.log('[DEBUG_AUTH] ', firstData);

        const { srp_B, srp_id } = firstData;
        const { salt1, salt2, g, p } = firstData.current_algo;
        const password = prompt('Type in your 2FA password');

        const loadedInfo = localStorage.getItem('userAuthInfo');

        if (
            loadedInfo &&
            loadedInfo.srp_B === srp_B &&
            loadedInfo.salt1 === salt1 &&
            loadedInfo.salt2 === salt2 &&
            loadedInfo.g === g &&
            loadedInfo.p === p
        ) {
            const { M1, A } = loadedInfo;
            const auth = this._checkPassword({
                "password": {
                    _: "inputCheckPasswordSRP",
                    srp_id,
                    A,
                    M1
                }
            });

            if (!auth) return;
            console.log(auth);

        } else {
            const { M1, A } = this._calcPasswordSRPHash(password, salt1, salt2, g, p, srp_B);

            localStorage.setItem('userAuthInfo', JSON.stringify(
                {
                    srp_B,
                    salt1,
                    salt2,
                    g,
                    p,
                    M1,
                    A
                }
            ));

            const auth = this._checkPassword({
                "password": {
                    _: "inputCheckPasswordSRP",
                    srp_id,
                    A,
                    M1
                }
            });
            if (!auth) return;
            console.log(auth);
        }
    }

    _parseISOString(s) {
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
    }

    _debugAuth = async (phone) => {
        console.log('[DEBUG_AUTH] THINK WHAT YOU DOING PAL');
        console.log('[DEBUG_AUTH] This is not optimized and may cause some freezes. CryptoAlgo is really slow');

        console.log('[DEBUG_API] ', Object.getOwnPropertyNames(telegramApi));
        // localStorage.setItem('sendCodeTimeout', new Date().toISOString());

        let code = '';

        if (localStorage.getItem('authInfo')) {
            console.log('[DEBUG_AUTH] You have already logged in! Proceed as normal.');
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
                            'seconds (', err.type.split('_')[2] / 60 / 60, 'hours ) or use different app_id');
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