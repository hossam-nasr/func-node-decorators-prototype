import {
    FunctionOutput, trigger as azFuncTrigger
} from '@azure/functions';
import FunctionApp from './FunctionApp';
import { TimerOptions } from './types';

export * from "./cosmosdb";
export * from "./http";
export * from "./storage";

export function timer(schedule: string, options?: TimerOptions) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const timerOptions = { index, ...azFuncTrigger.timer({ schedule, ...options }) };
        FunctionApp.addTrigger(functionName, timerOptions);
    };
}

export function azureFunction(name?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionId = propertyKey;
        const functionHandler = descriptor.value!;
        FunctionApp.registerFunction(functionId, functionHandler, name);
    };
}

export function returns(options: FunctionOutput) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionName = propertyKey;
        FunctionApp.setReturnValue(functionName, options);
    };
}

export function trigger(type: string, options: Record<string, unknown> = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const trigger = {
            type,
            name: functionName + index,
            index,
            ...options,
        };
        FunctionApp.addTrigger(functionName, trigger);
    };
}

export function input(type: string, options: Record<string, unknown> = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const input = {
            type,
            name: functionName + index,
            index,
            ...options,
        };
        FunctionApp.addInput(functionName, input);
    };
}

export function output(type: string, options: Record<string, unknown> = {}) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const outputOptions = {
            type,
            name: functionName + index,
            index,
            ...options,
        };
        FunctionApp.addOutput(functionName, outputOptions);
    };
}

