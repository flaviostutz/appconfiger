import {
  AppConfigDataClient,
  StartConfigurationSessionCommand,
} from '@aws-sdk/client-appconfigdata';

import { startTracker } from './tracker';
import { AppConfigerConfig } from './types/AppConfigerConfig';
import { AppConfiger } from './types/AppConfiger';
import { Contents } from './types/Contents';

const defaultConfig: AppConfigerConfig = {
  applicationId: '',
  configurationProfileId: '',
  environmentId: '',
  pollingInterval: 300,
};

/**
 * Call this function passing config to start using Idempotender.
 * Pass a generics type while calling the function to type the
 * execution output for your specific case
 * @param config Configuration parameters
 */
const startCore = async (config: AppConfigerConfig): Promise<AppConfiger> => {
  if (!config.applicationId) {
    throw new Error('"applicationId" is required in configuration');
  }
  if (!config.configurationProfileId) {
    throw new Error('"configurationProfileId" is required in configuration');
  }
  if (!config.environmentId) {
    throw new Error('"environmentId" is required in configuration');
  }

  const config1 = { ...defaultConfig, ...config };

  if (!config1.pollingInterval) {
    throw new Error('"pollingInterval" is required in configuration');
  }

  const acClient = new AppConfigDataClient({});
  const startSessionCmd = new StartConfigurationSessionCommand({
    ApplicationIdentifier: config1.applicationId,
    ConfigurationProfileIdentifier: config1.configurationProfileId,
    EnvironmentIdentifier: config1.environmentId,
    RequiredMinimumPollIntervalInSeconds: config.pollingInterval,
  });
  const startSessionResp = await acClient.send(startSessionCmd);
  if (!startSessionResp.InitialConfigurationToken) {
    throw new Error('"InitialConfigurationToken" must be defined after session is created');
  }

  // start background polling
  const tracker = await startTracker(startSessionResp.InitialConfigurationToken);

  return {
    contents: (): Contents => {
      return tracker.contents();
    },
    featureFlag: (name: string): any => {
      const contents = tracker.contents();
      if (contents.contentType === 'application/json') {
        return contents.configuration[name];
      }
      throw new Error(`Usupported content type for feature flag checks: ${contents.contentType}`);
    },
    featureFlagEnabled: (name: string): boolean => {
      const contents = tracker.contents();
      if (contents.contentType === 'application/json') {
        return contents.configuration[name]?.enabled;
      }
      throw new Error(`Usupported content type for feature flag checks: ${contents.contentType}`);
    },
    stop: (): void => {
      tracker.stop();
    },
  };
};

export { startCore };
