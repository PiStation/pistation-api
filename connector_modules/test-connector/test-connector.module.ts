import {Server} from "../../app/server.ts";
import * as PiStation from "../../node_modules/pistation-definitions/PiStation.ts";
import {Observable} from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';

export class TestModule extends PiStation.Module implements PiStation.AbstractModule {
    static moduleId:string;
    static DIM_LIGHT_EVENT = new PiStation.ModuleEvent(TestModule.moduleId,'dimLight');

    constructor(){
        super('TestModule');

        let dummyFunction = new PiStation.Function('powerControl', [new PiStation.Argument('enabled', 'bool')]);

        this.addFunction(dummyFunction); //register on module
        dummyFunction.callStream.subscribe((data : any) => console.log('command received', data));
    }

    //asyncDummyFunction(args : PiStation.Argument[]){
    //    console.log(`Called Dummy Function with arguments ${args}`);
    //
    //    const dummyFunctionUpdates = Observable //dummy update stream from connector
    //        .of([1,2,3]) //500 ms interval events
    //        .take(3); //pak er 3
    //
    //    dummyFunctionUpdates.subscribe((update) => {
    //        console.log(`Dummy send update ${update}`); //output log for testing module
    //    });
    //
    //    //return dummyFunctionUpdates;
    //}
}