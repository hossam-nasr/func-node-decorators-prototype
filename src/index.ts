import { HttpRequest, InvocationContext, Timer } from '@azure/functions';
import { azureFunction, http, input, output, timer, trigger } from '../framework';

class FunctionApp {
    @azureFunction()
    async testHttpTrigger(context: InvocationContext, @http() request: HttpRequest) {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || (await request.text()) || 'world';

        return {
            body: `Hello, ${name}`,
        };
    }

    @azureFunction()
    async timerTrigger1(context: InvocationContext, @timer('0 */5 * * * *') myTimer: Timer) {
        var timestamp = new Date().toISOString();
        context.log('The current time is: ', timestamp);
    }

    @azureFunction()
    async copyBlob1(
        context: InvocationContext,
        @trigger('queueTrigger', { queueName: 'copyblobqueue', connection: 'storage_APPSETTING' }) queueItem: unknown,
        @input('blob', { connection: 'storage_APPSETTING', path: 'helloworld/{queueTrigger}' }) blobInput: unknown,
        @output('blob', { connection: 'storage_APPSETTING', path: 'helloworld/{queueTrigger}-copy' })
        blobOutput: any
    ): Promise<void> {
        context.log('Storage queue function processes work item: ', queueItem);
        blobOutput.set(blobInput);
    }
}

export default FunctionApp;
