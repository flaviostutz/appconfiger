/* eslint-disable no-undefined */
import { startAppConfiger, AppConfiger } from '@appconfiger/core';
import middy from '@middy/core';

import { AppConfigerMiddleware } from './types/AppConfigerMiddleware';
import { AppConfigerMiddyConfig } from './types/AppConfigerMiddyConfig';

const middleware = (
  config: AppConfigerMiddyConfig,
): AppConfigerMiddleware => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (config.featureFlag === undefined) {
    throw new Error(
      "Config: 'featureFlag' is required in configuration object to indicate which feature flag controls if this function is enabled or not",
    );
  }

  let asession:AppConfiger;

  const before: middy.MiddlewareFn = async (request:any): Promise<any> => {
    if (!asession) {
      try {
        // eslint-disable-next-line require-atomic-updates
        asession = await startAppConfiger(config);
      } catch (err) {
        throw new Error(`Error initializing AppConfiger. err=${err}`);
      }
    }
    if (config.featureFlag.trim() !== '' && !asession.featureFlagEnabled(config.featureFlag)) {
      throw new Error(`Function disabled (${config.featureFlag})`);
    }

    request.context.appconfiger = asession.contents().configuration;
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
