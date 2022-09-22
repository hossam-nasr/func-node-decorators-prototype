import { app, FunctionHandler, FunctionInput, FunctionOutput, FunctionTrigger, HttpTriggerOptions, output, trigger } from "@azure/functions";

export function http(options?: HttpTriggerOptions) {
    return function(target: FunctionApp, propertyKey: string, descriptor: PropertyDescriptor) {
        let functionName = propertyKey;
        FunctionApp.createFunction(functionName, trigger.http(options));
        if (!FunctionApp.hasReturnValue(functionName)) {
            FunctionApp.setReturnValue(functionName, output.http({}));
        }
    }
}

export function azureFunction() {
    return function(target: FunctionApp, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionName = propertyKey;
        const functionHandler = descriptor.value!
        FunctionApp.registerFunction(functionName, functionHandler);
    }
}

class FunctionApp {
    private static functions: Map<string, FunctionInfo>;

    static createFunction(functionName: string, trigger: FunctionTrigger) {
        FunctionApp.functions[functionName] = {
            trigger
        }
    }

    static registerFunction(functionName: string, functionHandler: FunctionHandler) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        app.generic(functionInfo.trigger.type, functionName, {
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

    static addInput(functionName: string, inputOptions: FunctionInput) {
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
    trigger: FunctionTrigger;

    return?: FunctionOutput;

    extraInputs?: FunctionInput[];

    extraOutputs?: FunctionOutput[];
}