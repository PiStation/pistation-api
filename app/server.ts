import * as io from "socket.io";
import * as PiStation from "../node_modules/pistation-definitions/PiStation.ts";
import * as  Rx from 'rxjs/Rx';
var levelup = require('levelup');
import Socket = SocketIO.Socket;
import {Module} from "./module";
import {Connector} from "./connector";

export interface ServerEvent {
    socket: SocketIO.Socket;
    data: any;
}

export class Server {
    private socketServer:SocketIO.Server;
    private modules:PiStation.Module[] = [];
    private connectors:PiStation.Connector[] = [];
    private db : LevelUp;

    public clientConnections:Rx.Observable<SocketIO.Socket>;

    constructor(private port:number = 31415) {
        console.log('Server Started');
        this.db = levelup('./pistationData');

        // 2) put a key & value
        this.db.put('name', 'LevelUP', (err) => {
            if (err) return console.log('Ooops!', err) // some kind of I/O error

            // 3) fetch by key
            this.db.get('name', function (err, value) {
                if (err) return console.log('Ooops!', err) // likely the key was not found

                // ta da!
                console.log('name=' + value)
            })
        })

        this.socketServer = io(port);
        this.initClientSocketConnections();
        this.subscribeForGlobalClientEvents();

        this.clientConnections
            .forEach((socket : SocketIO.Socket) => {
                console.log(`New client connection | ID: ${socket.client.id} IP address: ${socket.client.conn.remoteAddress}`)
                this.registerModuleEventsForClient(socket)
            });
    }

    private subscribeForGlobalClientEvents() {
        this.on(`${PiStation.Events.GET_ALL_MODULES}`).subscribe((event:ServerEvent) => {
            let data = this.modules.map(module => module.toDto());
            console.log('Returning modules:', data);
            event.socket.emit(`${PiStation.Events.GET_ALL_MODULES}`, data);
        });

        this.on(`${PiStation.Events.GET_ALL_ACTIONS}`).subscribe((event:ServerEvent) => {
            console.log('Asking all actions');
        });
    };

    private initClientSocketConnections() {
        this.clientConnections = Rx.Observable.create((observer:any) => {
            this.socketServer.on(`${PiStation.Events.CLIENT_CONNECTED}`, (socket:SocketIO.Socket) => observer.next(socket));

            this.socketServer.on('error', (error:any) => {
                console.log('ERROR', error);
                observer.error(error)
            });
        });
    };

    addModule(module:Module) {
       return this.modules.push(module);
    }

    addConnector(connector:Connector) {
        return this.connectors.push(connector);
    }

    getConnector(connectorName:string) {

        return this.connectors.filter(connectorObject => (connectorObject.name === connectorName));
    }

    getModule(moduleName:string) {
        return this.modules.find(moduleObject => (moduleObject.name === moduleName));
    }

    on(event:string):Rx.Observable<ServerEvent> {
        return this.clientConnections
            .flatMap((socket : SocketIO.Socket) =>
                Rx.Observable.fromEvent(socket, event)
                    .map((data: any) => <ServerEvent>{data: data, socket: socket}));
    }

    private registerModuleEventsForClient(socket:SocketIO.Socket){
        this.modules
            .forEach((module : Module) => { module.registerFunctionCallsForClient(socket)});
    }
}