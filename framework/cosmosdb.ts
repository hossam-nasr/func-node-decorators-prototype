import { CosmosDBTriggerOptions } from "@azure/functions";
import FunctionApp from "./FunctionApp";

export function cosmosDBTrigger(settings: CosmosDBTriggerOptions) {
    return function (target: any, propertyKey: string | symbol, index: number) {
        const functionName = propertyKey.toString();
        const triggerOptions = {
            type: 'cosmosDBTrigger',
            name: functionName + index,
            index,
            ...settings
        };
        FunctionApp.addTrigger(functionName, triggerOptions);
    }
};