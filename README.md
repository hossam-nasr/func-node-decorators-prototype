# Azure Functions TypeScript Decorators - Sample App
This repo includes a sample prototype app for using the [`azure-functions-decorators-typescript`](https://github.com/hossam-nasr/azfunc-nodejs-decorators-typescript) package, which allows you to register Azure Functions using TypeScript decorators.

## Prerequisites
- Node.js v18+
- TypeScript v4+

## Setup

1. Clone this repository

2. Add a `local.settings.json` file with the following contents:

```json
{
    "IsEncrypted": false,
    "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
        "AzureWebJobsStorage": "UseDevelopmentStorage=true"
    }
}
```

3. Install and run the [local storage emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio). Alternatively, you may set the `AzureWebJobsStorage` field in your `local.settings.json` to a connection string for a storage account in Azure.

4. (optional) Add a `storage_APPSETTING` field to your `local.settings.json`, with a connection string for a storage account in Azure, in order to enable the storage triggers and bindings. If you don't do this, the storage related functions will not be registered.

5. Run `npm install`

6. Run `npm start`

7. You have a running Azure Functions app using TypeScript decorators!

