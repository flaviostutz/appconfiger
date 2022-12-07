/* eslint-disable @typescript-eslint/no-empty-function */

import middy from '@middy/core';

import { awsContext } from './__mock__/awsContext';

import appConfigerMiddy from './index';

const idem = idempotender({
  lockAcquireTimeout: 1, lockTTL: 2,
});

const randomInt = (): number => {
  return Math.floor(Math.random() * 999999);
};

describe('When using default configurations', () => {

  it('Jmespath expression should be required', async () => {
    const test = (): any => idempotenderMiddy({ dynamoDBClient: testDynamoDBClient });
    expect(test).toThrowError();
  });

});

