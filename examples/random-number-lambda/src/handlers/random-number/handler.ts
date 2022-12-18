import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import appConfigerMiddy from '@appconfiger/middy';

if (
  !process.env.APPCONFIG_APPLICATION_ID ||
  !process.env.APPCONFIG_CONFIGURATION_PROFILE_ID ||
  !process.env.APPCONFIG_ENVIRONMENT_ID
) {
  throw new Error(
    'ENVs APPCONFIG_APPLICATION_ID, APPCONFIG_ENVIRONMENT_ID and APPCONFIG_CONFIGURATION_PROFILE_ID are required',
  );
}

async function lambdaHandler(
  _event: APIGatewayProxyEvent | any,
  context: any,
): Promise<APIGatewayProxyResult> {
  console.log(JSON.stringify(context.appconfiger));

  let minValue = 0;
  if (typeof context.appconfiger?.enableLambda.minValue === 'number') {
    // eslint-disable-next-line prefer-destructuring
    minValue = context.appconfiger.enableLambda.minValue;
  }

  let maxValue = 99999;
  if (typeof context.appconfiger?.enableLambda.maxValue === 'number') {
    // eslint-disable-next-line prefer-destructuring
    maxValue = context.appconfiger.enableLambda.maxValue;
  }

  // prettier-ignore
  const number = Math.round(minValue + (Math.random() * (maxValue - minValue)));

  return {
    statusCode: 200,
    body: JSON.stringify({
      number,
      timestamp: new Date().toISOString(),
    }),
  };
}

export const handler = middy(lambdaHandler)
  .use(
    appConfigerMiddy({
      applicationId: `${process.env.APPCONFIG_APPLICATION_ID}`,
      configurationProfileId: `${process.env.APPCONFIG_CONFIGURATION_PROFILE_ID}`,
      environmentId: `${process.env.APPCONFIG_ENVIRONMENT_ID}`,
      pollingInterval: 15,
      featureFlag: 'enableLambda',
    }),
  )
  .use(jsonBodyParser())
  .use(httpHeaderNormalizer())
  .use(cors());
