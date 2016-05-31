var fs = require('fs');
var autoloadModulesFile = "modules/autoload.ts";
var autoloadConnectorsFile = "connectors/autoload.ts";

fs.closeSync(fs.openSync(autoloadModulesFile, 'w'));
fs.closeSync(fs.openSync(autoloadConnectorsFile, 'w'));

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
                fs.readFile(moduleName + '/package.json', 'utf8', function (err, data) {
                    if (err) throw err; // we'll not consider error handling for now
                    var obj = JSON.parse(data);
                    if (obj.pistation == undefined) {
                        console.log('"%s" is not a valid PiStation module', moduleName);
                        return;
                    }
                    console.log('Found module "%s" from "%s"', obj.name, obj.author);

                    obj.pistation.modules.forEach(function(key) {
                        fs.appendFileSync(autoloadModulesFile, "export * from '"+file+"/"+key.toLowerCase()+".module.ts'\r\n");
                    });
                });
            }
        });
    });
});


/*
 import {Dummy} from "./modules/module-dummy/dummy.module";
 const dummyModule : Dummy = new Dummy();
 app.addModule(dummyModule);
 */