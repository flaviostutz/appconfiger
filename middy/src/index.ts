/* eslint-disable no-undefined */
import appconfigerCore from '@appconfiger/core';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { AppConfigerMiddyConfig } from './types/AppConfigerMiddyConfig';

const middleware = (
  config: AppConfigerMiddyConfig,
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  if (!config.keyMapper && !config.keyJmespath?.trim()) {
    throw new Error(
      "Config: Either 'keyJmespath' or a custom 'keyMapper' function is required in configuration object",
    );
  }
  const idemCore = appconfigerCore(config);

  const before: middy.MiddlewareFn = async (request): Promise<any> => {
    // get execution
    const execution = await idemCore.getExecution(key);
    return Promise.resolve(undefined);
  };
};

export default middleware;
