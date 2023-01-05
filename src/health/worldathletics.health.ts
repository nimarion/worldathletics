import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AthletesService } from 'src/athletes/athletes.service';

@Injectable()
export class WorldAthleticsHealthIndicator extends HealthIndicator {
  constructor(private readonly athletesService: AthletesService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const athlete = await this.athletesService.getAthlete(14193865);
    const isHealthy = athlete !== null && athlete.firstname === 'Richard';

    const result = this.getStatus(key, isHealthy);
    if (!isHealthy) {
      throw new HealthCheckError('Prisma is not healthy', result);
    }
    return result;
  }
}
