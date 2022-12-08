/**
 * AppConfiger configurations
 */
export type AppConfigerConfig = {

  /**
   * Application Identifier of AppConfig. Required
   */
   applicationId: string;

  /**
   * Configuration Profile Identifier of AppConfig. Required
   */
   configurationProfileId: string;

  /**
   * Environment Identifier of AppConfig. Required
   */
   environmentId: string;

   /**
    * Time in seconds to keep polling for configuration updates
    * Defaults to 300 seconds
    */
   pollingInterval?: number;

};
