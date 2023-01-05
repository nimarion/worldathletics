import { Controller, Injectable, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { WorldAthleticsHealthIndicator } from './worldathletics.health';

@Controller('health')
@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private worldAthleticsHealthIndicator: WorldAthleticsHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.worldAthleticsHealthIndicator.isHealthy('worldathletics'),
    ]);
  }
}
