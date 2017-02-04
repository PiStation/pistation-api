import {Document, model, Schema} from 'mongoose';

export const schema = new Schema({
    name:{
        type:String,
        required:true
    },
    type: {
        type: String,
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    vendor: {
        type: String,
        required: true
    }
});

export interface DeviceInterface {
    _type: string;
    _id: string;
    name: string;
    vendor: string;
    deviceName?: string;
}
export class Device implements DeviceInterface {
    _type = 'device';
    _id = 'UnknownDevice';
    name = 'Unknown Device';
    vendor = 'Company X';
}

//export const Device = model('Device', schema);