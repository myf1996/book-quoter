import { Injectable } from '@nestjs/common';
import * as appConfig from '../../config/config.json';

export interface AppConfig {
  phases: {
    phase1CoreQuoter: boolean;
    phase2PricingEngine: boolean;
    phase3Authentication: boolean;
    phase4AdminPanel: boolean;
  };
  features: Record<string, unknown>;
}

/**
 * Serves the feature-flag config consumed by the frontend on startup.
 * Config is read from config.json — no database required.
 */
@Injectable()
export class ConfigService {
  /** @returns The current feature flag configuration */
  getConfig(): AppConfig {
    return appConfig as AppConfig;
  }
}
