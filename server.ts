
import * as Express from "express";
import {$log} from "ts-log-debug";
import {ServerLoader, IServerLifecycle} from "ts-express-decorators";
import Path = require("path");

export class Server extends ServerLoader implements IServerLifecycle {
    constructor() {
        super();
        let appPath = Path.resolve(__dirname);

        this.setEndpoint('/rest')
            .scan(appPath + "/controllers/**/**.js")
            .createHttpServer(8000)
            .createHttpsServer({
                port: 8080
            });
    }

    $onMountingMiddlewares(): void|Promise<any> {
        const morgan = require('morgan'),
            cookieParser = require('cookie-parser'),
            bodyParser = require('body-parser'),
            compress = require('compression'),
            methodOverride = require('method-override');


        this
            .use(morgan('dev'))
            .use(ServerLoader.AcceptMime("application/json"))

            .use(cookieParser())
            .use(compress({}))
            .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true
            }));

        return null;
    }

    /**
     * Customize this method to manage all errors emitted by the server and controllers.
     * @param error
     * @param request
     * @param response
     * @param next
    $onError(error: any, request: Express.Request, response: Express.Response, next: Express.NextFunction): void {

        if (response.headersSent) {
            return next(error);
        }

        // MONGOOSE ERROR MANAGEMENT
        if (error.name === "CastError" || error.name === "ObjectID" || error.name === "ValidationError") {
            response.status(400).send("Bad Request");
            return next();
        }

        next(error);
    }
     */

    static Initialize(): Promise<any> {

        $log.info('Initialize server');

        return new Server()
            .start()
            .then(() => {
                $log.info('Server started...');
            });
    }

}