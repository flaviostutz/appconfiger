/* eslint-disable no-undefined */
import { startAppConfiger } from '@appconfiger/core';
import middy from '@middy/core';

import { AppConfigerMiddleware } from './types/AppConfigerMiddleware';
import { AppConfigerMiddyConfig } from './types/AppConfigerMiddyConfig';

const middleware = async (
  config: AppConfigerMiddyConfig,
): Promise<AppConfigerMiddleware> => {
  if (!config.featureFlag && !config.featureFlag?.trim()) {
    throw new Error(
      "Config: 'featureFlag' is required in configuration object to indicate which feature flag controls if this function is enabled or not",
    );
  }
  const asession = await startAppConfiger(config);

  const before: middy.MiddlewareFn = async (): Promise<any> => {
    if (!asession.featureFlagEnabled(config.featureFlag)) {
      throw new Error(`Function disabled (${config.featureFlag})`);
    }
    return Promise.resolve(undefined);
  };

  const stop = ():void => {
    asession.stop();
  };

  return {
    before,
    stop,
  };
};

export default middleware;
