import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AthletesModule } from './athletes/athletes.module';
import { CountriesModule } from './countries/countries.module';
import { ConfigModule } from '@nestjs/config';
import { DisciplinesModule } from './disciplines/disciplines.module';
import { AthleteRepresentativesModule } from './athlete_representatives/athlete_representatives.module';
import { GraphqlModule } from './graphql/graphql.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { LoggerMiddleware } from './logger.middleware';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [
    AthletesModule,
    CountriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DisciplinesModule,
    AthleteRepresentativesModule,
    GraphqlModule,
    CompetitionsModule,
    RecordsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
