import * as io from "socket.io";
import * as PiStation from "../node_modules/pistation-definitions/PiStation.ts";
import * as  Rx from 'rxjs/Rx';
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

    public clientConnections:Rx.Observable<SocketIO.Socket>;

    constructor(private port:number = 31415) {
        this.socketServer = io(port);
        console.log('Server Started');

        this.clientConnections = Rx.Observable.create((observer : any) => {
            this.socketServer.on(`${PiStation.Events.CLIENT_CONNECTED}`, (socket : SocketIO.Socket) => observer.next(socket));

            this.socketServer.on('error', (error : any) => {
                console.log('ERROR', error);
                observer.error(error)
            });
        });

        this.clientConnections
            .forEach((socket : SocketIO.Socket) => {
                console.log(`New client connection | ID: ${socket.client.id} IP address: ${socket.client.conn.remoteAddress}`)
                this.registerEventsForClient(socket)
            });

        this.on(`${PiStation.Events.GET_ALL_MODULES}`).subscribe( (event : ServerEvent) => {
            let data = this.modules.map(module => module.toDto());
            console.log('Returning modules:',  data);
            event.socket.emit(`${PiStation.Events.GET_ALL_MODULES}`, data);
        });

        this.on(`${PiStation.Events.GET_ALL_ACTIONS}`).subscribe((event : ServerEvent) => {
            console.log('Asking all actions');
        });
    }

    addModule(module:Module) {
       return this.modules.push(module);
    }

    addConnector(connector:Connector) {
        return this.connectors.push(connector);
    }

    getConnector(connectorName:string) {

        return this.connectors.find(connectorObject => (connectorObject.name === connectorName));
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

    private registerEventsForClient(socket:SocketIO.Socket){
        this.modules
            .forEach((module : Module) => { module.registerFunctionCallsForClient(socket)});
    }
}