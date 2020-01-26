import MtpNetworkerFactoryModule from "./js/mtp/MtpNetworkerFactory";
import './js/lib/polyfill';

export default class TelegramApi {
    options = { dcID: 2, createNetworker: true }

    MtpNetworkerFactory = new MtpNetworkerFactoryModule();

    constructor() {

    }
}