import { Agent, request } from 'https';
import { isObject, mergeObjects } from '@loufa/loufairy';
import TransportStream, { TransportStreamOptions } from 'winston-transport';

const bufferSize = 10;
const bufferFlushInterval = 2000;
const splunkEndpointPath = '/services/collector/event';

interface SplunkTransportOptions extends TransportStreamOptions {
    host: string;
    port: number;
    token: string;
}

export class SplunkTransport extends TransportStream {
    private readonly _agent: Agent;
    private readonly _auth: string;
    private _buffer: any[];
    private _options: SplunkTransportOptions

    /**
     * Create a SplunkTransport with options
     * @param options A TransportStreamOptions objects with the addition of {
     *     host: string;
     *     port: number;
     *     token: string
     * }
     */
    constructor(options: SplunkTransportOptions) {
        super(options);
        this._options = options;

        this._agent = new Agent({ keepAlive: true });
        this._auth = `Splunk ${options.token}`;
        this._buffer = [];

        this._startFlushIntervalLoop();
    }

    /**
     * Called when winston has something to log
     * @param info Information about the event
     * @param callback A callback that must be called when the logging operation is finished on our side
     */
    public log(info, callback): void {
        const splunkEvent = {
            event: mergeObjects(true, {
                message: info.message,
                _time: info.timestamp
            }, Object.fromEntries(Object.entries(info).filter(([prop]) => !['splat'].includes(prop)))
            )
        };

        this._buffer.push(this._normalizeSplunkObject(splunkEvent));
        if (this._buffer.length > bufferSize) {
            this._flush();
        }

        if (callback) {
            setImmediate(callback);
        }
    }

    /* PRIVATE */
    /**
     * Flush the buffer and sends it to Splunk through HTTPS
     * @private
     */
    private _flush(): void {
        try {
            const splunkRequest = request({
                method: 'POST',
                host: this._options.host,
                port: this._options.port,
                path: splunkEndpointPath,
                headers: {
                    Authorization: this._auth
                },
                agent: this._agent
            });

            splunkRequest.end(Buffer.from(JSON.stringify(this._buffer), 'utf8'));
            this._buffer = [];
        } catch (error) {
            console.log('Couln\'t post to Splunk');
            //TODO:  Implement some sort of warning
        }
    }

    /**
     * Normalize a single value from an object to send to splunk. Current implementation only looks at Error type
     * and ensure all properties are logged.
     * @param value The value to normalize
     * @return The normalized value
     * @private
     */
    private _normalizeSplunkValue(value: any): any {
        if (value instanceof Error) {
            return Object.fromEntries([
                ['stack', value.stack],
                ['message', value.message],
                ...Object.entries(value)
            ]);
        } else if (isObject(value)) {
            return this._normalizeSplunkObject(value);
        }

        return value;
    }

    /**
     * Recursively normalize an object before sending to splunk
     * @param splunkObject
     * @return The normalized object
     * @private
     */
    private _normalizeSplunkObject(splunkObject: any): any {
        return Object.fromEntries(Object.entries(splunkObject)
            .map(([prop, value]) => [
                prop,
                this._normalizeSplunkValue(value)
            ])
        );
    }

    /**
     * Every *bufferFlushInterval* milliseconds, call _flush
     * @private
     */
    private _startFlushIntervalLoop(): void {
        setInterval(() => this._flush(), bufferFlushInterval);
    }
}
