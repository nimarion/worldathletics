import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AthletesModule } from './athletes/athletes.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry-interceptor/sentry-interceptor.interceptor';
import { CountriesModule } from './countries/countries.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AthletesModule,
    CountriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
