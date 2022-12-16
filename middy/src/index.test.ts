import middy from '@middy/core';

import { awsContext } from './__mock__/awsContext';

import appConfigerMiddy from './index';

let mockConfiguration:any = null;

const testConfig = {
  applicationId: 'aaaaa',
  configurationProfileId: 'bbbbb',
  environmentId: 'ccccc',
  pollingInterval: 1000,
  featureFlag: 'flag1',
};

describe('When using middy middleware', () => {

  it('Should run function when feature flag is enabled', async () => {
    mockConfiguration = {
      flag1: {
        enabled: true,
      },
    };

    const appConfigMiddleware = await appConfigerMiddy(testConfig);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handler = middy(() => {});
    handler.use(appConfigMiddleware);

    await handler({}, awsContext());
  });

  it('Should disable function if unexisting feature flag', async () => {
    mockConfiguration = {
      anyflag1: {
        enabled: true,
      },
    };

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

  it('Should enable function if empty feature flag name', async () => {
    mockConfiguration = {
    };

    const appConfigMiddleware = await appConfigerMiddy({
      ...testConfig,
      featureFlag: '',
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handler = middy(() => {});
    handler.use(appConfigMiddleware);
    const event = { param1: 'abc' };

    return handler(event, awsContext());
  });

  it('Should add config to handler context', async () => {
    mockConfiguration = {
      flag1: {
        enabled: true,
        custom1: 'abc',
        custom2: 123,
      },
    };

    const appConfigMiddleware = await appConfigerMiddy(testConfig);

    let runContext:any = null;
    const handler = middy(async (request: any, context: any) => {
      runContext = context;
      return {};
    });
    handler.use(appConfigMiddleware);
    const event = { param1: 'abc' };

    await handler(event, awsContext());

    expect(runContext.appconfiger).toStrictEqual(mockConfiguration);
    expect(runContext.appconfiger.flag1).toBeDefined();
    expect(runContext.appconfiger.flag1.enabled).toBeTruthy();
  });

});


jest.mock('@appconfiger/core', () => {
  return {
    startAppConfiger: jest.fn().mockImplementation(() => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        stop: ():void => {},
        contents: ():any => {
          return {
            contentType: 'application/json',
            configuration: mockConfiguration,
          };
        },
        featureFlag: (name: string): any => {
          return mockConfiguration[name];
        },
        featureFlagEnabled: (name: string): boolean => {
          return mockConfiguration[name]?.enabled;
        },
      };
    }),
  };
});
