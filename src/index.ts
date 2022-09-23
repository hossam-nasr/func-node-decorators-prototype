import { HttpRequest, InvocationContext } from "@azure/functions";
import { azureFunction, http } from "../framework";

class FunctionApp implements FunctionApp {
    
   @azureFunction()
    async httpTrigger1(context: InvocationContext, @http() request: HttpRequest) {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return {
            body: `Hello, ${name}`
        }
    }

}

export default new FunctionApp()