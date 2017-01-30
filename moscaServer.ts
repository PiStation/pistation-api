import * as mosca from 'mosca';
import {$log} from "ts-log-debug";
const fork = require('child_process').fork;

interface MoscaServerPubSubSettings {
    type: string;
    url: string;
    pubsubCollection: string;
    mongo: any
}
interface MoscaSettings {
    port: number;
    backend?: MoscaServerPubSubSettings;
    factory?: any;

}
export class MoscaServer {
    private mosca : any;

    //        backend: {
    //using ascoltatore
//     type: 'mongo',
//     url: 'mongodb://localhost:27017/mqtt',
//     pubsubCollection: 'ascoltatori',
//     mongo: {}
// },

        settings : MoscaSettings = {
        port :1883,
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
                    return reject(err);
                }
                resolve(srv);
            }));
        });
    }
    static Initialize(){
        return new MoscaServer()
            .start()
            .then((server) => {
                $log.info('Mosca Server started...');
                server.on('clientConnected', (client) => {
                    $log.info('client connected', client.id);
                });

                // fired when a message is received
                server.on('published', (packet, client) => {
                    $log.info('Published : ', packet.payload);
                });

                // fired when a client subscribes to a topic
                server.on('subscribed', (topic, client) => {
                    $log.info('subscribed : ', topic);
                });

                // fired when a client subscribes to a topic
                server.on('unsubscribed', (topic, client) => {
                    $log.info('unsubscribed : ', topic);
                });

                // fired when a client is disconnecting
                server.on('clientDisconnecting', (client) => {
                    $log.info('clientDisconnecting : ', client.id);
                });

// fired when a client is disconnected
                server.on('clientDisconnected', (client) => {
                    $log.info('clientDisconnected : ', client.id);
                });
            })
    }
}