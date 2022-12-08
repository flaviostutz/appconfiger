import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  GetLatestConfigurationResponse,
  StartConfigurationSessionCommand,
  StartConfigurationSessionResponse,
} from '@aws-sdk/client-appconfigdata';

import { AppConfigerConfig } from './types/AppConfigerConfig';
import { AppConfiger } from './types/AppConfiger';

const defaultConfig: AppConfigerConfig = {
  applicationId: '',
  configurationProfileId: '',
  environmentId: '',
  cacheTTL: 300,
};

/**
 * Call this function passing config to start using Idempotender.
 * Pass a generics type while calling the function to type the
 * execution output for your specific case
 * @param config Configuration parameters
 */
const core = async (config: AppConfigerConfig): Promise<AppConfiger> => {
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

  if (!config1.cacheTTL) {
    throw new Error('"cacheTTL" is required in configuration');
  }

  const acClient = new AppConfigDataClient({});
  const startSessionCmd = new StartConfigurationSessionCommand({
    ApplicationIdentifier: config1.applicationId,
    ConfigurationProfileIdentifier: config1.configurationProfileId,
    EnvironmentIdentifier: config1.environmentId,
    RequiredMinimumPollIntervalInSeconds: config.cacheTTL,
  });
  const startSessionResp = await acClient.send(startSessionCmd);
  startSessionResp.InitialConfigurationToken;

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

export { core };
