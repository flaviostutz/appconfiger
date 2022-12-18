import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  GetLatestConfigurationResponse,
} from '@aws-sdk/client-appconfigdata';

import { Contents } from './types/Contents';
import { Tracker } from './types/Tracker';

const startTracker = async (initialToken: string): Promise<Tracker> => {
  const acClient = new AppConfigDataClient({});

  const contents: Contents = {
    contentType: '',
    configuration: null,
  };

  let nextToken = initialToken;
  let nextPollTime = 0;
  let pollingMutex = false;

  const pollConfiguration = async (): Promise<void> => {
    // https://appconfigdata.us-east-1.amazonaws.com/configuration?configuration_token=
    const latestConfigCmd = new GetLatestConfigurationCommand({
      ConfigurationToken: nextToken,
    });

    try {
      const latestConfigResp = await acClient.send(latestConfigCmd);
      if (!latestConfigResp.NextPollIntervalInSeconds) {
        console.error('NextPollIntervalInSeconds could not be read. Stopping polling');
        throw new Error('NextPollIntervalInSeconds could not be read. Stopping polling');
      }
      if (!latestConfigResp.NextPollConfigurationToken) {
        console.error('NextPollConfigurationToken could not be read. Stopping polling');
        throw new Error('NextPollConfigurationToken could not be read. Stopping polling');
      }

      // prettier-ignore
      nextPollTime = new Date().getTime() + (latestConfigResp.NextPollIntervalInSeconds * 1000);

      // eslint-disable-next-line require-atomic-updates
      nextToken = latestConfigResp.NextPollConfigurationToken;

      // 'Configuration' will only be non null if it was updated since last
      // time this session fetched it
      if (latestConfigResp.Configuration && `${latestConfigResp.Configuration}` !== '') {
        contents.configuration = decodeConfiguration(latestConfigResp);
        contents.contentType = latestConfigResp.ContentType;
      }
    } catch (err) {
      console.error(`Error polling AppConfig. err=${err}`);
    }
    pollingMutex = false;
  };

  // we are doing background polling for now, so we woulnd't
  // need to make this async, but maybe in the future we will
  // want to make it real blocking so let's keep like that
  // so we won't break compatibility in the future
  // (all clients will be using wait already)
  const step = async (): Promise<Contents> => {
    // verify if we should trigger a polling in background
    // it won't wait for AppConfig update for the current request, but will
    // make the updated configuration value available for next requests
    // console.log(`>>> ${pollingMutex} ${new Date().getTime()} ${nextPollTime}`);
    if (!pollingMutex && new Date().getTime() >= nextPollTime) {
      pollingMutex = true;
      // mutex is used so that only one request can schedule a polling, even if
      // it's taking longer than the Lambda event request itself
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        pollConfiguration();
      }, 0);
    }
    return contents;
  };

  // perform first polling
  await pollConfiguration();

  return {
    contents: async (): Promise<Contents> => {
      return step();
    },
  };
};

const decodeConfiguration = (configurationResponse: GetLatestConfigurationResponse): any => {
  const contentType = configurationResponse.ContentType;
  if (!contentType) {
    return configurationResponse.Configuration;
  }

  if (contentType === 'application/json') {
    const str = new TextDecoder().decode(configurationResponse.Configuration);
    return JSON.parse(str);
  }

  if (contentType.includes('yml') || contentType.includes('yaml') || contentType === 'text/plain') {
    return new TextDecoder().decode(configurationResponse.Configuration);
  }

  return configurationResponse.Configuration;
};

export { startTracker };
