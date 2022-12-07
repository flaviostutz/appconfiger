import crypto from 'crypto';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { AppConfigerConfig } from './types/AppConfigerConfig';

const defaultConfig: AppConfigerConfig = {
  dynamoDBTableName: 'IdempotencyExecutions',
  lockEnable: true,
  lockTTL: 60,
  executionTTL: 24 * 3600,
  keyHash: true,
  lockAcquireTimeout: 10,
  dynamoDBClient: new DynamoDBClient({}),
};

/**
 * Call this function passing config to start using Idempotender.
 * Pass a generics type while calling the function to type the
 * execution output for your specific case
 * @param config Configuration parameters
 */
const core = <T>(config: AppConfigerConfig): AppConfiger => {
  const config1 = { ...defaultConfig, ...config };
  if (!config1.lockTTL) {
    throw new Error('Config: lockTTL is required');
  }

  return {
    getExecution: async (key: string): Promise<Execution<T>> => {
      if (!key || typeof key !== 'string' || key.length <= 3) {
        throw new Error(`The key used for idempotency must be a string with len>3. key='${key}'`);
      }
    },
  };
};

export { core };
