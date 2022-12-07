# idempotender

Middy middleware for making AWS Lambda Functions imdepotent.

The overall steps that this middlware performs are:

- At the beginning of the function execution, it will extract a key from the input and look for that "execution" in DynamoDB
- In general, if the key exists in a DynamoDB table, it means this execution was already done, so the middleware get the previous output and return it to the Lambda function caller. The caller won't know it wasn't really executed, and will receive the same response as the first client, which is expected.
- If the key doesn't exist, then actual function handler will be run and at the end the middleware will save the output to DynamoDB table before returning it to the caller
- Imdepondenter will control a lock between two parallel requests so only one request will be processed at a time for a specific key and the second one will receive the same contents of the first request, but the actual handler logic will run only once

## Usage

- `npm install --save @idempotender/middy`


### Example: Simple Lambda

- In this example, we will use attribute 'param1' from event as the key of idempotency while hashing and using lock to avoid concurrency

- Create Lambda function

```js
import idempotenderMiddy from '@idempotender/middy';

const handler = middy((event, context) => {
  console.log(`Running for '${event.param1}' on ${new Date()}`);
  return { message: `This was run for '${event.param1}' on ${new Date()}` };
});

handler.use(
  idempotenderMiddy({
    keyJmespath: 'param1',
  }),
);
```

### Example: Lambda called via REST API

- In this example, the Lambda is invoked through AWS API Gateway, so we select attributes 'method', 'path' and request 'body' from event as the key of idempotency.

- The extracted key will then be hashed before being stored in database, so data is not exposed, but you have a very very tiny change of collision (we use hash-256).

- Create AWS Lambda function exposed through AWS API Gateway

```js
import idempotenderMiddy from '@idempotender/middy';

const handler = middy((event, context) => {
  console.log('Will only execute this once for the same URL method + path + body contents');
  return { message: `This was run for '${event.param1}' on ${new Date()}` };
});

handler.use(
  idempotender({
    keyJmespath: '[method, path, body]',
  }),
);
```

## Reference

- These are the default values of the configuration

```js
const idem = idempotenderMiddy({
  lockEnable: true,
}
```

- You must use idempotender middleware as the first middleware in the chain so that it can store the response after all other middlewares are executed and be the first to return when a idempotent call is detected

```js
// example
handler = middy(lambdaHandler)
  .use(idempotenderMiddy(config))
  .use(httpErrorHandler())
  .use(cors());
```

- Config attributes:

  - **dynamoDBTableName**

    - DynamoDB table to use for controlling idempotency

    - Defaults to 'IdempotencyExecutions'
