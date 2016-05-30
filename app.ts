/// <reference path="./typings/main" />
import * as PiStation from '../client/PiStation.ts';
import {PiStationServer, PiStationServerEvent} from './app/server';
import {TestModule} from "./connector_modules/test-connector/test-connector.module";

const app = new PiStationServer();

const module =   new PiStation.Module(
    'kakuLights',
    [
        new PiStation.Function('powerControl', [new PiStation.Argument('enabled', 'bool')]),
        new PiStation.Function('dim', [new PiStation.Argument('dimmingLevel', 'bit')])
    ]
);

//app.addModule(module);
const testModule : TestModule = new TestModule();
app.addModule(testModule);
app.on(`${PiStation.Events.CLIENT_DISCONNECTED}`).subscribe(function (event : PiStationServerEvent) {
    console.log("disconnecting");
});