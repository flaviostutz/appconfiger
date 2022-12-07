import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * AppConfiger configurations
 */
export type AppConfigerConfig = {

  /**
   * DynamoDB table name used for storing Executions
   * Defaults to 'IdempotencyExecutions'
   */
  dynamoDBTableName?: string;

};
