import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  GetLatestConfigurationResponse,
} from '@aws-sdk/client-appconfigdata';

import { core } from './core';
import { AppConfiger } from './types/AppConfiger';
import { Contents } from './types/Contents';

const startTracker = async (initialToken: string): AppConfiger => {
  const acClient = new AppConfigDataClient({});

  const contents:Contents = {
    contentType: '',
    configuration: null,
  };

  let nextToken = initialToken;

  const pollConfiguration = async ():Promise<void> => {
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

    if (latestConfigResp.Configuration) {
      contents.configuration = decodeConfiguration(latestConfigResp);
      contents.contentType = latestConfigResp.ContentType;
    }

    setTimeout(() => pollConfiguration, latestConfigResp.NextPollIntervalInSeconds * 1000);
  };

  // start polling
  await pollConfiguration();

  return {
    contents: ():any => {
      // FIXME
      return null;
    },
    featureFlagEnabled: (name: string): boolean => {
      // FIXME
      return false;
    },
    featureFlag: (name: string): any => {
      // FIXME
      return {};
    },
  };
};

const decodeConfiguration = (configurationResponse:GetLatestConfigurationResponse):any => {
  const contentType = configurationResponse.ContentType;
  if (!contentType) {
    return configurationResponse.Configuration;
  }

  if (contentType === 'application/json') {
    const str = new TextDecoder().decode(configurationResponse.Configuration);
    return JSON.parse(str);
  }

  if (contentType.includes('yml') ||
      contentType.includes('yaml') ||
      contentType === 'text/plain') {
    const str = new TextDecoder().decode(configurationResponse.Configuration);
    return str;
  }

  return configurationResponse.Configuration;
};

export { core };
