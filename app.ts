/// <reference path="./typings/index" />
import * as PiStation from "./node_modules/pistation-definitions/PiStation";
import {Server, ServerEvent} from './app/server';
import * as Rx from 'rxjs/Rx';
import * as Modules from './modules/autoload';
import * as Connectors from './connectors/autoload';


class PiStationBootloader {
    private serverInstance : Server;
    constructor() {
        this.serverInstance = new Server();
        this.initConnectors();
        this.initModules();
    }

    initConnectors(){
        for (var i in Connectors) {
            if (typeof Connectors[i] == 'function') {
                let connector = new Connectors[i](this.serverInstance);
                this.serverInstance.addConnector(connector);
            }
        }

    }
    initModules(){
        for (var i in Modules) {
            if (typeof Modules[i] == 'function') {
                let module = new Modules[i](this.serverInstance);
                this.serverInstance.addModule(module);
            }
        }
    }


}

const piServer = new PiStationBootloader();