import * as PiStation from 'pistation-definitions/PiStation';
import * as Collections from 'typescript-collections';
import {HttpEvent} from "./server";
export class FontIcon implements IFontIcon {
    type: 'font';
    constructor(public iconName:string, public fontSet : string = 'material-icons'){
        console.log('new fonticon', iconName);
    }
    toString(){
        return Collections.util.makeString(this)
    }
}
export const DEFAULT_ICONS :IAssetsRegistry<FontIcon> = {
    'home' : new FontIcon('home')
};

export interface Icon {
    type: string;
    moduleId?: any;
    color?: string;
    iconName: string;
    toString():string;
}
interface ISVGIcon extends Icon {
    iconPath: string;
}

interface IFontIcon {
    fontSet: string;
}

interface IAssetsRegistry<T> {
    [shortName: string]: T
}

export class SVGIcon implements ISVGIcon {
    type: string = 'svg';
    constructor(public iconName:string, public iconPath:string) {}

    toString(){
        return Collections.util.makeString(this)
    }
}

export class AssetsService {
    private _icons = new Collections.Dictionary<string, Icon>();

    addIcon(shortName : string, iconPathOrFont : string) {
        if(this._icons.containsKey(shortName)){
            throw Error(`IconRegistry: Icon '${shortName}' already exists.`);
        }
        let splitFileExtension = iconPathOrFont => iconPathOrFont.split('.')[iconPathOrFont.split('.').length -1];
        switch(splitFileExtension(iconPathOrFont)){
            case 'svg':
                this._icons.setValue(shortName,  new SVGIcon(shortName,iconPathOrFont));
                console.log('created svg icon');
                break;
            default:
                console.log('created Font icon');
                this._icons.setValue(shortName, new FontIcon(shortName, iconPathOrFont));
                break;
        }
    }

    getIcons(){
        return this._icons.values();
    }

    getIcon(shortName : string) {
        return this._icons.getValue(shortName);
    }

    handleFileRequest(httpEvent : HttpEvent) {

    }
}
