import { HttpRequest, InvocationContext, Timer } from "@azure/functions";
import { azureFunction, http, timer } from "../framework";

class FunctionApp {
    
   @azureFunction()
    async testHttpTrigger(context: InvocationContext, @http() request: HttpRequest) {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return {
            body: `Hello, ${name}`
        }
    }

    @azureFunction()
    async timerTrigger1(context: InvocationContext, @timer('0 */5 * * * *') myTimer: Timer) {
        var timestamp = new Date().toISOString();
        context.log('The current time is: ', timestamp);
    }

}

export default FunctionApp