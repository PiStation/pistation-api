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
        this.functionClientSubscriptions = this.functions.map((func:PiStation.Function) =>
            Rx.Observable
                .fromEvent(clientSocket, `${func.eventName}`)
                .map((json : any) => new Function(func.name, json))
                .takeUntil(Rx.Observable.create(observer =>
                    clientSocket.on(`${PiStation.Events.CLIENT_DISCONNECTED}`,(event : ServerEvent) => observer.complete())))
                .forEach((func : Function) => {
                    this[func.name](...func.arguments)
                })
        );
        console.log(this.functionClientSubscriptions);
    }

}