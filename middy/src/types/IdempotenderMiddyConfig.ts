import { AppConfigerConfig } from '@appconfiger/core';

export type IdempotenderMiddyConfig = AppConfigerConfig & {
  keyJmespath?: string | null;
};
