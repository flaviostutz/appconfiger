# idempotender core

This is the javascript library for fetching configurations from AWS AppConfig.

## Usage

- `npm install --save @appconfiger/core`

- Create an AWS AppConfig configuration as in https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-working.html

### Example: Check if feature flag is enabled

- Create function

```js
import appconfiger from '@appconfiger/core';

const asession = await appconfiger({
  applicationId: "tifgo2h",
  configurationProfileId: "dy2ta4b",
  environmentId: "olevrb8",
  ttl: 300,
});

function sumNumbers(value1: number, value2 number): number {

  if(asession.featureFlagEnabled('use-new-strategy')) {
    console.log('This is the NEW strategy!');
    return value1 + value2;
  }

  console.log('This is the OLD strategy!');
  return value2 + value1;
}
```

### Example: Get custom configuration contents

- This will make the function always add a certain value defined in the attributes of a feature flag as a configurable tweak to the summing function.

- Create function

```js
import appconfiger from '@appconfiger/core';

const asession = await appconfiger({
  applicationId: "tifgo2h",
  configurationProfileId: "dy2ta4b",
  environmentId: "olevrb8",
  cacheTTL: 300,
});

function sumNumbers(value1: number, value2 number): number {
  const customTweaks = asession.featureFlag('custom-tweaks');
  if(customTweaks.enabled) {
    return value1 + value2 + customTweaks.alwaysAdd;
  }
  return value2 + value1;
}

```

## Reference

- Config attributes:

  - **applicationId**

    - ApplicationIdentifier as in AWS AppConfig. Required

  - **configurationProfileId**

    - ConfigurationProfileIdentifier as in AWS AppConfig. Required

  - **environmentId**

    - EnvironmentId as in AWS AppConfig. Required

  - **ttl**

    - Time in seconds in which a fetched configuration will remain cached

    - After timeout, a background operation will poll for a newer configuration

    - While the configuration is being polled a staled cache version of the configuration will be used

    - Defaults to 300

## Functions

- **featureFlag(name:string)**

  - Returns the feature flag contents, or null, if it doesn't exist.

  - All feature flags have the attribute `enabled` and if you defined custom attributes to it, you can access them in the returned object.

- **featureFlagEnabled(name:string)**

  - Returns true if feature flag exists and is enabled.

  - Returns false if feature flag is disabled or if it doesn't exist.

- **contents()**

  - Returns the raw configuration profile contents.
  
  - In case configurationProfileId is of type Feature Flag, it will return all feature flags along with all its attributes.
  
  - If its FreeForm, the raw contents will be returned (maybe a JSON, yml or plain text).

