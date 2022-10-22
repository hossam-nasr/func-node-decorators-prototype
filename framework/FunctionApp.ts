import { app, FunctionOutput, InvocationContext } from "@azure/functions";
import { FunctionHandler, FunctionInfo, Input, Output, Trigger } from "./types";

export default class FunctionApp {
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