# appconfiger

JS lib for making it easier to use AWS AppConfig feature flags.

This lib uses AWS SDK and adds the following capabilities on top of it:

- Caches configuration responses
  - AWS SDK returns the full configuration contents only when it is changed (this is an optimization strategy)

- Fetches new configuration in background when TTL is expired
  - When you request the configuration it will return immediatelly the cached response, even if stale, while it fetches the newer configuration in background to avoid adding latency to your main process

- Make sure that only one request to AWS SDK for polling configuration will be made, even if there are multiple concurrent promises requesting the configuration

- Middy middleware that will add the attribute `appconfiger` to the Lambda context with the AppConfig configuration contents, or can disable the Lambda function if a certain feature flag is not activated.

You can use it as:

- [Middy Middleware for AWS Lambda functions](middy/README.md)
- [Core library for anything else](core/README.md)

- [Check a working example here](examples/random-generator-lambda/README.md)

We are Typescript friendly :)

## Sample usage for AWS Lambda

- In this example, we will disable the Lambda function if the feature flag "random-number-enable" is disabled or doesn't exist in AWS AppConfig. It will check if the feature flag was changed every 5 minutes.

- `npm install --save @appconfiger/middy`

- Create AWS Lambda function exposed through AWS API Gateway and use the Middy middleware

```js
import appconfigerMiddy from '@appconfiger/middy';

const handler = middy((event, context) => {
  console.log('This will be executed only if feature flag "random-generator-enable" is enabled in AWS AppConfig!');
  return { message: `This was run on ${new Date()}` };
});

handler.use(
  appconfigerMiddy({
    applicationId: "tifgo2h",
    configurationProfileId: "dy2ta4b",
    environmentId: "olevrb8",
    ttl: 300,
    featureFlag: "random-generator-enable"
  }),
);
```

## References

- Config attributes:

  - **configTTL**

    - Time in seconds in which a certain Configuration will be cached after a successfull call to AWS AppConfig.

    - After this time, a stale cached version of the Configuration will still be used while the library polls AWS AppConfig API for a newer configuration in background.

    - Small timeouts increases cloud costs, as more 

    - Defaults to '300' (5 minutes)

## Specific documentation

- [Middy Middleware for AWS Lambda functions](middy/README.md)
- [Core Idempotender lib](core/README.md)
