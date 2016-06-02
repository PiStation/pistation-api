var fs = require('fs');
var autoloadModulesFile = "modules/autoload.ts";
var autoloadConnectorsFile = "connectors/autoload.ts";

fs.closeSync(fs.openSync(autoloadModulesFile, 'w'));
fs.closeSync(fs.openSync(autoloadConnectorsFile, 'w'));

fs.appendFileSync(autoloadModulesFile, "export const MOD_AUTOLOAD=1;\r\n");
fs.appendFileSync(autoloadConnectorsFile, "export const CON_AUTOLOAD=1;\r\n");

console.log('Generating module & connector autoload files for PiStation...');
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

                    fs.readdir(moduleName, function( err, moduleFiles ) {
                        if (err) {
                            console.error("Could not open module directory " + moduleName, err);
                            process.exit(1);
                        }

                        moduleFiles.forEach( function( moduleFile, index ) {
                            // Make one pass and make the file complete
                            var moduleName = moduleDir + '/' + file + '/' + moduleFile;
                            fs.stat(moduleName, function( error, stat ) {
                                if( error ) {
                                    console.error( "Error stating file.", error );
                                    return;
                                }

                                if (stat.isFile() && moduleFile.endsWith('.module.ts')) { // and filename ends with .module.ts
                                    console.log('Autoload generated for ' + moduleFile);
                                    fs.appendFileSync(autoloadModulesFile, "export * from './"+file+"/"+moduleFile+"'\r\n");
                                }
                            });
                        });
                    });

                });
            }
        });
    });
});

var connectorDir = './connectors';
fs.readdir(connectorDir, function( err, files ) {
    if (err) {
        console.error("Could not list the connector directory.", err);
        process.exit(1);
    }

    files.forEach( function( file, index ) {
        // Make one pass and make the file complete
        var connectorName = connectorDir + '/' + file;
        fs.stat(connectorName, function( error, stat ) {
            if( error ) {
                console.error( "Error stating file.", error );
                return;
            }

            if( stat.isDirectory() ) {
                fs.readFile(connectorName + '/package.json', 'utf8', function (err, data) {
                    if (err) throw err; // we'll not consider error handling for now
                    var obj = JSON.parse(data);
                    if (obj.pistation == undefined) {
                        console.log('"%s" is not a valid PiStation connector', connectorName);
                        return;
                    }
                    console.log('Found connector "%s" from "%s"', obj.name, obj.author);

                    fs.readdir(connectorName, function( err, connectorFiles ) {
                        if (err) {
                            console.error("Could not open connector directory " + connectorName, err);
                            process.exit(1);
                        }

                        connectorFiles.forEach( function( connectorFile, index ) {
                            // Make one pass and make the file complete
                            var connectorName = connectorDir + '/' + file + '/' + connectorFile;
                            fs.stat(connectorName, function( error, stat ) {
                                if( error ) {
                                    console.error( "Error stating file.", error );
                                    return;
                                }

                                if (stat.isFile() && connectorFile.endsWith('.connector.ts')) { // and filename ends with .connector.ts
                                    console.log('Autoload generated for ' + connectorFile);
                                    fs.appendFileSync(autoloadConnectorsFile, "export * from './"+file+"/"+connectorFile+"'\r\n");
                                }
                            });
                        });
                    });

                });
            }
        });
    });
});

