import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AthletesService } from 'src/athletes/athletes.service';
import { HealthController } from './health.controller';
import { WorldAthleticsHealthIndicator } from './worldathletics.health';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [WorldAthleticsHealthIndicator, AthletesService, GraphqlService],
})
export class HealthModule {}
