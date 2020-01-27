import { nextRandomInt } from "../lib/bin_utils";
import IdleManagerModule from "../Etc/IdleManager";
import StorageModule from "../Etc/Storage";
import { dT, tsNow } from "../lib/utils";
import $rootScope from '../Etc/angular/$rootScope';
import { MtpNetworkerFactoryModule } from "./MtpNetworkerFactory";
import $timeout from "../Etc/angular/$timeout";

export default class MtpSingleInstanceServiceModule {

    instanceID = nextRandomInt(0xFFFFFFFF);
    started = false;
    masterInstance = false;
    deactivatePromise = false;
    deactivated = false;

    IdleManager = new IdleManagerModule();
    Storage = new StorageModule();
    MtpNetworkerFactory = new MtpNetworkerFactoryModule();

    start = () => {
        if (!this.started && !Config.Navigator.mobile) {
            this.started = true;

            this.IdleManager.start();

            // $interval(checkInstance, 5000);
            setInterval(this.checkInstance, 5000);
            this.checkInstance();

            try {
                // $(window).on('beforeunload', clearInstance);
                window.addEventListener('beforeunload', this.clearInstance);
            } catch (e) {
                console.log("Error starting instance: ", e);
            }
        }
    }

    clearInstance = () => {
        this.Storage.remove(this.masterInstance ? 'xt_instance' : 'xt_idle_instance');
    }

    deactivateInstance = () => {
        if (this.masterInstance || this.deactivated) {
            return false;
        }
        console.log(dT(), 'deactivate');
        this.deactivatePromise = false;
        this.deactivated = true;
        this.clearInstance();

        $rootScope.idle.deactivated = true;
    }

    checkInstance = () => {
        if (this.deactivated) {
            return false;
        }

        const time = tsNow();
        const idle = $rootScope.idle && $rootScope.idle.isIDLE;
        const newInstance = { id: this.instanceID, idle: idle, time: time };

        this.Storage.get('xt_instance', 'xt_idle_instance').then((result) => {
            const curInstance = result[0],
                idleInstance = result[1];

            // console.log(dT(), 'check instance', newInstance, curInstance, idleInstance);
            if (!idle || !curInstance ||
                curInstance.id == this.instanceID ||
                curInstance.time < time - 60000) {

                if (idleInstance &&
                    idleInstance.id == this.instanceID) {
                    this.Storage.remove('xt_idle_instance');
                }
                this.Storage.set({ xt_instance: newInstance });
                if (!this.masterInstance) {
                    this.MtpNetworkerFactory.startAll();
                    console.warn(dT(), 'now master instance', newInstance);
                }
                this.masterInstance = true;
                if (this.deactivatePromise) {
                    $timeout.cancel(this.deactivatePromise);
                    this.deactivatePromise = false;
                }
            } else {
                this.Storage.set({ xt_idle_instance: newInstance });
                if (this.masterInstance) {
                    this.MtpNetworkerFactory.stopAll();
                    console.warn(dT(), 'now idle instance', newInstance);
                    if (!this.deactivatePromise) {
                        this.deactivatePromise = $timeout(this.deactivateInstance, 30000);
                    }
                }
                this.masterInstance = false;
            }
        });
    }

}
