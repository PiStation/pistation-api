/// <reference path="../typings/index" />
import * as io from "socket.io";
import * as PiStation from "../node_modules/pistation-definitions/PiStation";
import * as  Rx from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent'
import * as RxNode from 'rx-node';
import * as _ from 'underscore';
import * as express from "express";
import * as http from "http";
import * as path from 'path';
import * as fs from 'fs';
import {AssetsService, SVGIcon} from './icons';
import * as Collections from 'typescript-collections';
const levelup = require('levelup');
const sublevel = require('level-sublevel');


import Socket = SocketIO.Socket;
import {Module} from "./module";
import {Connector} from "./connector";
import {ReadLine} from "readline";
import Observable = Rx.Observable;
import {Express} from "~express/lib/express";
import {ServeStaticOptions} from "~express~serve-static";
import Subject = Rx.Subject;
import {ReadStream} from "fs";

export interface ServerEvent {
    socket: SocketIO.Socket;
    data: any;
}

export interface HttpEvent {
    request: express.Request;
    response: express.Response;
}

export class Server {
    private socketServer:SocketIO.Server;
    private httpServer : express.Application;
    private modules:PiStation.Module[] = [];
    private connectors:PiStation.Connector[] = [];
    private db : Sublevel;
    public clientConnections:Rx.Observable<SocketIO.Socket>;
    private assetFileRequests = new Rx.Subject<HttpEvent>();
    private router;

    constructor(private port:number = 31415) {
        console.log('Server Started');
        this.db = sublevel(levelup('./data'));
        this.socketServer = io(port);
        this.httpServer = express();
        this.router = express.Router();
        this.httpServer
            .use(this.router)
            .listen(8080);
        this.initAssetRequests();
        this.initClientSocketConnections();
        this.subscribeForGlobalClientEvents();
        this.initRoomReadStream();
        this.clientConnections
            .forEach((socket : SocketIO.Socket) => {
                console.log(`New client connection | ID: ${socket.client.id} IP address: ${socket.client.conn.remoteAddress}`)
                this.registerModuleEventsForClient(socket)
            });
    }

    private initAssetRequests() {
        this.router
            .get('/public/assets/:module/*', ((req, res) =>
                this.assetFileRequests.next(<HttpEvent>{request: req, response: res})));

        const validAssetRequests = this.assetFileRequests
            .filter((httpEvent: HttpEvent) => this.hasValidModuleInParam(httpEvent))
            .map((e) => {
                return {
                    moduleName: <string>e.request.params['module'],
                    iconName: <string>e.request.params[0],
                    event: e
                }
            })
            .filter(iconRequest => !_.isUndefined(this.getSVGIconForModuleByShortName(iconRequest.moduleName, iconRequest.iconName)))
            .map((moduleIconData) => {
                return {
                    icon: this.getSVGIconForModuleByShortName(moduleIconData.moduleName, moduleIconData.iconName),
                    moduleName: moduleIconData.moduleName,
                    event: moduleIconData.event,
                }
            })
            .map(moduleIconRequest => {
                moduleIconRequest.event.response
                    .sendFile(path.join(__dirname, './..', `/modules/${moduleIconRequest.moduleName}/${moduleIconRequest.icon.iconPath}`));
                return moduleIconRequest;
            });

        validAssetRequests.subscribe((moduleIconData) => {
            console.log('request for module', moduleIconData.moduleName)
        });
    }


    private getSVGIconForModuleByShortName(moduleName: string, shortName: string) {
        const module = <Module>this.getModule(moduleName);
        const assetsRegistry = module.getModuleAssetRegistry();
        const icon =  assetsRegistry.getIcon(shortName);
        if((!_.isUndefined(icon)) && icon.type == 'svg') {
            return <SVGIcon>icon;
        } else {
            return undefined;
        }
    }

    private hasValidModuleInParam(httpEvent: HttpEvent) : boolean {
        return !_.isUndefined(this.getModule(<string>httpEvent.request.params['module']));
    }

    private initRoomReadStream() {
        const roomsReadStream = this.createRoomsReadStream();

        roomsReadStream.subscribe((data: any) => {
            // ta da!
            console.log('loaded rooms', JSON.stringify(data, null, 4));

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

        this.on(`${PiStation.Events.GET_MODULE_ASSETS}`).subscribe((event:ServerEvent) => {
           let assets = this.modules
               .map((module: Module) => module.getModuleAssetRegistry())
               .map((register: AssetsService) => register.getIcons());

            console.log('emitting assets', assets);

            event.socket.emit(`${PiStation.Events.GET_MODULE_ASSETS}`, assets);

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

    getModule(moduleName:string) : PiStation.Module {
        return _.first(this.modules.filter(moduleObject => (moduleObject.name == moduleName)));
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


    private static createFileReadStream(fileName: string){
    const readFileAsObservable : (filename: string, encoding: string) => Rx.Observable<any> = Observable.bindNodeCallback(fs.readFile);
    return readFileAsObservable(fileName, 'utf8');
    }
}

export interface StoreReadData {
    key: string;
    value: string;
}