import {Service} from 'ts-express-decorators';
import {Value} from 'ts-json-properties';
import {$log} from "ts-log-debug";

@Service()
export default class PluginService {
    public static scanPlugins(pluginPath : string){
        let files: string[] = require("glob").sync(pluginPath);
        let nbFiles = 0;

        $log.info("[PluginService] Loading plugins");

        files.forEach((file: string) => {
            try {
                $log.debug("[PluginService] Loading plugin:", file);
                let plugin = require(file);
                $log.debug("[PluginService] init:", plugin.HueLight._type);

                nbFiles++;
            } catch (err) {
                /* istanbul ignore next */
                $log.warn("[PluginService] error loading plugin: ", err);
            }
        });

        $log.info(`[PluginService] ${nbFiles} plugins(s) found and imported`);
    }
}