import * as PiStation from "../node_modules/pistation-definitions/PiStation.ts";
import * as Rx from 'rxjs/Rx';
import {Function} from '../node_modules/pistation-definitions/PiStation.ts';

export class Module extends PiStation.Module {
    functions;

    constructor(name: string, functionArray: Function[] = []) {
        super(name,functionArray);
    }

    registerFunctionCallsForClient(clientSocket : any) {
        this.functions.map((func:PiStation.Function) =>
            Rx.Observable
                .fromEvent(clientSocket, `${func.eventName}`)
                .map((json : any) => new Function(func.name, json))
                .forEach((func : Function) => {
                    this[func.name](...func.arguments);
                }));

    }

}