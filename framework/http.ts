import { HttpTriggerOptions, output as AzFuncOutput, trigger as azFuncTrigger } from "@azure/functions";
import FunctionApp from "./FunctionApp";

export function http(options: HttpTriggerOptions = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        let functionName = propertyKey.toString();
        const httpOptions = { index, ...azFuncTrigger.http(options) };
        FunctionApp.addTrigger(functionName, httpOptions);
        if (!FunctionApp.hasReturnValue(functionName)) {
            FunctionApp.setReturnValue(functionName, AzFuncOutput.http({}));
        }
    };
}
