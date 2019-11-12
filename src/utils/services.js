export class ApiService {
    _apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : "http://localhost:5000";

    getResource = async (url) => {
        const res = await fetch(`${this._apiBase}${url}`, {
            method: 'GET',
            "credentials": "include"
        });

        if (!res.ok) {
            throw new Error(`Couldn't fetch ${url}, received ${res.status}`);
        }

        return res.json();
    }

    postResource = async (url, data) => {
        const res = await fetch(`${this._apiBase}${url}`, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "Access-Control-Request-Headers": "session"
            },
            body: JSON.stringify(data),
            "credentials": "include"
        });

        if (!res.ok) {
            throw new Error(`Couldn't fetch ${url}, received ${res.status}`);
        }

        return res.json();
    }

    sendCode = async (phone) => {
        return await this.postResource('/sendCode', {
            phone_number: phone.replace(/\s/g, '')
        });
    }

    signIn = async (code, password) => {
        return await this.postResource('/signIn', {
            code: code,
            password: password || ''
        });
    }

    signUp = async (name, surname) => {
        return await this.postResource('/signUp', {
            name: name,
            surname: surname || ''
        });
    }

    isAuth = async () => {
        return await this.getResource('/isAuthorized');
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
