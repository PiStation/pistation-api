import * as PiStation from "../node_modules/pistation-definitions/PiStation.ts";
import * as Rx from 'rxjs/Rx';
import {Function} from '../node_modules/pistation-definitions/PiStation.ts';
import {ServerEvent} from "./server";

export class Module extends PiStation.Module {

    functionClientSubscriptions;

    constructor(name: string, functionArray: Function[] = []) {
        super(name,functionArray);
    }
    private clientDisconnectStream(clientSocket) {
        return Rx.Observable.create(observer =>
            clientSocket.on(`${PiStation.Events.CLIENT_DISCONNECTED}`,(event : ServerEvent) => observer.complete()));
    }
    registerFunctionCallsForClient(clientSocket : any) {
            this.functions.forEach((func:PiStation.Function) => {
                Rx.Observable
                    .fromEvent(clientSocket, `${func.eventName}`)
                    .takeUntil(this.clientDisconnectStream(clientSocket))
                    .subscribe((argsJson) => {
                        console.log('function called', argsJson);
                        let functionUpdateStream : Rx.Observable<string> = this[func.name](argsJson);

                        functionUpdateStream.takeUntil(this.clientDisconnectStream(clientSocket))
                            .subscribe((update : string) => {
                                console.log(`emitting ${func.eventName} function update`, update);
                                clientSocket.emit(`${func.eventName}`, update);
                            });
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