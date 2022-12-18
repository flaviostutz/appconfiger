import { mockClient } from 'aws-sdk-client-mock';
import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  GetLatestConfigurationResponse,
  StartConfigurationSessionCommand,
  StartConfigurationSessionResponse,
} from '@aws-sdk/client-appconfigdata';

import { sleep } from './utils';
import { startCore } from './core';

const testConfig = {
  applicationId: 'aaaaa',
  configurationProfileId: 'bbbbb',
  environmentId: 'ccccc',
  pollingInterval: 1000,
};

const mockAppConfigContents = {
  contentType: 'application/json',
  configuration: {
    featFlag1: {
      enabled: true,
    },
    featFlag2: {
      enabled: true,
      customParameter1: 'value1',
      customParameter2: 'value2',
    },
    featFlag3: {
      enabled: false,
    },
  },
};
const resp1: StartConfigurationSessionResponse = {
  InitialConfigurationToken: 'token123',
};
const resp2: GetLatestConfigurationResponse = {
  NextPollConfigurationToken: 'token456',
  NextPollIntervalInSeconds: 1,
  ContentType: 'application/json',
  Configuration: new TextEncoder().encode(JSON.stringify(mockAppConfigContents.configuration)),
};

describe('when instantiating core(config)', () => {
  let acMock = mockClient(AppConfigDataClient);
  beforeEach(() => {
    // configure AppConfig SDK mocks
    acMock = mockClient(AppConfigDataClient);
    acMock.on(StartConfigurationSessionCommand).resolves(resp1);
    acMock.on(GetLatestConfigurationCommand).resolves(resp2);
  });

  it('should fetch initial conf on creation', async () => {
    expect(acMock.calls().length).toBe(0);
    const asession = await startCore(testConfig);
    expect(acMock.calls().length).toBe(2);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);
    await asession.contents();
    await asession.contents();
    expect(acMock.calls().length).toBe(2);
  });

  it('should re-fetch config after polling time', async () => {
    const asession = await startCore(testConfig);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);
    await asession.contents();
    expect(acMock.calls().length).toBe(2);
    await asession.contents();
    await sleep(1500);
    await asession.contents();
    await asession.contents();
    expect(acMock.calls().length).toBe(3);
    await asession.contents();
    await sleep(1500);
    await asession.contents();
    await asession.contents();
    expect(acMock.calls().length).toBe(4);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);
    await asession.contents();
    expect(acMock.calls().length).toBe(4);
  });

  it('use previous config when poll doest return updated config', async () => {
    const asession = await startCore(testConfig);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);

    // next poll won't return configuration
    const resp2a: GetLatestConfigurationResponse = {
      NextPollConfigurationToken: 'token789',
      NextPollIntervalInSeconds: 1,
      ContentType: 'application/json',
    };
    acMock.on(GetLatestConfigurationCommand).resolves(resp2a);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);

    await sleep(1100);
    await asession.contents();
    expect(acMock.calls().length).toBe(3);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);
  });

  it('update config when poll returns new contents', async () => {
    const asession = await startCore(testConfig);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);

    // next poll will change configuration
    const conf2a = { featFlag1: { enabled: false } };
    const resp2a: GetLatestConfigurationResponse = {
      NextPollConfigurationToken: 'token789',
      NextPollIntervalInSeconds: 1,
      ContentType: 'application/json',
      Configuration: new TextEncoder().encode(JSON.stringify(conf2a)),
    };
    acMock.on(GetLatestConfigurationCommand).resolves(resp2a);
    expect(await asession.contents()).toStrictEqual(mockAppConfigContents);

    await sleep(1100);
    await asession.contents();
    expect(acMock.calls().length).toBe(3);
    expect((await asession.contents()).configuration).toStrictEqual(conf2a);
  });

  it('check if feature flag is enabled', async () => {
    const asession = await startCore(testConfig);
    expect(await asession.featureFlagEnabled('featFlag1')).toBeTruthy();
    expect(await asession.featureFlagEnabled('anythingFlag')).toBeFalsy();
    expect(await asession.featureFlagEnabled('featFlag3')).toBeFalsy();
  });

  it('get feature flag contents successfully', async () => {
    const asession = await startCore(testConfig);
    expect(await asession.featureFlag('featFlag1')).toStrictEqual(
      mockAppConfigContents.configuration.featFlag1,
    );
    expect(await asession.featureFlag('anythingFlag')).toBeUndefined();
  });

  it('config with text contents should work', async () => {
    const resp2a: GetLatestConfigurationResponse = {
      NextPollConfigurationToken: 'token789',
      NextPollIntervalInSeconds: 1,
      ContentType: 'text/plain',
      Configuration: new TextEncoder().encode('my custom config here'),
    };
    acMock.on(GetLatestConfigurationCommand).resolves(resp2a);

    const asession = await startCore(testConfig);
    expect((await asession.contents()).configuration).toBe('my custom config here');
  });

  it('should throw exception for missing parameters', async () => {
    await expect(async () => {
      await startCore({
        applicationId: 'aaaaa',
        configurationProfileId: 'bbbb',
        environmentId: '',
      });
    }).rejects.toThrow();

    await expect(async () => {
      await startCore({
        applicationId: '',
        configurationProfileId: 'bbbb',
        environmentId: 'ccc',
      });
    }).rejects.toThrow();

    await expect(async () => {
      await startCore({
        applicationId: 'aaaaa',
        configurationProfileId: '',
        environmentId: 'ccc',
      });
    }).rejects.toThrow();
  });
});
