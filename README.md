# appconfiger

JS lib for making it easier to use AWS AppConfig

This lib uses AWS SDK and adds the following capabilities on top of it:

- Caches configuration responses
  - AWS SDK returns the full configuration contents only when it is changed (this is an optimization strategy)
- Fetches new configuration in background when TTL is expired
  - When you request the configuration it will return immediatelly the cached response, even if stale, while it fetches the newer configuration in background to avoid adding latency to your main process
- Make sure that only one request to AWS SDK for polling configuration will be made, even if there are multiple concurrent promises requesting the configuration
- Middy middleware that will add the attribute `appconfiger` to the context with the appconfig configuration contents

## How to use

