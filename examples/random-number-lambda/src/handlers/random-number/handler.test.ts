import { handler } from './handler';

jest.mock('@middy/core', () => {
  return (hh: any): any => {
    hh.use = (): any => hh;
    return {
      use: jest.fn().mockReturnValue(hh),
    };
  };
});

describe('when calling random number', () => {
  it('should generate random number even without appconfig settings', async () => {
    const resp = await handler({}, {});
    expect(resp).toBeDefined();
    expect(resp.body).toBeDefined();
    const respBody = JSON.parse(resp.body);
    expect(respBody.number).toBeGreaterThanOrEqual(0);
    expect(respBody.number).toBeLessThanOrEqual(99999);
  });

  it('should generate random number with appconfig context settings', async () => {
    const resp = await handler(
      {},
      {
        appconfiger: {
          enableLambda: {
            enabled: true,
            minValue: 100000,
            maxValue: 200000,
          },
        },
      },
    );
    expect(resp).toBeDefined();
    expect(resp.body).toBeDefined();
    const respBody = JSON.parse(resp.body);
    expect(respBody.number).toBeGreaterThanOrEqual(100000);
    expect(respBody.number).toBeLessThanOrEqual(200000);
  });
});
