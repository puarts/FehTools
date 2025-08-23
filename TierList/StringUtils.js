export class ScopedStopwatch {
    constructor(logFunc) {
        this._logFunc = logFunc;
        this._startTime = Date.now();
    }

    dispose() {
        const endTime = Date.now();
        var diff = endTime - this._startTime;
        this._logFunc(diff);
    }
}