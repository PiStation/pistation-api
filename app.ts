/// <reference path="./typings/index" />
import * as PiStation from "./node_modules/pistation-definitions/PiStation.ts";
import {Server, ServerEvent} from './app/server';
import * as Rx from 'rxjs/Rx';

const app = new Server();

const module = new PiStation.Module(
    'kakuLights',
    [
        new PiStation.Function('powerControl', [new PiStation.Argument('enabled', 'bool')]),
        new PiStation.Function('dim', [new PiStation.Argument('dimmingLevel', 'bit')])
    ]
);