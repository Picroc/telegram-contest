export default class MtpDcConfiguratorModule {
    chosenServers = {};

    chooseServer = (dcID, upload) => {
        const dcOptions = Config.Modes.test ? Config.Server.Test : Config.Server.Production;

        if (this.chosenServers[dcID] === undefined) {
            let chosenServer = false,
                i, dcOption;

            for (i = 0; i < dcOptions.length; i++) {
                dcOption = dcOptions[i];
                if (dcOption.id == dcID) {
                    chosenServer = chooseProtocol() + '//' + dcOption.host + (dcOption.port != 80 ? ':' + dcOption.port : '') + '/apiw1';
                    break;
                }
            }
            this.chosenServers[dcID] = chosenServer;
        }

        return this.chosenServers[dcID];
    }

    chooseProtocol = () => {
        if (location.protocol.indexOf('http') != -1) {
            return location.protocol;
        }

        return 'http:';
    }
}
