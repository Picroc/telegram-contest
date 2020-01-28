import { forEach, toArray } from "./Helper";

export default class StorageModule {
    methods = {};

    constructor() {
        forEach(['get', 'set', 'remove'], (methodName) => {
            this.methods[methodName] = () => {
                var args = toArray(arguments);
                return new Promise((resolve, reject) => {

                    args.push((result) => {
                        resolve(result);
                    });

                    ConfigStorage[methodName].apply(ConfigStorage, args);
                });
            };
        });
        this.get = this.methods.get;
        this.set = this.methods.set;
        this.remove = this.methods.remove;
    }

}
