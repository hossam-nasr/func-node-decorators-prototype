import FunctionApp from "./FunctionApp";

export function blobTrigger(path: string, connection: string) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const triggerOptions = {
            type: "blobTrigger",
            name: functionName + index,
            index,
            path,
            connection
        };
        FunctionApp.addTrigger(functionName, triggerOptions);
    }
}

export function blobOutput(path: string, connection: string) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const outputOptions = {
            type: 'blob',
            name: functionName + index,
            index,
            path,
            connection
        };
        FunctionApp.addOutput(functionName, outputOptions);
    };
}

export function blobInput(path: string, connection: string) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const input = {
            type: 'blob',
            name: functionName + index,
            index,
            path,
            connection
        };
        FunctionApp.addInput(functionName, input);
    };
}

export function queueTrigger(queueName: string, connection: string) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const trigger = {
            type: 'queueTrigger',
            name: functionName + index,
            index,
            queueName,
            connection,
        }
        FunctionApp.addTrigger(functionName, trigger);
    }
}

export function queueOutput(queueName: string, connection: string) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const outputOptions = {
            type: 'queue',
            name: functionName + index,
            index,
            queueName,
            connection
        };
        FunctionApp.addOutput(functionName, outputOptions);
    }
}