# random-number-lambda

This is a complete example of a AWS Lambda function using Serverless Framework using AppConfiger to get configurations from AWS AppConfig that will change the behavior of the random generator function.

## How to run

- Checkout this repo

- Configure your shell with proper AWS credentials (https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

- Run commands

```sh
cd examples/random-number-lambda
make deploy

# in another terminal
curl -v http://localhost:3000/local/random/number
```

- Example results:

```sh
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET /local/random/number HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 200 OK
< access-control-allow-origin: *
< x-idempotency-from: 2022-11-15T16:48:55.158Z
< content-type: application/json; charset=utf-8
< cache-control: no-cache
< content-length: 57
< accept-ranges: bytes
< Date: Tue, 15 Nov 2022 16:48:55 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
<
* Connection #0 to host localhost left intact
{"number":14296,"timestamp":"2022-11-15T16:48:55.157Z"}*
```

- Test function deactivation by feature flag

  - Open AWS Console, go to AppConfig and find the feature flag 'randomNumber'
  - Disable the feature flag manually
  - Deploy the new feature flag version
  - Wait 15s and call `curl -v http://localhost:3000/local/random/number` again
  - See that the function will be deactivated after polling time

- Test configuration tweaks in the number generation
  - Open AWS Console and find the feature flag 'randomNumber'
  - Enable the feature feature again
  - Change feature flag attributes 'minValue' and 'maxValue' to 100 and 200
  - Deploy the new feature flag version
  - Wait 15s and call `curl -v http://localhost:3000/local/random/number` again
  - Check that the returned random number now will be always between 100 and 200
