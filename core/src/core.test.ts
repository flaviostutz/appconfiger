import { mockClient } from 'aws-sdk-client-mock';
import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  GetLatestConfigurationResponse,
  StartConfigurationSessionCommand,
  StartConfigurationSessionResponse,
} from '@aws-sdk/client-appconfigdata';

import { core } from './core';

const testConfig = {
  applicationId: 'aaaaa',
  configurationProfileId: 'bbbbb',
  environmentId: 'ccccc',
  cacheTTL: 300,
};

// configure AppConfig SDK mocks
const acMock = mockClient(AppConfigDataClient);
const resp1:StartConfigurationSessionResponse = {
  InitialConfigurationToken: 'token123',
};
acMock.on(StartConfigurationSessionCommand).resolves(resp1);

const mockAppConfigContents = {
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
};
const resp2:GetLatestConfigurationResponse = {
  NextPollConfigurationToken: 'token456',
  NextPollIntervalInSeconds: 2,
  ContentType: 'application/json',
  Configuration: new TextEncoder().encode(JSON.stringify(mockAppConfigContents)),
};
acMock.on(GetLatestConfigurationCommand).resolves(resp2);


describe('when instantiating core(config)', () => {

  it('should fetch initial conf on creation', async () => {
    expect(acMock.calls().length).toBe(0);
    const asession = await core(testConfig);
    expect(acMock.calls().length).toBe(2);
    expect(asession.contents()).toBe(mockAppConfigContents);
    asession.contents();
    asession.contents();
    expect(acMock.calls().length).toBe(2);
  });

  it('should throw exception for missing parameters', async () => {
    await expect(async () => {
      await core({
        applicationId: 'aaaaa',
        configurationProfileId: 'bbbb',
        environmentId: '',
      });
    }).rejects.toThrow();

    await expect(async () => {
      await core({
        applicationId: '',
        configurationProfileId: 'bbbb',
        environmentId: 'ccc',
      });
    }).rejects.toThrow();

    await expect(async () => {
      await core({
        applicationId: 'aaaaa',
        configurationProfileId: '',
        environmentId: 'ccc',
      });
    }).rejects.toThrow();
  });

});
