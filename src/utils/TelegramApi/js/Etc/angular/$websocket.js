import Abridged from './transports';
import { noop } from '../Helper';

export default class WebSocketManager {
	mtpTransport = new Abridged();
	inited = false;

	constructor(url = '', handler = noop) {
		console.log('Going to create a session with ', url.replace('http', 'wss'));
		this.socket = new WebSocket(url.replace('http', 'wss'), 'binary');
		this.socket.onopen = this.onWebsocketOpen;
		this.socket.onmessage = async data => {
			console.log('#########################Got message from server!');
			console.log(data.data, await data.data.arrayBuffer());
			let deobfuscated = new Uint8Array(await this.mtpTransport.deobfuscate(await data.data.arrayBuffer()));
			console.log(deobfuscated);
			deobfuscated = deobfuscated[0] == 127 ? deobfuscated.slice(4) : deobfuscated.slice(1);
			handler(deobfuscated);
		};
		this.socket.onclose = event => {
			console.log('Socket is close because of ', event);
		};
		this.socket.onerror = event => {
			console.log('Socket error', event);
		};
		this.handler = handler;
	}

	onWebsocketOpen = async data => {
		console.log('Connection created');
		console.log('Connection data', data);

		// this.socket.send(0xef);

		const initMessage = (await this.mtpTransport.generateObfuscatedInitMessage()) || new Uint8Array(64);

		this.socket.send(initMessage);
		// this.socket.send(authMessage);
		console.log('Connection inited');
		this.inited = true;
	};

	async sendData(data) {
		if (!this.inited) {
			setTimeout(() => {
				this.sendData(data);
			}, 500);
			return;
		}
		if (!this.isOpen()) {
			return;
		}
		console.log('Sending data', data);
		const obfuscated = await this.mtpTransport.getEncryptedMessage(data);
		this.socket.send(obfuscated);
		console.log('And done', obfuscated);
	}

	async getTestRequest() {
		if (!this.inited) {
			setTimeout(() => {
				this.getTestRequest();
			}, 500);
			return;
		}
		const test = this.mtpTransport.fromHexString(
			'd74ab1284d4ae17b419c43c01f2c27a71955cbe181c3e876015b2a2bca545bacd2c39820dad535a9de'
		);
		console.log('Crypted test', test);
		const decrypted = await this.mtpTransport.deobfuscate(test);
		console.log('Decrypted test', decrypted);
		const recrypted = await this.mtpTransport.obfuscate(decrypted);
		console.log('Reecrypted test', recrypted);
	}

	async sendAuthMessage() {
		if (!this.inited) {
			setTimeout(() => {
				this.sendAuthMessage();
			}, 500);
			return;
		}
		if (!this.isOpen()) {
			return;
		}
		const auth = this.mtpTransport.fromHexString(
			'd74ab1284d4ae17b419c43c01f2c27a71955cbe181c3e876015b2a2bca545bacd2c39820dad535a9de'
		);

		this.socket.send(auth);
	}

	isOpen() {
		return this.socket.readyState === this.socket.OPEN;
	}
}
