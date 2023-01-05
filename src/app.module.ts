import { Module } from '@nestjs/common';
import { AthletesModule } from './athletes/athletes.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry-interceptor/sentry-interceptor.interceptor';
import { CountriesModule } from './countries/countries.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AthletesModule,
    HealthModule,
    CountriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
