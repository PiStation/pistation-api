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
    _id: string;
    name: string;
    vendor: string;
    deviceName: string;
}

export const Device = model('Device', schema);