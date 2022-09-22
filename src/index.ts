import { HttpRequest, InvocationContext } from "@azure/functions";
import { http } from "../framework";

class FunctionApp implements FunctionApp {
    // @azureFunction()
    @http()
    async httpTrigger1(context: InvocationContext, request: HttpRequest) {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return {
            body: `Hello, ${name}`
        }
    }

}

export default new FunctionApp()