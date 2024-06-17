import { Module } from '@nestjs/common';
import { AthletesModule } from './athletes/athletes.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry-interceptor/sentry-interceptor.interceptor';
import { CountriesModule } from './countries/countries.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DisciplinesModule } from './disciplines/disciplines.module';
import { AthleteRepresentativesModule } from './athlete_representatives/athlete_representatives.module';
import { GraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [
    AthletesModule,
    HealthModule,
    CountriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DisciplinesModule,
    AthleteRepresentativesModule,
    GraphqlModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
