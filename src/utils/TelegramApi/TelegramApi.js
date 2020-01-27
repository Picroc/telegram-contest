import MtpNetworkerFactoryModule from "./js/mtp/MtpNetworkerFactory";
import './js/lib/polyfill';
import MtpApiManagerModule from "./js/Mtp/MtpApiManager";
import AppPeersManagerModule from "./js/App/AppPeersManager";
import MtpApiFileManagerModule from "./js/Mtp/MtpApiFileManager";
import AppUsersManagerModule from "./js/App/AppUsersManager";
import AppProfileManagerModule from "./js/App/AppProfileManager";
import MtpPasswordManagerModule from "./js/Mtp/MtpPasswordManager";
import FileSaverModule from "./js/Etc/FileSaver";

export default class TelegramApi {
    options = { dcID: 2, createNetworker: true }

    MtpApiManager = new MtpApiManagerModule();
    AppPeersManager = new AppPeersManagerModule();
    MtpApiFileManager = new MtpApiFileManagerModule();
    AppUsersManager = new AppUsersManagerModule();
    AppProfileManager = new AppProfileManagerModule();
    AppChatsManager = new AppsChatsManagerModule();
    MtpPasswordManager = new MtpPasswordManagerModule();
    FileSaver = new FileSaverModule();
    MtpNetworkerFactory = new MtpNetworkerFactoryModule();

    constructor() {
        this.MtpNetworkerFactory.setUpdatesProcessor((message) => {
            switch (message._) {
                case 'updates':
                    this.AppChatsManager.saveApiChats(message.chats);
                    this.AppUsersManager.saveApiUsers(message.users);
                    break;
            }
        });
    }

    invokeApi = (method, params) => this.MtpApiManager.invokeApi(method, params);
}