import middy from '@middy/core';

export interface AppConfigerMiddleware extends middy.MiddlewareObj {

  /**
   * Stop polling configuration
   */
  stop(): void;
}
