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
    color: {
        type: String,
        required: true
    }
});

export interface DeviceInterface extends Document {
    _id: string;
    name: string;
    type: string
}

export const Device = model<DeviceInterface>('Calendar', schema);