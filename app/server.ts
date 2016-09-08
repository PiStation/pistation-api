/// <reference path="../typings/index" />
import * as io from "socket.io";
import * as PiStation from "../node_modules/pistation-definitions/PiStation";
import * as  Rx from 'rxjs/Rx';
import * as RxNode from 'rx-node';
const levelup = require('levelup');
const sublevel = require('level-sublevel');

import Socket = SocketIO.Socket;
import {Module} from "./module";
import {Connector} from "./connector";
import {ReadLine} from "readline";
import Observable = Rx.Observable;

export interface ServerEvent {
    socket: SocketIO.Socket;
    data: any;
}

export class Server {
    private socketServer:SocketIO.Server;
    private modules:PiStation.Module[] = [];
    private connectors:PiStation.Connector[] = [];
    private db : Sublevel;

    public clientConnections:Rx.Observable<SocketIO.Socket>;

    constructor(private port:number = 31415) {
        console.log('Server Started');
        this.db = sublevel(levelup('./data'));
        this.socketServer = io(port);

        this.initClientSocketConnections();
        this.subscribeForGlobalClientEvents();

        const roomsReadStream = this.createRoomsReadStream();

        roomsReadStream.subscribe((data : any) => {
            // ta da!
            console.log('loaded rooms', JSON.stringify(data, null, 4));

        });

        this.clientConnections
            .forEach((socket : SocketIO.Socket) => {
                console.log(`New client connection | ID: ${socket.client.id} IP address: ${socket.client.conn.remoteAddress}`)
                this.registerModuleEventsForClient(socket)
            });
    }

    private createRoomsReadStream() {
        const roomsData = this.db.sublevel('rooms');

        roomsData.put('rooms', {rooms: [{name: 'Huiskamer'}, {name: 'Slaapkamer'}]}, (err) => {
            if (err) return console.log('Ooops!', err); // some kind of I/O error
        });

        const roomsReadStream = RxNode.fromStream(roomsData.createReadStream());
        return roomsReadStream;
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



    addModule(module:Module) {
       return this.modules.push(module);
    }

    addConnector(connector:Connector) {
        return this.connectors.push(connector);
    }

    getConnector(connectorName:string) {
        return this.connectors.filter(connectorObject => (connectorObject.name === connectorName))[0];
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
    createModuleStoreReadStream(module : Module) {
        const readStream = this.getModuleStore(module)
            .createReadStream();

        return RxNode.fromReadableStream<StoreReadData>(readStream);
    }

    getModuleStore(module) {
        return this.db.sublevel('modules')
            .sublevel(module.name);
    };
}

export interface StoreReadData {
    key: string;
    value: string;
}