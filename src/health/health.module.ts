import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AthletesService } from 'src/athletes/athletes.service';
import { HealthController } from './health.controller';
import { WorldAthleticsHealthIndicator } from './worldathletics.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [WorldAthleticsHealthIndicator, AthletesService],
})
export class HealthModule {}
