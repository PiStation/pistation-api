import {Service} from "ts-express-decorators";
import {Device} from "../models/Device";

@Service()
export class DeviceService {
    devices : Map<string, Device> = new Map<string, Device>();

    constructor(){
        this.devices.set('TestDevice', new Device())
    }

    addDevice(device : Device) {
        this.devices.set(device._id, device);
    }

    getAll(): Device[]{
        return [...this.devices.values()];
    }
}