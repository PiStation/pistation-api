import * as io from "socket.io";
import * as PiStation from "../../client/PiStation";
import * as  Rx from 'rxjs/Rx';
import Socket = SocketIO.Socket;

export interface PiStationServerEvent {
    socket: SocketIO.Socket;
    data: any;
}

export class PiStationServer {
    private socketServer:SocketIO.Server;
    private modules:PiStation.Module[] = [];
    private listeners:string[];

    public clientConnections:Rx.Observable<SocketIO.Socket>;

    constructor(private port:number = 31415) {
        this.socketServer = io(port);
        console.log('Server Started');

        this.clientConnections = Rx.Observable.create((observer : any) => {
            this.socketServer.on(`${PiStation.Events.CLIENT_CONNECTED}`,(socket : SocketIO.Socket) => observer.next(socket))

            this.socketServer.on('error', (error : any) => {
                console.log('ERROR', error);
                observer.error(error)
            });
        });



        this.clientConnections
            .forEach((socket : SocketIO.Socket) => console.log(`New client connection | ID: ${socket.client.id} IP address: ${socket.client.conn.remoteAddress}`));
        this.clientConnections
            .forEach((socket : SocketIO.Socket) => this.registerEventsForClient(socket));

        this.on(`${PiStation.Events.GET_ALL_MODULES}`).subscribe( (event : PiStationServerEvent) => {
            let json = this.modules.map(module => module.toDto());
            console.log('Returning modules:',  json);
            event.socket.emit(`${PiStation.Events.GET_ALL_MODULES}`, json);
        });

    }

    addModule(module:PiStation.Module) {
       return this.modules.push(module);
    }

    on(event:string):Rx.Observable<PiStationServerEvent> {
        return this.clientConnections
            .flatMap((socket : SocketIO.Socket) =>
                Rx.Observable.fromEvent(socket, event)
                    .map((data: any) => <PiStationServerEvent>{data: data, socket: socket}));
    }

    private registerEventsForClient(socket:SocketIO.Socket){
        this.modules
            .forEach((module : PiStation.Module) => { module.registerFunctionCallsForClient(socket)});
    }
}