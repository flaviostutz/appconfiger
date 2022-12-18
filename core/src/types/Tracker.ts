import { Contents } from './Contents';

export interface Tracker {
  /**
   * Returns the latest value of configuration contents
   */
  contents(): Promise<Contents>;
}
