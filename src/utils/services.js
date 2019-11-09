import { sjcl } from './LocalExports';
import 'sjcl/core/bn';
import 'sjcl/core/ecc';
import 'sjcl/core/srp';
import 'sjcl/core/sha1';

import schema from '../helpers/apiSchema.json';

import MTProto from 'telegram-mtproto';
import BrowserStorage from 'mtproto-storage-browser';
import localforage from 'localforage';

export class ApiService {

    init = async () => {
        // WARNING! DO NOT USE THE APP_ID AND HASH POSTED BELOW
        // OR YOUR APP WILL BE BLOCKED

        // CONFIGURATION
        this.app = {
            id: 1166576,
            hash: '99db6db0082e27973ee4357e4637aadc'
        };
        const api = {
            layer: 74,
            api_id: this.app.id
        }

        const server = {
            dev: true,
            webogram: true
        }

        localforage.config({
            storeName: 'authData',
            driver: localforage.LOCALSTORAGE
        });

        console.log(
            localforage.keys()
        )

        // CHECKING IF ALREADY LOGGED IN
        this.authRequired = true;

        // CHECKING IF ALREADY LOGGED IN
        if (localStorage.getItem('keepSignIn')) {
            this.authRequired = false;
        }

        this.data = {
            dc2_auth_id: await localforage.getItem('recover/dc2_auth_id'),
            dc2_auth_key: await localforage.getItem('recover/dc2_auth_key'),
            dc2_server_salt: await localforage.getItem('recover/dc2_server_salt')
        }

        console.log('DATA IS HERE');
        console.log(this.data);

        await this._updateSession(true);

        this.client = MTProto({
            server,
            api,
            schema,
            app: {
                debug: true,
                storage: new BrowserStorage(localforage)
            }
        });
    }

    _updateSession = async (anyway) => {
        if (this.authRequired && !anyway) return;
        if (this.data["dc2_auth_id"]) await localforage.setItem('dc2_auth_id', this.data.dc2_auth_id);
        if (this.data["dc2_auth_key"]) await localforage.setItem('dc2_auth_key', this.data.dc2_auth_key);
        if (this.data["dc2_server_salt"]) await localforage.setItem('dc2_server_salt', this.data.dc2_server_salt);
    }

    _saveSession = async () => {
        const savedData = {
            dc2_auth_id: await localforage.getItem('dc2_auth_id'),
            dc2_auth_key: await localforage.getItem('dc2_auth_key'),
            dc2_server_salt: await localforage.getItem('dc2_server_salt')
        }

        await localforage.setItem('recover/dc2_auth_id', savedData.dc2_auth_id);
        await localforage.setItem('recover/dc2_auth_key', savedData.dc2_auth_key);
        await localforage.setItem('recover/dc2_server_salt', savedData.dc2_server_salt);
    }

    _monitorStorage = async (message = "Printing current state") => {
        console.log(message);
        return await localforage.iterate(function (value, key, iterationNumber) {
            console.log([key, value]);
        });
    }

    _flushLocalData = () => {
        return localforage.clear();
    }

    errorHandle = (err) => {
        console.log('Something went wrong!', err);
        return false;
    }

    _getUserInfo = () => {
        if (this.authRequired) {
            console.log('There is not authorized user now');
            return;
        }

        return JSON.parse(localStorage.getItem('userInfo'));
    }

    authUser = async (phone) => {
        if (!this.authRequired) {
            console.log('Already logged as', this._getUserInfo());
            return;
        }

        if (!phone) {
            console.log('Please provide phone number!');
        }

        const { phone_code_hash } = await this.client('auth.sendCode', {
            phone_number: phone,
            api_id: this.app.id,
            api_hash: this.app.hash
        }).catch(err => { throw new Error(err) });

        this.codeRequested = true;
        this.phone_code_hash = phone_code_hash;

        return { phone_code_hash, phone };
    }

    signInUser = async (phone, code) => {
        await this._saveSession();
        if (!this.codeRequested) { console.log('No code to validate!'); return; }

        return await this.client('auth.signIn', {
            phone_number: phone.toString(),
            phone_code_hash: this.phone_code_hash,
            phone_code: code
        })
            .then(res => {
                // localStorage.setItem('keepSignIn', 'yes'); // May be will not work
                this.authRequired = false;
                return res;
            })
            .catch(err => {
                this.passwordNeeded = true;
                throw new Error(err);
            }); // TODO PASS TO SIGNUP OR 2FA
    }

    // FUNCTIONS FOR SRP with Pbkdf2 password calculations

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

    _checkPassword = async ({ srp_id, A, M1 }) => {
        return await this.client('auth.checkPassword', {
            "password": {
                _: "inputCheckPasswordSRP",
                srp_id,
                A,
                M1
            }
        }).catch(this.errorHandle);
    }

    _perform2FA = async () => {
        const firstData = await this.client('account.getPassword')
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
            const auth = this._checkPassword({ srp_id, A, M1 });

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

            const auth = this._checkPassword({ srp_id, A, M1 });
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

        const authData = await this.authUser(phone);
        if (!this.codeRequested) return;

        const { phone_code_hash } = authData;
        const code = prompt('Type in your code');

        const user = await this.signInUser(phone, code);
        if (this.passwordNeeded) await this._perform2FA();

        await this._monitorStorage('after sign in');

        console.log('You have logged in as', user);
    }

    _debugInvokeApi = (...args) => this.client(...args);

    // Telegram methods

    getAllChats = async (exclude_ids) => {
        console.log('Trying to get all chats');

        const res = await this.client('messages.getAllChats', {
            except_ids: exclude_ids ? [...exclude_ids] : []
        });

        console.log(res);
    }



}

export class CountryApiService {
    _apiBase = 'https://restcountries.eu/rest/v2';

    _transformCountry = (countryData) => {
        return {
            flagUrl: countryData.flag,
            name: countryData.name,
            code: countryData.callingCodes[0]
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
