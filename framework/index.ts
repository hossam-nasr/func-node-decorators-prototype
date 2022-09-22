import { app, HttpTriggerOptions } from "@azure/functions"

export function http(options?: HttpTriggerOptions) {
    if (!options) {
        options = {}
    }
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        app.http(propertyKey, {...options, handler: descriptor.value!})
    }
}