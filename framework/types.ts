import { FunctionHandler as AzFuncFunctionHandler, FunctionInput, FunctionOutput, FunctionResult, FunctionTrigger, InvocationContext } from "@azure/functions";

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