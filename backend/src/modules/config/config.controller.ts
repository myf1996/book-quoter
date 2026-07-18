import { Controller, Get } from '@nestjs/common';
import { AppConfig, ConfigService } from './config.service';

/**
 * Exposes the app feature-flag config to the frontend.
 * The frontend fetches this once on startup to enable/disable phases.
 */
@Controller('api')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /** GET /api/config — returns feature flags for all phases */
  @Get('config')
  getConfig(): AppConfig {
    return this.configService.getConfig();
  }
}
