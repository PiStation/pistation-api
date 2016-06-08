/// <reference path="./typings/index" />
import * as PiStation from "./node_modules/pistation-definitions/PiStation.ts";
import {Server, ServerEvent} from './app/server';
import * as Rx from 'rxjs/Rx';
import * as Modules from './modules/autoload';
import * as Connectors from './connectors/autoload';

const app = new Server();

class PiStationServer {
    constructor() {

    }
}

for (var i in Connectors) {
    if (typeof Connectors[i] == 'function') {
        let connector = new Connectors[i](app);
        app.addConnector(connector);
    }
}

for (var i in Modules) {
    if (typeof Modules[i] == 'function') {
        let module = new Modules[i](app);
        app.addModule(module);
    }
}
