import * as PiStation from "../node_modules/pistation-definitions/PiStation.ts";
import * as Rx from 'rxjs/Rx';
import {Function} from '../node_modules/pistation-definitions/PiStation.ts';
import {ServerEvent} from "./server";

export class Module extends PiStation.Module {

    functionClientSubscriptions;

    constructor(name: string, functionArray: Function[] = []) {
        super(name,functionArray);
    }

    registerFunctionCallsForClient(clientSocket : any) {
            this.functions.forEach((func:PiStation.Function) => {
                Rx.Observable
                    .fromEvent(clientSocket, `${func.eventName}`)
                    .takeUntil(Rx.Observable.create(observer =>
                        clientSocket.on(`${PiStation.Events.CLIENT_DISCONNECTED}`,(event : ServerEvent) => observer.complete())))

                    //.map((args : any) => {
                    //    args.forEach(JsonArgument => func.arguments.find(functionArgument => functionArgument.key == JsonArgument))
                    //})
                    //.map((func : Function) => {
                    //    let functionUpdateStream = this[func.name](...func.arguments);
                    //    return functionUpdateStream;
                    //})
                    .subscribe((event) => {
                        let functionUpdateStream = this[func.name](...func.arguments);
                        console.log('function called', event);
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