import { app, FunctionHandler, FunctionInput, FunctionOutput, FunctionTrigger, HttpTriggerOptions, output, trigger as azFuncTrigger } from "@azure/functions";

export function http(options: HttpTriggerOptions = {}) {
    return function(target: any, propertyKey: string | symbol, index: number) {
        let functionName = propertyKey.toString();
        const httpOptions = { index, ...azFuncTrigger.http(options) };
        FunctionApp.createFunction(functionName, httpOptions);
        if (!FunctionApp.hasReturnValue(functionName)) {
            FunctionApp.setReturnValue(functionName, output.http({}));
        }
    }
}

export function azureFunction() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionName = propertyKey;
        const functionHandler = descriptor.value!
        FunctionApp.registerFunction(functionName, functionHandler);
    }
}

export function returns(options: FunctionOutput) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionName = propertyKey;
        FunctionApp.setReturnValue(functionName, options);
    }
}

export function outputs(options: FunctionOutput) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionName = propertyKey;
        FunctionApp.addOutput(functionName, options);
    }

}

export function trigger(type: string, options: Record<string, unknown> = {}) {
    return function(target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const trigger = {
            type,
            name: functionName + index,
            index,
            ...options
        }
        FunctionApp.createFunction(functionName, trigger);
    }
}

export function input(type: string, options:Record<string, unknown> = {}) {
    return function(target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const input = {
            type,
            name: functionName + index,
            index,
            ...options
        }
        FunctionApp.addInput(functionName, input);
    }
}

class FunctionApp {
    private static functions: Map<string, FunctionInfo> = new Map<string, FunctionInfo>();

    static createFunction(functionName: string, trigger: Trigger) {
        FunctionApp.functions[functionName] = {
            trigger
        }
    }

    static registerFunction(functionName: string, functionHandler: FunctionHandler) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        app.generic(functionName, {
            handler: functionHandler,
            ...functionInfo
        })
    }

    static setReturnValue(functionName: string, returnOptions: FunctionOutput) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        functionInfo.return = returnOptions;
    }

    static hasReturnValue(functionName: string) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        return typeof functionInfo.return !== 'undefined'
    }

    static addInput(functionName: string, inputOptions: Input) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        if (functionInfo.extraInputs) {
            functionInfo.extraInputs.push(inputOptions)
            return;
        } 
        functionInfo.extraInputs = [inputOptions];
    }

    static addOutput(functionName: string, outputOptions: FunctionOutput) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        if (functionInfo.extraOutputs) {
            functionInfo.extraOutputs.push(outputOptions)
            return;
        } 
        functionInfo.extraOutputs = [outputOptions];
    }
}

export interface FunctionInfo {
    trigger: Trigger;

    return?: FunctionOutput;

    extraInputs?: Input[];

    extraOutputs?: FunctionOutput[];
}

export interface Input extends FunctionInput {
    index: number;
}

export interface Trigger extends FunctionTrigger {
    index: number;
}