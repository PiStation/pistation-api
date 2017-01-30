import {Server} from "./server";
import {MoscaServer} from "./moscaServer";

const restApi = Server.Initialize();
const mqttServer = MoscaServer.Initialize();