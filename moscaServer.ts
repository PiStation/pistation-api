import * as mosca from 'mosca';
import {$log} from "ts-log-debug";

interface MoscaServerPubSubSettings {
    type: string;
    url: string;
    pubsubCollection: string;
    mongo: any
}
interface MoscaSettings {
    port: number;
    backend: MoscaServerPubSubSettings;
    factory: any;

}
export class MoscaServer {
    private mosca : any;
    settings : MoscaSettings = {
        port :1883,
        backend: {
            //using ascoltatore
            type: 'mongo',
            url: 'mongodb://localhost:27017/mqtt',
            pubsubCollection: 'ascoltatori',
            mongo: {}
        },
        factory:mosca.persistence.Memory
    };

    setup(settings : MoscaSettings) {
        this.settings = settings;
    }
    start() : Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.mosca = new mosca.Server(this.settings, ((err, srv) => {
                if (err) {
                    $log.error('Mosca Server start failed');
                    reject(err);
                }
                resolve(srv);
            }));
        });
    }
    static Initialize(){
        return new MoscaServer()
            .start().then((event) => {
                $log.info('Mosca Server started...');
            });
    }
}