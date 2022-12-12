import middy from '@middy/core';
import { AppConfiger } from '@appconfiger/core';

import { awsContext } from './__mock__/awsContext';

import appConfigerMiddy from './index';

const testConfig = {
  applicationId: 'aaaaa',
  configurationProfileId: 'bbbbb',
  environmentId: 'ccccc',
  pollingInterval: 1000,
  featureFlag: 'flag1',
};

describe('When using middy middleware', () => {

  it('Should run function with enabled feature flag', async () => {
    mockAppConfigContents({
      flag1: {
        enabled: true,
      },
    });

    const appConfigMiddleware = await appConfigerMiddy(testConfig);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handler = middy(() => {});
    handler.use(appConfigMiddleware);

    await handler({}, awsContext());

    appConfigMiddleware.stop();
  });

  it('Should disable function on unexisting feature flag', async () => {
    mockAppConfigContents({
      featFlag1: {
        enabled: true,
      },
    });

    const appConfigMiddleware = await appConfigerMiddy(testConfig);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handler = middy(() => {});
    handler.use(appConfigMiddleware);
    const event = { param1: 'abc' };

    const invokeHandler = async (): Promise<void> => {
      return handler(event, awsContext());
    };

    await expect(invokeHandler).rejects.toThrowError();

    appConfigMiddleware.stop();
  });

});

const mockAppConfigContents = (configuration:any):void => {
  const mockContents = {
    contentType: 'application/json',
    configuration,
  };

  jest.mock('@appconfiger/core', () => {
    return {
      startAppConfiger: jest.fn().mockImplementation(() => ({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        stop: ():void => {},
        contents: ():any => mockContents,
      })),
    };
  });
};
