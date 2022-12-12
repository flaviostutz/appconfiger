import { Contents } from './Contents';

export interface Tracker {

  /**
   * Returns the latest value of configuration contents
   */
  contents(): Contents;

  /**
   * Stop polling configuration
   */
  stop(): void;
}
