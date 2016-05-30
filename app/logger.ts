export enum LogLevel {
    INFO = 1,
    DEBUG = 2,
    ERROR = 3,
}

export class Logger {
    static DEFAULT_ICONS : any = {
      NOT_FOUND_ICON : `😞`,
      SERVER_EVENT : `📬`,
      CLIENT_EVENT: `🎁`,
      WARNING : `❗`,
      ERROR : `❌`,
      CONNECTION : `🎯`,
      DEBUG : `👷`,
      DEFAULT : `📄`
    };

    static subject : string;

    constructor(private subject : string){

    }

    private static getIcon(subject : string | LogLevel)  {
        switch(subject) {
            case Logger.DEFAULT_ICONS[subject] :
                return  Logger.DEFAULT_ICONS[subject];
            case LogLevel.INFO:
                return Logger.DEFAULT_ICONS.WARNING;
            case LogLevel.ERROR:
                return Logger.DEFAULT_ICONS.ERROR;
            case LogLevel.DEBUG:
                return Logger.DEFAULT_ICONS.INFO;
            default:
                return Logger.DEFAULT_ICONS.DEFAULT;
        }
    }

    static setSubject(subject : string) {
        this.subject = subject;
        return this;
    }

    private static execute(executer : () => void, {level, msg, params} : {level : LogLevel, msg: string, params : any[]}) {
        let subject = this.subject || level;
        let formattedMsg = `${Logger.getIcon(subject)} ${this.subject || ''} : ${msg}`
        executer.apply(formattedMsg, params);
    }

    static info(msg : string, ...params : any[]) {
        return Logger.execute(console.info, {level : LogLevel.INFO, msg: msg, params : params});
    }

    static debug(msg: string, ...params : any[]) {
        return Logger.execute(console.debug, {level : LogLevel.INFO, msg: msg, params : params});
    }

    static error(msg: string, ...params : any[]) {
        return Logger.execute(console.debug, {level : LogLevel.INFO, msg: msg, params : params});
    }

}