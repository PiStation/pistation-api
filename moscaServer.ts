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
            .start().then((server) => {
                $log.info('Mosca Server started...');
                server.on('clientConnected', function(client) {
                    console.log('client connected', client.id);
                });

// fired when a message is received
                server.on('published', function(packet, client) {
                    console.log('Published : ', packet.payload);
                });

// fired when a client subscribes to a topic
                server.on('subscribed', function(topic, client) {
                    console.log('subscribed : ', topic);
                });

// fired when a client subscribes to a topic
                server.on('unsubscribed', function(topic, client) {
                    console.log('unsubscribed : ', topic);
                });

// fired when a client is disconnecting
                server.on('clientDisconnecting', function(client) {
                    console.log('clientDisconnecting : ', client.id);
                });

// fired when a client is disconnected
                server.on('clientDisconnected', function(client) {
                    console.log('clientDisconnected : ', client.id);
                });
            })
    }
}