import { HttpTriggerOptions, output as AzFuncOutput, trigger as azFuncTrigger } from "@azure/functions";
import FunctionApp from "./FunctionApp";

export function http(options: HttpTriggerOptions = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        let functionName = propertyKey.toString();
        addHttpTrigger(functionName, options, index);
    };
}

export function httpGet(options: HttpTriggerOptions = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        let functionName = propertyKey.toString();
        options.methods ||= ['GET'];
        addHttpTrigger(functionName, options, index);
    };
}

export function httpPost(options: HttpTriggerOptions = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        let functionName = propertyKey.toString();
        options.methods ||= ['POST'];
        addHttpTrigger(functionName, options, index);
    };
}


function addHttpTrigger (functionName: string, httpOptions: HttpTriggerOptions, index: number): void {
    const triggerOptions = { index, ...azFuncTrigger.http(httpOptions) };
    FunctionApp.addTrigger(functionName, triggerOptions);
    if (!FunctionApp.hasReturnValue(functionName)) {
        FunctionApp.setReturnValue(functionName, AzFuncOutput.http({}));
    }
}