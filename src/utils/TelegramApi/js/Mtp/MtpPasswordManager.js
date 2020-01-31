import MtpApiManagerModule from './MtpApiManager';
import { bufferConcat } from '../lib/bin_utils';
import CryptoWorkerModule from '../Etc/CryptoWorker';
import MtpSecureRandom from './MtpSecureRandom';

export default class MtpPasswordManagerModule {
	MtpApiManager = MtpApiManagerModule();
	CryptoWorker = new CryptoWorkerModule();

	getState = options =>
		this.MtpApiManager.invokeApi('account.getPassword', {}, options).then(result => {
			console.log(result);
			return result;
		});

	updateSettings = (state, settings) => {
		console.log(settings);

		let currentHashPromise;
		let newHashPromise;

		const params = {
			new_settings: {
				_: 'account.passwordInputSettings',
				flags: 0,
				hint: settings.hint || '',
			},
		};

		if (typeof settings.cur_password === 'string' && state.current_salt && settings.cur_password.length > 0) {
			currentHashPromise = this.makePasswordHash(state.current_salt, settings.cur_password);
		} else {
			currentHashPromise = Promise.resolve([]);
		}

		if (typeof settings.new_password === 'string' && settings.new_password.length > 0) {
			const saltRandom = new Array(8);
			const newSalt = bufferConcat(state.new_salt, saltRandom);
			MtpSecureRandom(saltRandom);
			newHashPromise = this.makePasswordHash(newSalt, settings.new_password);
			params.new_settings.new_salt = newSalt;
			params.new_settings.flags |= 1;
		} else {
			if (typeof settings.new_password === 'string') {
				params.new_settings.flags |= 1;
				params.new_settings.new_salt = [];
			}
			newHashPromise = Promise.resolve([]);
		}

		if (typeof settings.email === 'string') {
			params.new_settings.flags |= 2;
			params.new_settings.email = settings.email || '';
		}

		return Promise.all([currentHashPromise, newHashPromise]).then(hashes => {
			params.current_password_hash = hashes[0];
			params.new_settings.new_password_hash = hashes[1];

			return this.MtpApiManager.invokeApi('account.updatePasswordSettings', params);
		});
	};

	check = (state, password, options) =>
		this.makePasswordHash(state.current_salt, password).then(passwordHash => {
			return this.MtpApiManager.invokeApi(
				'auth.checkPassword',
				{
					password_hash: passwordHash,
				},
				options
			);
		});

	requestRecovery = (state, options) => this.MtpApiManager.invokeApi('auth.requestPasswordRecovery', {}, options);

	recover = (code, options) =>
		this.MtpApiManager.invokeApi(
			'auth.recoverPassword',
			{
				code: code,
			},
			options
		);

	makePasswordHash = (salt, password) => {
		const passwordUTF8 = unescape(encodeURIComponent(password));

		let buffer = new ArrayBuffer(passwordUTF8.length);
		const byteView = new Uint8Array(buffer);
		for (let i = 0, len = passwordUTF8.length; i < len; i++) {
			byteView[i] = passwordUTF8.charCodeAt(i);
		}

		buffer = bufferConcat(bufferConcat(salt, byteView), salt);

		return this.CryptoWorker.sha256Hash(buffer);
	};
}
