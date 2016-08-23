import * as PiStation from "../node_modules/pistation-definitions/PiStation";
import * as Rx from 'rxjs/Rx';
import {Function} from '../node_modules/pistation-definitions/PiStation';
import {ServerEvent} from "./server";
import {Server} from "./server";
interface ModuleConfigStore extends Sublevel {

}
export class Module extends PiStation.Module {

    functionClientSubscriptions;

    constructor(public name:string, functionArray:Function[] = []) {
        super(name, functionArray);
    }

    private clientDisconnectStream(clientSocket) {
        return Rx.Observable.create(observer =>
            clientSocket.on(`${PiStation.Events.CLIENT_DISCONNECTED}`, (event:ServerEvent) => observer.complete()));
    }

    registerFunctionCallsForClient(clientSocket:any) {
        this.functions.forEach((func:PiStation.Function) => {
            Rx.Observable
                .fromEvent(clientSocket, `${func.eventName}`)
                //.takeUntil(this.clientDisconnectStream(clientSocket))
                .subscribe((argsJson) => {
                    console.log('function called', argsJson);
                    let functionUpdateStream:Rx.Observable<string> = this[func.name](argsJson);
                    if (!!functionUpdateStream) {
                        functionUpdateStream
                            //.takeUntil(this.clientDisconnectStream(clientSocket))
                            .subscribe((update:string) => {
                                    console.log(`emitting ${func.eventName} function update`, update);
                                    clientSocket.emit(`${func.eventName}`, update);
                                },
                                (error:any) => clientSocket.emit(`${func.errorEventName}`, error),
                                () => {
                                    console.log('completed function');
                                    clientSocket.emit(`${func.completedEventName}`)
                                });

                    }

                })

        });
        //.takeUntil(Rx.Observable.create(observer =>
        //    clientSocket.on(`${PiStation.Events.CLIENT_DISCONNECTED}`,(event : ServerEvent) => observer.complete())))
        //this.functionClientSubscriptions.forEach((func: Rx.Observable<Rx.Observable<string>>) => {
        //    //func.forEach((functionUpdates: Rx.Observable<string>) => {
        //    //    functionUpdates
        //    //        .takeUntil()
        //    //        .subscribe()
        //    //    console.log('function being called: ', func);
        //    //});
        //});
    }

}