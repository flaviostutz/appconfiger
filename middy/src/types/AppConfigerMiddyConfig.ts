import { AppConfigerConfig } from '@appconfiger/core';

export type AppConfigerMiddyConfig = AppConfigerConfig & {
  /**
   * Name of the feature flag used to control if
   * the function will be enabled or disabled
   */
  featureFlag: string;
};
