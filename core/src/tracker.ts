import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  GetLatestConfigurationResponse,
} from '@aws-sdk/client-appconfigdata';

import { Contents } from './types/Contents';
import { Tracker } from './types/Tracker';

const startTracker = async (initialToken: string): Promise<Tracker> => {
  const acClient = new AppConfigDataClient({});
  let active = true;
  let timeoutHandler: NodeJS.Timeout;

  const contents: Contents = {
    contentType: '',
    configuration: null,
  };

  let nextToken = initialToken;

  const pollConfiguration = async (): Promise<void> => {
    const latestConfigCmd = new GetLatestConfigurationCommand({
      ConfigurationToken: nextToken,
    });

    const latestConfigResp = await acClient.send(latestConfigCmd);
    if (!latestConfigResp.NextPollIntervalInSeconds) {
      console.error('NextPollIntervalInSeconds could not be read. Stopping polling');
      throw new Error('NextPollIntervalInSeconds could not be read. Stopping polling');
    }
    if (!latestConfigResp.NextPollConfigurationToken) {
      console.error('NextPollConfigurationToken could not be read. Stopping polling');
      throw new Error('NextPollConfigurationToken could not be read. Stopping polling');
    }

    // eslint-disable-next-line require-atomic-updates
    nextToken = latestConfigResp.NextPollConfigurationToken;

    // 'Configuration' will only be non null if it was updated since last
    // time this session fetched it
    if (latestConfigResp.Configuration) {
      contents.configuration = decodeConfiguration(latestConfigResp);
      contents.contentType = latestConfigResp.ContentType;
    }

    // schedule next polling
    if (active) {
      timeoutHandler = setTimeout(() => {
        // eslint-disable-next-line no-void
        void pollConfiguration();
      }, latestConfigResp.NextPollIntervalInSeconds * 1000);
    }
  };

  // start polling
  await pollConfiguration();

  return {
    contents: (): Contents => {
      return contents;
    },
    stop: (): void => {
      clearTimeout(timeoutHandler);
      active = false;
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
