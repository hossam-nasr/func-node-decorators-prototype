import {
    app,
    FunctionHandler as AzFuncFunctionHandler,
    FunctionInput,
    FunctionOutput,
    FunctionResult,
    FunctionTrigger,
    HttpTriggerOptions,
    InvocationContext,
    output as AzFuncOutput,
    trigger as azFuncTrigger
} from '@azure/functions';

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

export function timer(schedule: string, options?: TimerOptions) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const timerOptions = { index, ...azFuncTrigger.timer({ schedule, ...options }) };
        FunctionApp.addTrigger(functionName, timerOptions);
    };
}

export function azureFunction() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const functionName = propertyKey;
        const functionHandler = descriptor.value!;
        FunctionApp.registerFunction(functionName, functionHandler);
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

class FunctionApp {
    private static functions: Map<string, FunctionInfo> = new Map<string, FunctionInfo>();

    static addTrigger(functionName: string, trigger: Trigger) {
        if (!FunctionApp.functions[functionName]) {
            FunctionApp.functions[functionName] = {
                trigger,
            };
            return;
        }
        const functionInfo = FunctionApp.functions[functionName];
        if (functionInfo.trigger) {
            throw new Error(
                `A trigger was already defined for the function ${functionName}. A function must have only one trigger.`
            );
        }
        functionInfo.trigger = trigger;
    }

    static registerFunction(functionName: string, functionHandler: FunctionHandler) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        if (!functionInfo || !functionInfo.trigger) {
            throw new Error('no trigger is defined for this function');
        }

        const newHandler = async (context: InvocationContext, trigger: any): Promise<any> => {
            const resolvedBindings = [
                { index: 0, value: context },
                { index: functionInfo.trigger.index, value: trigger },
            ];
            if (functionInfo.extraInputs) {
                functionInfo.extraInputs.map((input) => {
                    const inputValue = context.extraInputs.get(input);
                    resolvedBindings.push({ index: input.index, value: inputValue });
                });
            }
            if (functionInfo.extraOutputs) {
                functionInfo.extraOutputs.map((output) => {
                    const outputValue = {
                        set(value: any) {
                            context.extraOutputs.set(output, value);
                        },
                    };
                    resolvedBindings.push({ index: output.index, value: outputValue });
                });
            }

            resolvedBindings.sort((a, b) => a.index - b.index);
            const args = resolvedBindings.map(({ value }) => value);
            return functionHandler.call(null, ...args);
        };

        app.generic(functionName, {
            handler: newHandler,
            trigger: functionInfo.trigger!!,
            ...functionInfo,
        });
    }

    static setReturnValue(functionName: string, returnOptions: FunctionOutput) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        if (functionInfo) {
            functionInfo.return = returnOptions;
            return;
        }
        FunctionApp.functions[functionName] = {
            return: returnOptions,
        };
    }

    static hasReturnValue(functionName: string) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        return typeof functionInfo.return !== 'undefined';
    }

    static addInput(functionName: string, inputOptions: Input) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        if (functionInfo) {
            if (functionInfo.extraInputs) {
                functionInfo.extraInputs.push(inputOptions);
                return;
            }
            functionInfo.extraInputs = [inputOptions];
            return;
        }
        FunctionApp.functions[functionName] = {
            extraInputs: [inputOptions],
        };
    }

    static addOutput(functionName: string, outputOptions: Output) {
        const functionInfo: FunctionInfo = FunctionApp.functions[functionName];
        if (functionInfo) {
            if (functionInfo.extraOutputs) {
                functionInfo.extraOutputs.push(outputOptions);
                return;
            }
            functionInfo.extraOutputs = [outputOptions];
            return;
        }
        FunctionApp.functions[functionName] = {
            extraOutputs: [outputOptions],
        };
    }
}

export interface FunctionInfo {
    trigger?: Trigger;

    return?: FunctionOutput;

    extraInputs?: Input[];

    extraOutputs?: Output[];
}

export interface Input extends FunctionInput {
    index: number;
}

export interface Output extends FunctionOutput {
    index: number;
}

export interface Trigger extends FunctionTrigger {
    index: number;
}

export interface TimerOptions {
    /**
     * If `true`, the function is invoked when the runtime starts.
     * For example, the runtime starts when the function app wakes up after going idle due to inactivity, when the function app restarts due to function changes, and when the function app scales out.
     * _Use with caution_. runOnStartup should rarely if ever be set to `true`, especially in production.
     */
    runOnStartup?: boolean;

    /**
     * When true, schedule will be persisted to aid in maintaining the correct schedule even through restarts. Defaults to true for schedules with interval >= 1 minute
     */
    useMonitor?: boolean;
}

export type FunctionHandler = AzFuncFunctionHandler &
    ((context: InvocationContext, trigger: any, ...args: any) => FunctionResult);
