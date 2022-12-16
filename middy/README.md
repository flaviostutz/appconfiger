# idempotender

Middy middleware for configuring AWS Lambda Functions using AWS AppConfig.

You can automatically enable/disable a function based on a certain feature flag, or in more complex scenarios you can get the full configuration from `request.context.appconfiger` for more advanced tweaks in your function.

## Usage

- `npm install --save @appconfiger/middy`

### Example: Enable/disable a Lambda function based on feature flag state

- In this example the function will automatically refuse all requests if the feature flag 'myFunctionFlag' is disabled or inexistent in AppConfig.

- Create Lambda function

```js
import appConfigerMiddy from '@appconfiger/middy';

const handler = middy((event, context) => {
  console.log(`Running function on ${new Date()}`);
  return { message: `This function was run on ${new Date()}` };
});

handler.use(
  appConfigerMiddy({
    applicationId: 'aaaaa', //from AppConfig
    configurationProfileId: 'bbbbb', //from AppConfig
    environmentId: 'ccccc', //from AppConfig
    featureFlag: 'myFunctionFlag',
  }),
);
```


## Reference

### Configuration

```js
const idem = appConfigerMiddy({
  applicationId: '[APP ID IN APPCONFIG]',
  configurationProfileId: '[CONFIG PROFILE ID IN APPCONFIG]',
  environmentId: '[ENV ID IN APPCONFIG]',
  featureFlag: '[FLAG NAME IN APP CONFIG]',
  pollingInterval: 300,
}
```

- Config attributes

  - **applicationId**

    - Application name as defined in AppConfig. Required.

  - **configurationProfileId**

    - Configuration Profile Id as defined in AppConfig. Required.

  - **environmentId**

    - Environment Id as defined in AppConfig. Required.

  - **featureFlag**

    - Feature flag name. Required.
    - This Lambda function will be enabled only if there is a enabled feature flag with this same name in AppConfig
    - If you use an empty string as the name, this function will be always enabled and you can get AppConfig configurations from `context.appconfiger` for more complex checks.

  - **pollingInterval**

    - Interval in seconds for checking if there is a newer configuration in AppConfig
    - During this period the latest version of the configuration will be available
    - The polling is performed in background, so your function won't wait for the polling to finish before being run
    - Defaults to 300 (5 minutes)

### Handler context

When your function is called, you can access the attribute `appconfiger` in the context of the handler for accessing the complete configuration object.

- If the configuration in AppConfig is of type 'application/json', which is the most common situation, you will have a parsed object in the context.

- When using the 'feature flag' type of configuration in AppConfig, implicitly you are using 'application/json' and in this attribute you will have access to the complete list of feature flags and its inner attributes (as you configured in AppConfig). For example:

```js
  context.appconfiger >>> {
    featureFlag1: {
      enabled: true,
      customData1: 123
    },
    featureFlag2: {
      enabled: false
    }
  }
```
