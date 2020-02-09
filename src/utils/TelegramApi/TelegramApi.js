import './js/lib/polyfill';
import './js/lib/config';
import MtpNetworkerFactoryModule from './js/Mtp/MtpNetworkerFactory';
import MtpApiManagerModule from './js/Mtp/MtpApiManager';
import AppPeersManagerModule from './js/App/AppPeersManager';
import MtpApiFileManagerModule from './js/Mtp/MtpApiFileManager';
import AppUsersManagerModule from './js/App/AppUsersManager';
import AppProfileManagerModule from './js/App/AppProfileManager';
import MtpPasswordManagerModule from './js/Mtp/MtpPasswordManager';
import AppsChatsManagerModule from './js/App/AppChatsManager';
import FileSaverModule from './js/Etc/FileSaver';
import { nextRandomInt } from './js/lib/bin_utils';
import { isArray, isFunction, forEach, map, min, noop } from './js/Etc/Helper';
import $timeout from './js/Etc/angular/$timeout';
import { Config } from './js/lib/config';
import AppUpdatesManagerModule from './js/App/AppUpdatesManager';

export default class TelegramApi {
	options = { dcID: 2, createNetworker: true };

	user = {};

	AppChatsManager = new AppsChatsManagerModule();
	AppUsersManager = new AppUsersManagerModule();

	AppPeersManager = new AppPeersManagerModule();
	AppProfileManager = new AppProfileManagerModule();

	MtpApiManager = new MtpApiManagerModule();
	MtpApiFileManager = new MtpApiFileManagerModule();
	MtpPasswordManager = new MtpPasswordManagerModule();
	FileSaver = new FileSaverModule();
	MtpNetworkerFactory = MtpNetworkerFactoryModule();

	AppUpdatesManager = new AppUpdatesManagerModule();

	constructor() {
		this.MtpNetworkerFactory.setUpdatesProcessor(message => {
			switch (message._) {
				case 'updates':
					this.AppChatsManager.saveApiChats(message.chats);
					this.AppUsersManager.saveApiUsers(message.users);
					break;
			}
		});

		window.apiManager = this.MtpApiManager;
		this.MtpApiFileManager = new MtpApiFileManagerModule();

		this.setConfig({
			app: {
				id: 1166576 /* App ID */,
				hash: '99db6db0082e27973ee4357e4637aadc' /* App hash */,
				version: '0.0.1' /* App version */,
			},
			server: {
				test: [
					{ id: 1, host: '149.154.175.10', port: 443 },
					{ id: 2, host: '149.154.167.40', port: 443 },
					{ id: 3, host: '149.154.175.117', port: 443 },
				],
				production: [
					{ id: 1, host: '149.154.175.50', port: 443 },
					{ id: 2, host: '149.154.167.50', port: 443 },
					{ id: 3, host: '149.154.175.100', port: 443 },
					{ id: 4, host: '149.154.167.91', port: 443 },
					{ id: 5, host: '149.154.171.5', port: 443 },
				],
			},
			mode: {
				test: false,
				debug: false,
			},
		});

		this.getUserInfo()
			.then(meUser => {
				if (meUser.id) {
					this.user = meUser;
				}
			})
			.catch(err => {
				if (Config.Modes.debug) {
					console.log('User not found', err);
				}
			});

		// To be removed
		const updateTestHandler = payload => {
			console.log(payload);

			if (this.user.id === payload.from_id || payload.message_info.out) {
				console.log('Got peer', this.user);
			} else {
				this.getPeerByID(payload.from_id)
					.then(peer => {
						console.log('Got peer', peer);
					})
					.catch(err => {
						console.log('Peer not found', err);
					});
			}
		};

		// this.subscribeToUpdates('dialogs', updateTestHandler);
	}

	invokeApi = (method, params) => this.MtpApiManager.invokeApi(method, params);

	sendCode = phone_number =>
		this.MtpApiManager.invokeApi(
			'auth.sendCode',
			{
				phone_number: phone_number,
				// sms_type: 5,
				api_id: Config.App.id,
				api_hash: Config.App.hash,
				lang_code: navigator.language || 'en',
				settings: {
					_: 'codeSettings',
				},
			},
			this.options
		);

	signIn = (phone_number, phone_code_hash, phone_code) =>
		this.MtpApiManager.invokeApi(
			'auth.signIn',
			{
				phone_number: phone_number,
				phone_code_hash: phone_code_hash,
				phone_code: phone_code,
			},
			this.options
		).then(result => {
			console.log(this.options);
			if (result._ === 'auth.authorizationSignUpRequired') {
				throw 'PHONE_NUMBER_UNOCCUPIED';
			}

			this.MtpApiManager.setUserAuth(this.options.dcID, {
				id: result.user.id,
			});
			this.user = result.user;
			return result;
		});

	signIn2FA = password =>
		this.MtpPasswordManager.getState().then(result => {
			return this.MtpPasswordManager.check(result, password, this.options).then(result => {
				this.MtpApiManager.setUserAuth(this.options.dcID, {
					id: result.user.id,
				});
				this.user = result.user;
				return result;
			});
		});

	setUp2FA = (old_password, password, email, hint) =>
		this.MtpPasswordManager.getState().then(result => {
			return this.MtpPasswordManager.updateSettings(result, {
				cur_password: old_password,
				new_password: password,
				email: email,
				hint: hint,
			});
		});

	signUp = (phone_number, phone_code_hash, phone_code, first_name, last_name) =>
		this.MtpApiManager.invokeApi(
			'auth.signUp',
			{
				phone_number: phone_number,
				phone_code_hash: phone_code_hash,
				phone_code: phone_code,
				first_name: first_name || '',
				last_name: last_name || '',
			},
			this.options
		).then(result => {
			this.user = result.user;
			this.MtpApiManager.setUserAuth(this.options.dcID, {
				id: result.user.id,
			});
		});

	sendMessage = (id, message) =>
		this.MtpApiManager.invokeApi('messages.sendMessage', {
			flags: 0,
			peer: this.AppPeersManager.getInputPeerByID(id),
			message: message,
			random_id: [nextRandomInt(0xffffffff), nextRandomInt(0xffffffff)],
			reply_to_msg_id: 0,
			entities: [],
		});

	startBot = botName =>
		this.MtpApiManager.invokeApi('contacts.search', { q: botName, limit: 1 }).then(result => {
			this.AppUsersManager.saveApiUsers(result.users);
			return this.sendMessage(result.users[0].id, '/start');
		});

	sendSms = (phone_number, phone_code_hash, next_type) => {
		return this.MtpApiManager.invokeApi(
			'auth.resendCode',
			{
				phone_number: phone_number,
				phone_code_hash: phone_code_hash,
				next_type: next_type,
			},
			this.options
		);
	};

	setConfig = config => {
		config = config || {};

		config.app = config.app || {};
		config.server = config.server || {};

		config.server.test = config.server.test || [];
		config.server.production = config.server.production || [];

		config.mode.test = config.mode.test || false;
		config.mode.debug = config.mode.debug || false;

		Config.App.id = config.app.id;
		Config.App.hash = config.app.hash;
		Config.App.version = config.app.version || Config.App.version;

		Config.Server.Test = config.server.test;
		Config.Server.Production = config.server.production;

		Config.Modes.test = config.mode.test;
		Config.Modes.debug = config.mode.debug;

		this.MtpApiManager.invokeApi('help.getNearestDc', {}, this.options).then(nearestDcResult => {
			if (nearestDcResult.nearest_dc != nearestDcResult.this_dc) {
				this.MtpApiManager.getNetworker(nearestDcResult.nearest_dc, { createNetworker: true });
			}
		});
	};

	createChat = (title, userIDs) => {
		title = title || '';
		userIDs = userIDs || [];

		if (!isArray(userIDs)) {
			throw new Error('[userIDs] is not array');
		}

		const inputUsers = [];

		for (let i = 0; i < userIDs.length; i++) {
			inputUsers.push(this.AppUsersManager.getUserInput(userIDs[i]));
		}

		return this.MtpApiManager.invokeApi('messages.createChat', {
			title: title,
			users: inputUsers,
		}).then(updates => {
			// TODO: Remove
			if (updates.chats && updates.chats[0]) {
				return this.MtpApiManager.invokeApi('messages.toggleChatAdmins', {
					chat_id: updates.chats[0].id,
					enabled: true,
				});
			} else {
				return updates;
			}
		});
	};

	getChatLink = (chatID, force) => this.AppProfileManager.getChatInviteLink(chatID, force);

	getUserInfo = () =>
		this.MtpApiManager.getUserID().then(id => {
			const user = this.AppUsersManager.getUser(id);

			if (!user.id || !user.deleted) {
				return user;
			} else {
				return this.MtpApiManager.invokeApi('users.getFullUser', {
					id: { _: 'inputUserSelf' },
				}).then(userInfoFull => {
					this.AppUsersManager.saveApiUser(userInfoFull.user);
					return this.AppUsersManager.getUser(id);
				});
			}
		});

	getFullUserInfo = () =>
		this.MtpApiManager.getUserID().then(id => {
			const user = this.AppUsersManager.getFullUser(id);

			if (user.user && (!user.user.id || !user.user.deleted)) {
				return user;
			} else {
				return this.MtpApiManager.invokeApi('users.getFullUser', {
					id: { _: 'inputUserSelf' },
				}).then(userInfoFull => {
					this.AppUsersManager.saveFullUser(userInfoFull);
					return this.AppUsersManager.getFullUser(id);
				});
			}
		});

	getUserPhoto = size => {
		return this.getFullUserInfo().then(user => {
			Config.Modes.debug && console.log('USER', user);
			if (!user.profile_photo) {
				return null;
			}

			return this.getPhotoFile(user.profile_photo, size);
		});
	};

	logOut = () => this.MtpApiManager.logOut();

	createChannel = (title, about) =>
		this.MtpApiManager.invokeApi(
			'channels.createChannel',
			{
				title: title || '',
				flags: 0,
				about: about || '',
			},
			this.options
		).then(data => {
			this.AppChatsManager.saveApiChats(data.chats);
			return data;
		});

	getHistory = params => {
		params = params || {};
		params.id = params.id || 0;
		params.take = params.take || 15;
		params.skip = params.skip || 0;
		params.type = params.type || 'chat';

		if (params.type == 'chat' && params.id > 0) {
			params.id = params.id * -1;
		}

		return this.MtpApiManager.invokeApi('messages.getHistory', {
			peer: this.AppPeersManager.getInputPeerByID(params.id),
			offset_id: 0,
			add_offset: params.skip,
			limit: params.take,
		});
	};

	sendFile = params => {
		params = params || {};
		params.id = params.id || 0;
		params.type = params.type || 'chat';
		params.file = params.file || {};
		params.caption = params.caption || '';

		if (params.type == 'chat' && params.id > 0) {
			params.id = params.id * -1;
		}

		return this.MtpApiFileManager.uploadFile(params.file).then(inputFile => {
			const file = params.file;

			inputFile.name = file.name;

			const inputMedia = {
				_: 'inputMediaUploadedDocument',
				file: inputFile,
				mime_type: file.type,
				caption: params.caption,
				attributes: [{ _: 'documentAttributeFilename', file_name: file.name }],
			};

			return this.MtpApiManager.invokeApi('messages.sendMedia', {
				peer: this.AppPeersManager.getInputPeerByID(params.id),
				media: inputMedia,
				random_id: [nextRandomInt(0xffffffff), nextRandomInt(0xffffffff)],
			});
		});
	};

	downloadDocument = (doc, progress, autosave) => {
		doc = doc || {};
		doc.id = doc.id || 0;
		doc.access_hash = doc.access_hash || 0;
		doc.attributes = doc.attributes || [];
		doc.size = doc.size || 0;

		if (!isFunction(progress)) {
			progress = noop;
		}

		const location = {
			_: 'inputDocumentFileLocation',
			id: doc.id,
			access_hash: doc.access_hash,
			file_reference: doc.file_reference,
		};
		let fileName = 'FILE';
		let size = 15728640;
		let limit = 524288;
		let offset = 0;
		return new Promise((resolve, request) => {
			const bytes = [];

			if (doc.size > size) {
				throw new Error('Big file not supported');
			}

			size = doc.size;

			forEach(doc.attributes, attr => {
				if (attr._ == 'documentAttributeFilename') {
					fileName = attr.file_name;
				}
			});

			const download = () => {
				if (offset < size) {
					this.MtpApiManager.invokeApi('upload.getFile', {
						location: location,
						offset: offset,
						limit: limit,
					}).then(result => {
						bytes.push(result.bytes);
						offset += limit;
						progress(offset < size ? offset : size, size);
						download();
					});
				} else {
					if (autosave) {
						this.FileSaver.save(bytes, fileName);
					}
					resolve({
						bytes: bytes,
						fileName: fileName,
						type: doc.mime_type,
					});
				}
			};

			$timeout(download);
		});
	};

	joinChat = link => {
		let regex;
		let hash;

		regex = link.match(/^https:\/\/telegram.me\/joinchat\/([\s\S]*)/);

		if (regex) {
			hash = regex[1];
		} else {
			hash = link;
		}

		return this.MtpApiManager.invokeApi('messages.importChatInvite', { hash: hash }).then(updates => {
			this.AppChatsManager.saveApiChats(updates.chats);
			this.AppUsersManager.saveApiUsers(updates.users);
		});
	};

	editChatAdmin = (chatID, userID, isAdmin) => {
		if (typeof isAdmin == 'undefined') {
			isAdmin = true;
		}

		isAdmin = !!isAdmin;
		chatID = this.AppChatsManager.getChatInput(chatID);
		userID = this.AppUsersManager.getUserInput(userID);

		return this.MtpApiManager.invokeApi('messages.editChatAdmin', {
			chat_id: chatID,
			user_id: userID,
			is_admin: isAdmin,
		});
	};

	editChatTitle = (chat_id, title) =>
		this.MtpApiManager.invokeApi('messages.editChatTitle', {
			chat_id: chat_id,
			title: title,
		});

	editChannelAdmin = (channel_id, user_id) =>
		this.MtpApiManager.invokeApi('channels.editAdmin', {
			channel: this.AppChatsManager.getChannelInput(channel_id),
			user_id: this.AppUsersManager.getUserInput(user_id),
			role: { _: 'channelRoleEditor' },
		});

	getFullChat = chat_id => this.MtpApiManager.invokeApi('messages.getFullChat', { chat_id });

	downloadPhoto = (photo, progress, autosave) => {
		const photoSize = photo.sizes[photo.sizes.length - 1];
		const location = {
			_: 'inputPhotoFileLocation',
			id: photo.id,
			access_hash: photo.access_hash,
			file_reference: photo.file_reference,
			thumb_size: 'c',
		};

		if (!isFunction(progress)) {
			progress = noop;
		}

		const fileName = photo.id + '.jpg';
		let size = 15728640;
		let limit = 524288;
		let offset = 0;

		return new Promise((resolve, reject) => {
			const bytes = [];

			if (photoSize.size > size) {
				throw new Error('Big file not supported');
			}

			size = photoSize.size;

			const download = () => {
				if (offset < size) {
					this.MtpApiManager.invokeApi('upload.getFile', {
						location: location,
						offset: offset,
						limit: limit,
					}).then(result => {
						bytes.push(result.bytes);
						offset += limit;
						progress(offset < size ? offset : size, size);
						download();
					});
				} else {
					if (autosave) {
						this.FileSaver.save(bytes, fileName);
					}
					resolve({
						bytes: bytes,
						fileName: fileName,
						type: 'image/jpeg',
					});
				}
			};

			$timeout(download);
		});
	};

	editChannelTitle = (channel_id, title) =>
		this.MtpApiManager.invokeApi('channels.editTitle', {
			channel: this.AppChatsManager.getChannelInput(channel_id),
			title: title,
		});

	deleteMessages = ids => {
		if (!isArray(ids)) {
			ids = [ids];
		}

		return this.MtpApiManager.invokeApi('messages.deleteMessages', { id: ids });
	};

	subscribeToUpdates = (type, handler) => {
		this.AppUpdatesManager.subscribe(type, handler);
	};

	getPeerByID = id => {
		const peer = this.AppPeersManager.getPeer(id);

		return new Promise((resolve, reject) => {
			if (!peer.deleted) {
				return resolve(peer);
			}

			let offsetDate = 0;
			let dialogsLoaded = 0;
			let totalCount = 0;
			let load;

			(load = () => {
				this.MtpApiManager.invokeApi('messages.getDialogs', {
					offset_peer: this.AppPeersManager.getInputPeerByID(0),
					limit: 100,
					offset_date: offsetDate,
				}).then(
					result => {
						this.AppChatsManager.saveApiChats(result.chats);
						this.AppUsersManager.saveApiUsers(result.users);

						dialogsLoaded += result.dialogs.length;
						totalCount = result.count;

						const peer = this.AppPeersManager.getPeer(id);

						if (!peer.deleted) {
							resolve(peer);
							return;
						}

						if (totalCount && dialogsLoaded < totalCount) {
							const dates = map(result.messages, msg => {
								return msg.date;
							});
							offsetDate = min(dates);
							load();
							return;
						}

						reject({ type: 'PEER_NOT_FOUND' });
					},
					err => {
						reject(err);
					}
				);
			})();
		});
	};

	getDocumentPreview = doc => {
		const location = doc.thumb.location;
		let limit = 524288;

		location._ = 'inputFileLocation';

		if (doc.thumb.size > limit) {
			throw new Error('Size of document exceed limit');
		}

		return this.MtpApiManager.invokeApi('upload.getFile', {
			location: location,
			offset: 0,
			limit: limit,
		});
	};

	editUserPhoto = photo => {
		return this.MtpApiFileManager.uploadFile(photo).then(inputFile => {
			return this.invokeApi('photos.uploadProfilePhoto', {
				file: inputFile,
			});
		});
	};

	editChatPhoto = (chat_id, photo) => {
		return this.MtpApiFileManager.uploadFile(photo).then(inputFile => {
			return this.MtpApiManager.invokeApi('messages.editChatPhoto', {
				chat_id: chat_id,
				photo: {
					_: 'inputChatUploadedPhoto',
					file: inputFile,
					crop: {
						_: 'inputPhotoCropAuto',
					},
				},
			});
		});
	};

	editChannelPhoto = (channel_id, photo) => {
		return this.MtpApiFileManager.uploadFile(photo).then(inputFile => {
			return this.MtpApiManager.invokeApi('channels.editPhoto', {
				channel: this.AppChatsManager.getChannelInput(channel_id),
				photo: {
					_: 'inputChatUploadedPhoto',
					file: inputFile,
					crop: {
						_: 'inputPhotoCropAuto',
					},
				},
			});
		});
	};

	checkPhone = phone_number => this.MtpApiManager.invokeApi('auth.checkPhone', { phone_number: phone_number });

	getDialogs = (offset, limit) => {
		offset = offset || 0;
		limit = limit || 50;

		return this.MtpApiManager.invokeApi('messages.getDialogs', {
			offset_peer: this.AppPeersManager.getInputPeerByID(0),
			offset_date: offset,
			limit: limit,
		}).then(dialogsResult => {
			// console.log('Saving users', dialogsResult);
			this.AppUsersManager.saveApiUsers(dialogsResult.users);
			this.AppChatsManager.saveApiChats(dialogsResult.chats);

			const dates = map(dialogsResult.messages, msg => {
				return msg.date;
			});

			return {
				result: dialogsResult,
				offset: Math.max(...dates),
			};
		});
	};

	getMessages = ids => {
		if (!isArray(ids)) {
			ids = [ids];
		}

		return this.MtpApiManager.invokeApi('messages.getMessages', { id: ids }).then(updates => {
			this.AppUsersManager.saveApiUsers(updates.users);
			this.AppChatsManager.saveApiChats(updates.chats);

			return updates;
		});
	};

	//processing methods go from here

	_convertDate = date => {
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		let time = new Date(date * 1000);
		const currentTime = new Date();

		const startOfTheWeek = date => {
			const now = date ? new Date(date) : new Date();
			now.setHours(0, 0, 0, 0);
			const monday = new Date(now);
			monday.setDate(1);
			return monday;
		};

		const formatTime = t => (t < 10 ? '0' + t : t);

		if (time.getDay() - currentTime.getDay() === 0) {
			time = `${formatTime(time.getHours())}:${formatTime(time.getMinutes())}`;
		} else if (time.getDay() > startOfTheWeek(time)) {
			time = days[time.getDay()];
		} else {
			time = time.toLocaleDateString().replace(/[/]/g, '.');
			time = time.slice(0, 6) + time.slice(8);
		}

		return time;
	};

	spamMyself = async message => {
		this.invokeApi('messages.sendMessage', {
			peer: {
				_: 'inputPeerSelf',
			},
			message,
			random_id: Math.round(Math.random() * 100000),
		});
	};

	_checkFlag = (flags, idx) => {
		return (flags & (2 ** idx)) === 2 ** idx;
	};

	_checkMessageFlags = msg_flags => ({
		out: this._checkFlag(msg_flags, 1),
		mentioned: this._checkFlag(msg_flags, 4),
		media_unread: this._checkFlag(msg_flags, 5),
		muted: this._checkFlag(msg_flags, 13),
		channel_post: this._checkFlag(msg_flags, 14),
		scheduled: this._checkFlag(msg_flags, 18),
		legacy: this._checkFlag(msg_flags, 19),
		hide_edit: this._checkFlag(msg_flags, 21),
	});

	_parseDialog = (dialog, chats, messages, users) => {
		let peer = dialog.peer;
		let title,
			status,
			photo,
			is_supergroup = false;
		if (peer._ === 'peerChat') {
			const chat = chats[chats.findIndex(el => el.id === peer.chat_id)];
			title = chat.title;
			if (chat.photo && chat.photo._ !== 'chatPhotoEmpty') {
				photo = chat.photo;
			}
		} else if (peer._ === 'peerChannel') {
			const idx = chats.findIndex(el => el.id === peer.channel_id);
			const channel = chats[idx];

			is_supergroup = this._checkFlag(channel.flags, 8);

			title = channel.title;
			if (channel.photo && channel.photo._ !== 'chatPhotoEmpty') {
				photo = channel.photo;
			}
			peer = {
				...peer,
				access_hash: channel.access_hash,
			};
		} else {
			const user = users[users.findIndex(el => el.id === peer.user_id)];
			const last_name = user.last_name ? ' ' + user.last_name : '';
			title = user.first_name + last_name;
			status = user.status;
			if (user.photo && user.first_name !== 'Telegram') {
				photo = user.photo;
			}
			peer = user.access_hash
				? {
						...peer,
						access_hash: user.access_hash,
				  }
				: peer;
		}
		const message = messages[messages.findIndex(el => el.id === dialog.top_message)];
		const { message: text, date, flags: msg_flags } = message;
		const unread_count = dialog.unread_count;

		if (photo) {
			photo = this.getPeerPhoto(peer.user_id || peer.chat_id || peer.channel_id);
		}

		return {
			title: title,
			isOnline: status && status._ === 'userStatusOnline',
			text: text,
			message_info: this._checkMessageFlags(msg_flags),
			pinned: this._checkFlag(dialog.flags, 2),
			muted: this._checkFlag(dialog.notify_settings.flags, 1),
			draft: dialog.draft && dialog.draft._ !== 'draftMessageEmpty' ? dialog.draft : null,
			archived: dialog.folder_id && dialog.folder_id === 1,
			time: this._convertDate(date),
			unreadCount: unread_count,
			dialog_peer: peer,
			is_supergroup,
			photo,
		};
	};

	getDialogsParsed = async limit => {
		const last = this.last || 0;
		const { result, offset } = await this.getDialogs(last, limit);
		console.log('result', result);
		this.last = offset - 100;
		const { chats, dialogs, messages, users } = result;

		const dialog_items = [];
		const archived_items = [];

		dialogs.forEach(dialog => {
			(parsed_dialog => {
				(parsed_dialog.archived && archived_items.push(parsed_dialog)) || dialog_items.push(parsed_dialog);
			})(this._parseDialog(dialog, chats, messages, users));
		});

		dialog_items.sort((a, b) => a.time - b.time);

		return { dialog_items, archived_items };
	};

	getFullPeer = async peer_id => {
		const peer = await this.getPeerByID(peer_id);
		const mapped_peer = this.mapPeerToInputPeer(peer);

		let saved_peer;
		console.log(mapped_peer);

		switch (mapped_peer._) {
			case 'inputUser':
				if (mapped_peer.user_id === (await this.MtpApiManager.getUserID())) {
					return await this.getFullUserInfo();
				}
				saved_peer = this.AppUsersManager.getFullUser(mapped_peer.user_id);
				if (saved_peer && (!saved_peer.id || !saved_peer.deleted)) {
					return saved_peer;
				}
				return await this.invokeApi('users.getFullUser', {
					id: mapped_peer,
				}).then(fullUser => {
					this.AppUsersManager.saveFullUser(fullUser);
					return fullUser;
				});
			case 'inputChat':
				saved_peer = this.AppChatsManager.getFullChat(mapped_peer.chat_id);
				if (saved_peer && (!saved_peer.id || !saved_peer.deleted)) {
					return saved_peer;
				}
				return await this.invokeApi('messages.getFullChat', {
					chat_id: mapped_peer.chat_id,
				}).then(fullChat => {
					this.AppChatsManager.saveFullChat(fullChat);
					return fullChat;
				});
			case 'inputChannel':
				saved_peer = this.AppChatsManager.getFullChat(mapped_peer.id);
				if (saved_peer && (!saved_peer.id || !saved_peer.deleted)) {
					return saved_peer;
				}
				return await this.invokeApi('channels.getFullChannel', {
					channel: mapped_peer,
				}).then(fullChannel => {
					this.AppChatsManager.saveFullChat(fullChannel);
					return fullChannel;
				});
		}
	};

	getChatParticipants = async chat_id => {
		const chat = await this.getFullPeer(chat_id, 'chat');

		if (chat && chat.full_chat && chat.full_chat._ === 'chatFull') {
			const onlineUsers = [],
				offlineUsers = [];

			chat.users.forEach(user => {
				if (user.status && user._ !== 'userEmpty') {
					user.status._ === 'userStatusOnline' ? onlineUsers.push(user) : offlineUsers.push(user);
				}
			});

			return { onlineUsers, offlineUsers };
		} else if (chat.full_chat._ === 'channelFull') {
			const channel_peer = await this.getPeerByID(chat_id, 'chat');

			if (!this._checkFlag(channel_peer.flags, 8)) {
				return { onlineUsers: [], offlineUsers: [] };
			}

			const channel_users = await this.invokeApi('channels.getParticipants', {
				channel: this.mapPeerToInputPeer(channel_peer),
				filter: {
					_: 'channelParticipantsRecent',
				},
				offset: 0,
				limit: 200,
				hash: Math.round(Math.random() * 100),
			});

			const onlineUsers = [],
				offlineUsers = [];

			channel_users.users.forEach(user => {
				if (user.status && user._ !== 'userEmpty') {
					user.status._ === 'userStatusOnline' ? onlineUsers.push(user) : offlineUsers.push(user);
				}
			});

			return { onlineUsers, offlineUsers };
		}

		return { onlineUsers: [], offlineUsers: [] };
	};

	mapPeerToInputPeer = peer => {
		const type = peer._;

		switch (type) {
			case 'inputPeerUser':
			case 'user':
				return {
					...peer,
					_: 'inputUser',
					user_id: peer.user_id ? peer.user_id.toString() : peer.id.toString(),
				};

			case 'inputPeerChat':
			case 'chat':
				return {
					...peer,
					_: 'inputChat',
					chat_id: peer.chat_id ? peer.chat_id.toString() : peer.id.toString(),
				};

			case 'inputPeerChannel':
			case 'channel':
				return {
					...peer,
					_: 'inputChannel',
					channel_id: peer.channel_id ? peer.channel_id.toString() : peer.id.toString(),
				};

			default:
				return peer;
		}
	};

	mapPeerTypeToType = type => {
		switch (type) {
			case 'inputPeerUser':
			case 'inputUser':
			case 'peerUser':
				return 'user';

			case 'inputPeerChat':
			case 'inputChat':
			case 'peerChat':
				return 'chat';

			case 'inputPeerChannel':
			case 'inputChannel':
			case 'peerChannel':
				return 'channel';

			default:
				return type;
		}
	};

	mapPeerToTruePeer = peer => {
		const type = peer._;

		switch (type) {
			case 'peerUser':
			case 'user':
				return {
					...peer,
					_: 'inputPeerUser',
					user_id: peer.user_id ? peer.user_id.toString() : peer.id,
				};

			case 'peerChat':
			case 'chat':
				return {
					...peer,
					_: 'inputPeerChat',
					chat_id: peer.chat_id ? peer.chat_id.toString() : peer.id,
				};

			case 'peerChannel':
			case 'channel':
				return {
					...peer,
					_: 'inputPeerChannel',
					channel_id: peer.channel_id ? peer.channel_id.toString() : peer.id,
				};

			default:
				return peer;
		}
	};

	searchPeers = async (subsrt, limit) => {
		const res = await this.invokeApi('contacts.search', {
			q: subsrt,
			limit,
		});

		const { results, users, chats } = res;

		const search_items = [];

		await results.forEach(async result => {
			let peer, title, text, photo, status;

			if (result._ === 'peerChat') {
				const chat = chats[chats.findIndex(el => el.id === result.chat_id)];
				title = chat.title;
				text =
					chat.participants_count > 1
						? chat.participants_count + ' members'
						: chat.participants_count + ' member';
				photo = chat.photo && chat.photo._ !== 'chatPhotoEmpty' && chat.photo;
				peer = {
					...result,
					access_hash: chat.access_hash,
				};
			} else if (result._ === 'peerChannel') {
				const channel = chats[chats.findIndex(el => el.id === result.channel_id)];
				Config.Modes.debug && console.log('GOT CHANNEL', channel);
				Config.Modes.debug && console.log('IS SUPERGROUP? ', (channel.flags & (2 ** 8)) === 2 ** 8);
				title = channel.title;
				text =
					channel.participants_count > 1
						? channel.participants_count + ' members'
						: channel.participants_count + ' member';
				photo = channel.photo && channel.photo._ !== 'chatPhotoEmpty' && channel.photo;
				peer = {
					...result,
					access_hash: channel.access_hash,
				};
			} else {
				const user = users[users.findIndex(el => el.id === result.user_id)];
				const last_name = user.last_name ? ' ' + user.last_name : '';
				title = user.first_name + last_name;
				status = user.status;
				text = '@' + user.username;
				photo = user.photo && user.photo._ !== 'userPhotoEmpty' && user.photo;
				peer = user.access_hash
					? {
							...result,
							access_hash: user.access_hash,
					  }
					: result;
			}

			if (photo) {
				photo = this.getPeerPhoto(peer.user_id || peer.chat_id || peer.channel_id);
			}

			search_items.push({
				title,
				peer,
				text,
				status,
				photo,
			});
		});

		return search_items;
	};

	getMessagesFromPeer = async (peer, limit = 200, offsetId = 0) => {
		return await this.invokeApi('messages.getHistory', {
			peer: this.mapPeerToTruePeer(peer),
			limit,
			offset_id: offsetId,
		});
	};

	getPhotoFile = async (photo, size) => {
		const { id, access_hash, file_reference } = photo;
		const photo_size =
			size >= photo.sizes.length ? photo.sizes[photo.sizes.length - 1].type : photo.sizes[size].type;

		return await this.invokeApi(
			'upload.getFile',
			{
				location: {
					_: 'inputPhotoFileLocation',
					id,
					access_hash,
					thumb_size: photo_size,
					file_reference,
				},
				offset: 0,
				limit: 1048576,
			},
			{ fileDownload: true }
		)
			.then(res => {
				// console.log('Got file!');
				return 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(res.bytes)));
			})
			.catch(err => {
				if (err.type === 'FILEREF_UPGRADE_NEEDED') {
					return null;
				}
			});
	};

	getPeerPhoto = async peer_id => {
		const peer = await this.getPeerByID(peer_id);

		const photo = peer.photo.photo_small;
		// console.log('PEER', peer);
		// console.log('PHOTO', photo);
		return this.invokeApi('upload.getFile', {
			location: {
				_: 'inputPeerPhotoFileLocation',
				peer: this.mapPeerToTruePeer(peer),
				volume_id: photo.volume_id,
				local_id: photo.local_id,
			},
			offset: 0,
			limit: 1048576,
		}).then(photo_file => {
			// console.log('Got file!');
			return 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(photo_file.bytes)));
		});
	};
}
