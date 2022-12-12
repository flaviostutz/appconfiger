import { Contents } from './Contents';

export interface AppConfiger {

  /**
   * Returns the latest configuration available
   * The contents will be polled automatically according to
   * configuration parameter 'ttl'.
   * While the newer parameters are fetched, this data might be stale.
   */
  contents(): Contents;

  /**
   * Returns true if feature flag is enabled in AppConfig
   * @param name Name of the feature flag in AppConfig
   */
  featureFlagEnabled(name: string): boolean;

  /**
   * Returns the feature flag contents, including custom attribute if exists
   * Ex.:
   * {
   *   enabled: true,
   *   customAttr1: "sample attr1 value"
   * }
   * @param name Feature flag name
   */
  featureFlag(name: string): any;

  /**
   * Stop polling configuration
   */
  stop(): void;
}
