/// <reference path="./typings/index" />
import * as PiStation from "./node_modules/pistation-definitions/PiStation.ts";
import {Server, ServerEvent} from './app/server';
import * as Rx from 'rxjs/Rx';
import fs = require('fs');

const app = new Server();

const module = new PiStation.Module(
    'kakuLights',
    [
        new PiStation.Function('powerControl', [new PiStation.Argument('enabled', 'bool')]),
        new PiStation.Function('dim', [new PiStation.Argument('dimmingLevel', 'bit')])
    ]
);

//app.addModule(module);
var moduleDir = './modules';
fs.readdir(moduleDir, function( err, files ) {
    if (err) {
        console.error("Could not list the module directory.", err);
        process.exit(1);
    }

    files.forEach( function( file, index ) {
        // Make one pass and make the file complete
        var moduleName = moduleDir + '/' + file;
        fs.stat(moduleName, function( error, stat ) {
            if( error ) {
                console.error( "Error stating file.", error );
                return;
            }

            if( stat.isDirectory() ) {
                fs.readFile(moduleName + '/module.json', 'utf8', function (err, data) {
                    if (err) throw err; // we'll not consider error handling for now
                    var obj = JSON.parse(data);
                    if (obj.pistationVersion != '1') {
                        console.log('"%s" is not a valid PiStation module');
                        return;
                    }
                    console.log('Found module "%s" from "%s"', obj.name, obj.author);
                    //Load it up
                });
            }
        });
    });
});

import {Dummy} from "./modules/module-dummy/dummy.module";
const dummyModule : Dummy = new Dummy();
app.addModule(dummyModule);
