import {DeviceInterface, Device} from "../../models/Device";
const hue = require("node-hue-api");
const hueApi = new hue.HueApi();
import {Observable} from 'rxjs/Rx';
import {Controller, Get} from "ts-express-decorators";

const LIGHT_OFF: number = 0;
interface HueLightStateEvent {
    on : boolean;
    bri : number; //0-255
    color: string; // color input according to tinycolor2->interface?
    alert: string;//select (breath/blink once), lselect (breath 30 sec), none (back to normal)
    effect: any; //colorloop (rainbow mode), none (back to normal)
    transitiontime: number;//number (multiplied with 100 ms) to transition from the current state to the new state.
}
interface IBridge {
    id:string;
    ipaddress:string;
}
interface INupnpBridge extends IBridge {
    name:string;
    mac:string;
}
interface IHueConnection {
    username:string;
    ipaddress:string;
}
@Controller('/hue')
export class HueLight extends Device {
    static _id : 'hue';
    static name: 'dummyLight';
    static  deviceName: 'Dummy Light';

    increment;

    constructor(){
        super();
        console.log('plugin class type', this._type);
    }

    static currentTemperature : number = 21;
    @Get('/temp')
    static getTemperature() {
        return HueLight.currentTemperature;
    }
    $onDeviceConfig() {
        let foundBridgesStream = this.searchBridges();
        foundBridgesStream.subscribe((event : IBridge[]) => {
            console.log('bridge found', event);
            if(event.length > 0) {
                let $username = this.registerBridge(event[0]);

                $username.subscribe((event) => {
                    console.log('connect', event);
                }, (error) => {console.log('error', error)}, () => {
                    console.log('complete')
                })
            }
        });
        return foundBridgesStream.toPromise();

    }


    private registerBridge(bridge) {

        console.log('registering bridge', bridge);
        const maxLinkButtonPressTime = 30000;

        let maxLinkButtonPressTimer = Observable.timer(maxLinkButtonPressTime);

        let bridgeRegisterTryouts = Observable.interval(1000)
            .takeUntil(maxLinkButtonPressTimer);

        let bridgeRegisteredEvent = bridgeRegisterTryouts
            .flatMap(() => Observable.fromPromise(hueApi.registerUser(bridge.ipaddress, 'asdfbsadfladksjf')).share())
            .retry()
            .first();


        return Observable.from([{'value': 'Press link button'}])
            .merge(
                maxLinkButtonPressTimer
                    .takeUntil(bridgeRegisteredEvent)
                    .map(time => {
                        return {value: `to late... try again :)`}
                    }))
            .merge(
                bridgeRegisterTryouts
                    .timeInterval()
                    .takeUntil(bridgeRegisteredEvent)
                    .map(time => {
                        return {value: `${((maxLinkButtonPressTime / 1000) - (time.value + 1))} sec to press the link button`}
                    }))
            .merge(
                bridgeRegisteredEvent
                    .map((username) => {
                        return {value: `${username} successful connected`};
                    }));
    }


    searchBridges() {
        let slowBridgeSearch = Observable.fromPromise(hue.upnpSearch());
        let fastBridgeSearch = Observable.fromPromise(hue.nupnpSearch())
            .filter((bridge:IBridge[]) => bridge.length >= 1);

        return fastBridgeSearch
            .merge(slowBridgeSearch)
            .first();
    }

    static lightsOff() {
        // randomize tempera ture to a value between 0 and 100
        HueLight.currentTemperature = Math.round(Math.random() * 100);
    }
}